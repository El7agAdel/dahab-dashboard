#!/usr/bin/env bash
#
# Server-side staging deploy of the dashboard.
#
# Uploaded to the server by .github/workflows/deploy.yml and executed there.
# Can also be run by hand on the server:
#
#   ./deploy.sh sha-abc1234                # incoming/sha-abc1234.tar.gz, or releases/sha-abc1234 if it is still here
#   ./deploy.sh "$(cat .release.prev)"     # roll back to the previous release
#
# The dashboard is static files, served by the backend's Caddy straight from
# $DEPLOY_DIR/current (scripts/server-setup.sh adds that site). A release is one
# build's dist/, unpacked into releases/<name>, and deploying points the
# `current` symlink at it. The switch is a single rename, so a visitor gets the
# old build or the new one, never a mix. Nothing restarts: the API, its
# containers and Caddy itself are not touched.
#
# It keeps the newest $KEEP_RELEASES releases (~1.5 MB each), always including
# the live one and the one it replaced (.release.prev). Rolling back further than
# that means rebuilding the commit in CI.
#
set -euo pipefail

# Defaults to the directory this script lives in - CI uploads it into the deploy
# directory, so a manual ./deploy.sh on the server needs no extra environment.
DEPLOY_DIR="${DEPLOY_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)}"
KEEP_RELEASES="${KEEP_RELEASES:-5}"
# Where the served index.html is fetched from to confirm the switch. CI passes
# the public URL; the default is the :8080 site that scripts/server-setup.sh creates.
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:8080}"
# DRY_RUN=true unpacks and checks the release, but doesn't switch to it.
DRY_RUN="${DRY_RUN:-false}"

RELEASE="${1:-}"
if [[ ! "$RELEASE" =~ ^[A-Za-z0-9][A-Za-z0-9._-]*$ ]]; then
    echo "usage: $0 <release-name>    (e.g. sha-abc1234)" >&2
    exit 2
fi

cd "$DEPLOY_DIR"
mkdir -p releases incoming

TARGET="releases/$RELEASE"
TARBALL="incoming/$RELEASE.tar.gz"

# The release must have an index.html, and every build file it loads must be
# there, or the page would come up blank.
check_release() {
    local dir="$1" ref count=0 missing=0

    if [[ ! -s "$dir/index.html" ]]; then
        echo "FATAL: $dir has no index.html." >&2
        return 1
    fi

    while IFS= read -r ref; do
        count=$((count + 1))
        if [[ ! -f "$dir$ref" ]]; then
            echo "FATAL: index.html loads $ref, which is not in the release." >&2
            missing=1
        fi
    done < <(grep -oE '(src|href)="/assets/[^"]+"' "$dir/index.html" | sed -E 's/^(src|href)="//; s/"$//')

    if ((count == 0)); then
        echo "FATAL: $dir/index.html loads nothing from /assets/ - not a Vite build?" >&2
        return 1
    fi
    return "$missing"
}

unpack() {
    local partial="releases/.$RELEASE.partial"

    rm -rf "$partial"
    mkdir -p "$partial"
    if ! tar -xzf "$TARBALL" -C "$partial"; then
        rm -rf "$partial"
        echo "FATAL: could not unpack $TARBALL. Nothing was switched." >&2
        exit 1
    fi
    # Caddy runs as its own user, so everything must be world-readable whatever the umask
    chmod -R u=rwX,go=rX "$partial"

    if ! check_release "$partial"; then
        rm -rf "$partial"
        echo "FATAL: $TARBALL is not a complete build. Nothing was switched." >&2
        exit 1
    fi

    mv -T "$partial" "$TARGET"
    rm -f "$TARBALL"
}

# Atomic: the new symlink is created beside the old one, then renamed over it.
switch_to() {
    ln -sfn "releases/$1" .current.tmp
    mv -Tf .current.tmp current
}

# Caddy must now serve exactly this release's index.html.
check_served() {
    local url="${HEALTH_URL%/}/" served
    served="$(mktemp)"

    for _ in 1 2 3 4 5; do
        if curl -fsS --max-time 10 -o "$served" "$url" 2>/dev/null && cmp -s "$served" "releases/$1/index.html"; then
            rm -f "$served"
            return 0
        fi
        sleep 2
    done

    rm -f "$served"
    echo "$url is not serving the index.html of $1 ($(curl -sS -o /dev/null -w 'HTTP %{http_code}' --max-time 10 "$url" 2>&1))." >&2
    return 1
}

prune_releases() {
    local name

    ls -1t releases | tail -n +"$((KEEP_RELEASES + 1))" | while IFS= read -r name; do
        [[ "$name" == "$RELEASE" || "$name" == "$PREVIOUS" ]] && continue
        rm -rf "releases/$name"
        echo "    removed $name"
    done

    # Uploads that never got deployed (a run that failed before this script)
    find incoming -type f -name '*.tar.gz' -mmin +60 -delete
}

PREVIOUS="$(readlink current 2>/dev/null || true)"
PREVIOUS="${PREVIOUS#releases/}"

echo "==> Deploying $RELEASE"
echo "==> Rollback target if this fails: ${PREVIOUS:-none (first deploy)}"

unpacked=false
if [[ -d "$TARGET" ]]; then
    echo "==> $TARGET is already on the server, reusing it"
    if ! check_release "$TARGET"; then
        echo "FATAL: $TARGET is incomplete. Nothing was switched." >&2
        exit 1
    fi
elif [[ -f "$TARBALL" ]]; then
    echo "==> Unpacking $TARBALL"
    unpack
    unpacked=true
else
    echo "FATAL: neither $TARGET nor $TARBALL exists. Nothing was switched." >&2
    echo "       Releases on the server: $(ls -1t releases | tr '\n' ' ')" >&2
    exit 1
fi
echo "==> Release checked: index.html and every /assets/ file it loads are present"

if [[ "$DRY_RUN" == "true" || "$DRY_RUN" == "1" ]]; then
    # Leave the server as it was
    [[ "$unpacked" == "true" ]] && rm -rf "$TARGET"
    echo
    echo "==> DRY RUN - stopping here. Nothing was switched."
    echo "==> Currently live: ${PREVIOUS:-nothing}"
    echo "==> Re-run with dry_run unchecked to deploy for real."
    exit 0
fi

# Newest first in `ls -t`, which is what pruning keeps
touch "$TARGET"

echo "==> Switching current -> $TARGET"
switch_to "$RELEASE"

echo "==> Checking what $HEALTH_URL serves"
if check_served "$RELEASE"; then
    echo "$RELEASE" >.release
    [[ -n "$PREVIOUS" && "$PREVIOUS" != "$RELEASE" ]] && echo "$PREVIOUS" >.release.prev

    echo "==> Removing all but the newest $KEEP_RELEASES releases"
    prune_releases

    echo "==> Deploy succeeded: $RELEASE"
    exit 0
fi

echo "==> Deploy FAILED." >&2

if [[ -n "$PREVIOUS" && "$PREVIOUS" != "$RELEASE" && -d "releases/$PREVIOUS" ]]; then
    echo "==> Switching back to $PREVIOUS" >&2
    switch_to "$PREVIOUS"

    if check_served "$PREVIOUS"; then
        echo "==> Rollback succeeded. Staging is serving $PREVIOUS." >&2
    else
        echo "==> Staging is not serving $PREVIOUS either: Caddy, not the release, is the problem." >&2
        echo "    Is the dashboard's site in /etc/caddy? See docs/ci-cd.md, Troubleshooting." >&2
    fi
else
    echo "==> No previous release to switch back to. Is the dashboard's site in /etc/caddy?" >&2
    echo "    See docs/ci-cd.md, Troubleshooting." >&2
fi

exit 1
