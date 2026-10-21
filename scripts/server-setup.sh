#!/usr/bin/env bash
#
# One-time preparation of the backend's server for the dashboard.
# Run as root on the server, after the backend's own scripts/server-setup.sh
# (it installs Caddy and ufw, which this relies on). It is safe to run again.
#
#   scp scripts/server-setup.sh root@167.71.141.187:/root/dashboard-setup.sh
#   ssh root@167.71.141.187 'bash /root/dashboard-setup.sh'
#
# What it does:
#   1. Creates the "dashboard" user with root's SSH keys. It is NOT in the docker
#      group: it can publish files to the deploy directory and nothing else.
#   2. Creates the deploy directory with releases/ and incoming/
#   3. Closes the backend's database dumps to other users (they were world-readable)
#   4. Firewall: opens the dashboard's port
#   5. Caddy: adds the dashboard as a site of its own in /etc/caddy/dahab-dashboard.caddy,
#      imported at the end of the Caddyfile. The API's site block is not edited.
#      If the new config doesn't validate, or the API stops answering through
#      Caddy after the (graceful) reload, the previous config is put back.
#
# Settings (environment variables):
#   DEPLOY_USER  default dashboard
#   DEPLOY_DIR   default /var/www/dahab-dashboard
#   SITE         default :8080 - set to a domain (staging-admin.example.com) for automatic HTTPS
#   API_ORIGIN   default http://167.71.141.187 - the backend's public origin, the one other
#                place the app may call and load images from (Content-Security-Policy)
#   CSP          default built from API_ORIGIN - the whole Content-Security-Policy header
#   BACKEND_DIR  default /var/www/dahab-api
#
set -euo pipefail

DEPLOY_USER="${DEPLOY_USER:-dashboard}"
DEPLOY_DIR="${DEPLOY_DIR:-/var/www/dahab-dashboard}"
SITE="${SITE:-:8080}"
API_ORIGIN="${API_ORIGIN:-http://167.71.141.187}"
CSP="${CSP:-default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob: $API_ORIGIN; font-src 'self'; connect-src 'self' $API_ORIGIN; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'}"
BACKEND_DIR="${BACKEND_DIR:-/var/www/dahab-api}"

CADDYFILE=/etc/caddy/Caddyfile
SITE_FILE=/etc/caddy/dahab-dashboard.caddy
IMPORT_LINE="import $SITE_FILE"

if [[ "$(id -u)" -ne 0 ]]; then
    echo "Run as root." >&2
    exit 1
fi

for cmd in caddy ufw curl; do
    if ! command -v "$cmd" >/dev/null; then
        echo "FATAL: $cmd is not installed. Run the backend's scripts/server-setup.sh first." >&2
        exit 1
    fi
done
if [[ ! -f "$CADDYFILE" ]] || ! systemctl is-active --quiet caddy; then
    echo "FATAL: Caddy is not running with $CADDYFILE, so the API isn't being served either." >&2
    echo "       Fix that first (journalctl -u caddy); this script only adds to a working setup." >&2
    exit 1
fi

echo "==> Deploy user '$DEPLOY_USER'"
if ! id "$DEPLOY_USER" >/dev/null 2>&1; then
    useradd --create-home --shell /bin/bash "$DEPLOY_USER"
fi
if id -nG "$DEPLOY_USER" | grep -qw docker; then
    echo "    WARNING: $DEPLOY_USER is in the docker group, which is root on this box." >&2
    echo "    It doesn't need it: gpasswd -d $DEPLOY_USER docker" >&2
fi

home="$(getent passwd "$DEPLOY_USER" | cut -d: -f6)"
install -d -m 700 -o "$DEPLOY_USER" -g "$DEPLOY_USER" "$home/.ssh"
touch "$home/.ssh/authorized_keys"
if [[ -f /root/.ssh/authorized_keys ]]; then
    # Let whoever can log in as root also log in as the deploy user
    while IFS= read -r key; do
        [[ -z "$key" ]] && continue
        grep -qxF "$key" "$home/.ssh/authorized_keys" || echo "$key" >>"$home/.ssh/authorized_keys"
    done </root/.ssh/authorized_keys
fi
chown "$DEPLOY_USER:$DEPLOY_USER" "$home/.ssh/authorized_keys"
chmod 600 "$home/.ssh/authorized_keys"

echo "==> Deploy directory $DEPLOY_DIR"
install -d -m 755 -o "$DEPLOY_USER" -g "$DEPLOY_USER" "$DEPLOY_DIR" "$DEPLOY_DIR/releases" "$DEPLOY_DIR/incoming"

echo "==> Backend database dumps"
if [[ -d "$BACKEND_DIR/backups" ]]; then
    # Without o+x on the directory, other users can't open the dumps whatever their own mode
    chmod o-rwx "$BACKEND_DIR/backups"
    echo "    $BACKEND_DIR/backups is closed to other users ($(stat -c %A "$BACKEND_DIR/backups"))"
else
    echo "    no $BACKEND_DIR/backups, skipping"
fi

echo "==> Firewall"
port=""
if [[ "$SITE" =~ :([0-9]+)$ ]]; then
    port="${BASH_REMATCH[1]}"
    ufw allow "$port/tcp"
else
    echo "    $SITE uses 80 and 443, already open"
fi

echo "==> Caddy"
# Browsers ignore HSTS over plain HTTP, so it is only sent once the site has a domain
hsts=""
if [[ "$SITE" != :* && "$SITE" != http://* ]]; then
    hsts='Strict-Transport-Security "max-age=31536000"'
fi

backup_dir="$(mktemp -d)"
cp -p "$CADDYFILE" "$backup_dir/Caddyfile"
[[ -f "$SITE_FILE" ]] && cp -p "$SITE_FILE" "$backup_dir/site"

restore_caddy() {
    cp -p "$backup_dir/Caddyfile" "$CADDYFILE"
    if [[ -f "$backup_dir/site" ]]; then
        cp -p "$backup_dir/site" "$SITE_FILE"
    else
        rm -f "$SITE_FILE"
    fi
}

api_status() {
    curl -s -o /dev/null -w '%{http_code}' --max-time 10 http://127.0.0.1/health || true
}

cat >"$SITE_FILE" <<EOF
# The Dahab dashboard (staging). Managed by scripts/server-setup.sh in the
# dahab-dashboard repository - re-run it to change. Imported at the end of
# $CADDYFILE; the API's site there is separate and unaffected.
$SITE {
	root * $DEPLOY_DIR/current
	encode zstd gzip

	header {
		Content-Security-Policy "$CSP"
		X-Content-Type-Options nosniff
		Referrer-Policy strict-origin-when-cross-origin
		Permissions-Policy "camera=(), microphone=(), geolocation=()"
		X-Robots-Tag noindex
		$hsts
	}

	# Build output. File names carry a content hash, so a file never changes
	# under its name. No index.html fallback here: a missing file is a 404.
	handle /assets/* {
		@exists file
		header @exists Cache-Control "public, max-age=31536000, immutable"
		file_server
	}

	# Everything else is the app: its routes get index.html, which is
	# revalidated on every load so a new release shows up straight away.
	handle {
		header Cache-Control no-cache
		try_files {path} /index.html
		file_server
	}

	log {
		output file /var/log/caddy/dahab-dashboard.log {
			roll_size 10mb
			roll_keep 5
		}
	}
}
EOF

if ! grep -qxF "$IMPORT_LINE" "$CADDYFILE"; then
    printf '\n# The dashboard, added by dahab-dashboard scripts/server-setup.sh\n%s\n' "$IMPORT_LINE" >>"$CADDYFILE"
fi

if ! caddy validate --config "$CADDYFILE" --adapter caddyfile; then
    restore_caddy
    echo "FATAL: the new Caddy config is invalid. The previous one is back; nothing was reloaded." >&2
    exit 1
fi

# `caddy validate` runs as root and opens the access logs while checking the
# config, which leaves new log files owned by root. The service runs as "caddy"
# and then can't open them, so hand the directory back before reloading.
install -d -o caddy -g caddy /var/log/caddy
chown -R caddy:caddy /var/log/caddy

api_before="$(api_status)"
# A reload that fails (e.g. the port is taken) leaves Caddy running the old config
reloaded=true
systemctl reload caddy || reloaded=false
sleep 2
api_after="$(api_status)"

if [[ "$reloaded" != "true" ]] || ! systemctl is-active --quiet caddy || [[ "$api_after" != "$api_before" ]]; then
    echo "FATAL: the reload failed, or the API now answers HTTP $api_after through Caddy (it was $api_before)." >&2
    echo "       Putting the previous config back." >&2
    restore_caddy
    systemctl reload caddy || systemctl restart caddy
    exit 1
fi
echo "    Caddy reloaded; the API still answers HTTP $api_after through it"
if [[ -n "$port" ]]; then
    echo "    The dashboard site answers HTTP $(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "http://127.0.0.1:$port/" || true) (404 until the first deploy)"
fi
rm -rf "$backup_dir"

echo
echo "==> Done."
echo "    Next: add the GitHub Actions public key to $home/.ssh/authorized_keys - see docs/ci-cd.md."
echo "    If the droplet also has a DigitalOcean cloud firewall, allow the dashboard's port there too."
