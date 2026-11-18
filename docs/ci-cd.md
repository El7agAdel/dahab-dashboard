# CI/CD and deployment

How the dashboard is checked, built and deployed to **production** at
**https://admin.dahabsweetseg.com**. It is served from **134.122.48.155**, the server that also runs
the API (`https://api.dahabsweetseg.com`) and the storefront (`https://dahabsweetseg.com`). The
backend's own pipeline is described in its repository's `CI-CD.md`; nothing here changes it.

| What         | Value                                                                        |
| ------------ | ---------------------------------------------------------------------------- |
| Repository   | `github.com/El7agAdel/dahab-dashboard`                                       |
| Server       | `134.122.48.155` (shared with the API and the storefront), user `dashboard`  |
| Deploy dir   | `/var/www/dahab-dashboard`                                                   |
| URL          | `https://admin.dahabsweetseg.com` (`http://` redirects to it)                |
| API it calls | `https://api.dahabsweetseg.com/api/v1`, set in `.env.production`             |

## How it works

```
Pull request ──────────► ci.yml
                          ├─ quality  oxlint + eslint · prettier · vue-tsc
                          ├─ unit     vitest
                          ├─ build    vite build (.env.production) · MSW is not in dist/
                          └─ audit    npm audit of the production dependencies (scripts/audit-prod.mjs)

Push to main ──────────► deploy.yml
                          ├─ ci       (re-runs every job above)
                          ├─ build    vite build --mode production → sha-<short-sha>.tar.gz (a run artifact)
                          └─ deploy   ssh → upload the tarball + deploy.sh → deploy.sh sha-<short-sha>
                                         ├─ unpack into releases/sha-<short-sha> and check it
                                         ├─ point `current` at it (one atomic rename)
                                         ├─ fetch https://admin.dahabsweetseg.com and compare it with the release
                                         └─ point `current` back if they differ
```

On the server, one Caddy serves all three:

```
https://admin.dahabsweetseg.com ──► /var/www/dahab-dashboard/current     (/etc/caddy/dahab-dashboard.caddy, from this repo)
                                     ├─ /assets/*  the file, cached for a year (names are content-hashed); missing → 404
                                     └─ anything else → the file, or index.html for app routes; revalidated on every load
https://api.dahabsweetseg.com   ──► the API                              (/etc/caddy/Caddyfile, from the backend's setup)
https://dahabsweetseg.com       ──► the storefront                       (/etc/caddy/dahab-storefront.caddy)
```

`http://` on each domain redirects to `https://`. Caddy gets and renews the certificates itself.

The dashboard is static files, so it runs no container and uses no memory on a droplet that has
little to spare (454 MB). A release takes about 2.5 MB of disk.

### Sharing the server with the API and the storefront

- **Its own Caddy file.** The backend's Caddyfile ends with `import /etc/caddy/*.caddy`, so the
  dashboard's file is picked up and survives the backend re-running its own setup. The API's and
  the storefront's sites are not edited. (On an older Caddyfile without that line, the setup adds an
  `import` line for the dashboard's file.)
- **Its own user, `dashboard`, outside the `docker` group.** This repository's deploy key can write
  to `/var/www/dahab-dashboard` and nothing else. It can't reach the containers, the database or the
  API's `.env`. The setup also closes the backend's `backups/` directory to other users.
- **Deploys restart and reload nothing.** Only the setup script touches Caddy, with a graceful
  reload. If the API stops answering through Caddy afterwards, the script puts the old config back.
- **No shared state.** It has its own deploy directory and its own GitHub concurrency group. It
  doesn't put Docker images or registry logins on the server.

### What `scripts/deploy.sh` guarantees

1. Refuses a release whose `index.html` is missing, or loads an `/assets/` file the release lacks.
2. Makes every file readable by Caddy, whatever the umask.
3. Switches with a single rename: a visitor gets the old build or the new one, never a mix.
4. Checks that `https://admin.dahabsweetseg.com` serves the new `index.html`. If not, it switches
   back to the previous release and exits non-zero, so the workflow shows red.
5. Keeps the newest 5 releases on the server, always including the live one and the one it
   replaced. Rolling back to any of them is instant and needs nothing from GitHub.

Releases are named after their commit (`sha-abc1234`). `readlink current` or `cat .release` shows
what's live.

---

## One-time setup

Do these in order. **Don't push to `main` before step 4**, because every push to `main` deploys,
and the deploy checks `https://admin.dahabsweetseg.com`, which only answers after step 2.

### 1. DNS

In the DNS of `dahabsweetseg.com` (GoDaddy), add an `A` record: name `admin`, value
`134.122.48.155`. Check it from your machine:

```sh
dig +short admin.dahabsweetseg.com     # must print 134.122.48.155
```

### 2. Prepare the server

This needs root SSH access to the server. The backend's `server-setup.sh` must already have run
(it installs Caddy and ufw, and serves the API).

```sh
scp scripts/server-setup.sh root@134.122.48.155:/root/dashboard-setup.sh
ssh root@134.122.48.155 'bash /root/dashboard-setup.sh'
```

The script:

- checks that `admin.dahabsweetseg.com` resolves to the server, and stops without changing anything
  if it doesn't (Caddy couldn't get a certificate);
- creates the `dashboard` user with root's SSH keys;
- creates `/var/www/dahab-dashboard` with `releases/` and `incoming/`;
- closes `/var/www/dahab-api/backups` to other users;
- adds the Caddy site for `admin.dahabsweetseg.com`, with the `http://` redirect and the caching
  and security headers listed under **The Caddy site**;
- reloads Caddy and prints what `https://admin.dahabsweetseg.com` answers.

It is safe to re-run. If the dashboard was served by IP before (`http://134.122.48.155:8080`), that
site is replaced, and the script prints the command that closes the port:
`ufw delete allow 8080/tcp`.

Until step 4 deploys a build from this repository, the domain serves whatever release `current`
already points at. A build made for `http://134.122.48.155/api/v1` can't sign in there, because an
HTTPS page can't call an `http://` API. Go straight on to steps 3 and 4.

### 3. SSH key for GitHub Actions

Use a key of its own rather than the backend's, so either repository's access can be revoked on its
own. Skip the `ssh-keygen` if you already have `~/.ssh/dahab_dashboard_deploy`:

```sh
ssh-keygen -t ed25519 -C "github-actions-dahab-dashboard" -f ~/.ssh/dahab_dashboard_deploy -N ""
ssh-copy-id -i ~/.ssh/dahab_dashboard_deploy.pub dashboard@134.122.48.155
ssh -i ~/.ssh/dahab_dashboard_deploy -o IdentitiesOnly=yes dashboard@134.122.48.155 'ls /var/www/dahab-dashboard'   # must work without a password
ssh-keyscan -p 22 134.122.48.155                                                                                    # output goes in SSH_KNOWN_HOSTS
```

`IdentitiesOnly=yes` makes the test use the new key alone. Without it, ssh can fall back to your
personal key and pass even when the new key isn't installed.

### 4. GitHub secrets and variables

Repository → **Settings → Secrets and variables → Actions**.

**Secrets**

| Secret            | Value                                                                   |
| ----------------- | ----------------------------------------------------------------------- |
| `SSH_PRIVATE_KEY` | the whole of `~/.ssh/dahab_dashboard_deploy`, including BEGIN/END lines |
| `SSH_KNOWN_HOSTS` | the full output of the `ssh-keyscan` above                              |
| `SSH_HOST`        | `134.122.48.155`                                                        |
| `SSH_USER`        | `dashboard`                                                             |

**Variables** (all optional)

| Variable         | Default                           | Set it when                          |
| ---------------- | --------------------------------- | ------------------------------------ |
| `PRODUCTION_URL` | `https://admin.dahabsweetseg.com` | the dashboard moves to another URL   |
| `DEPLOY_DIR`     | `/var/www/dahab-dashboard`        | you change the directory             |
| `SSH_PORT`       | `22`                              | SSH moves off 22                     |

Each deploy checks that `PRODUCTION_URL` serves the new build, from the server and from GitHub.
The `STAGING_URL` variable of the earlier staging setup is no longer read; delete it. If the secrets
still point at the old server (`167.71.141.187`), replace `SSH_HOST` and `SSH_KNOWN_HOSTS`: each
`known_hosts` line names the address it is for, so the old one fails with `Host key verification
failed`. The deploy key itself (`~/.ssh/dahab_dashboard_deploy`) already works on `134.122.48.155`.

### 5. First deploy

Push to `main` (or, once the workflow is on `main`, **Actions → Deploy to production → Run
workflow**). Open `https://admin.dahabsweetseg.com` when the run is green.

**Run workflow** has a **dry_run** box for a rehearsal: it uploads and checks the release but
switches nothing.

### 6. Branch protection (recommended)

Require the CI checks (**Lint, format, types**, **Unit tests**, **Build**, **Audit production
dependencies**) on `main`, so only green PRs merge. For a private repository, GitHub enforces this
only on a paid plan.

### What the dashboard needs from the backend

These live in the API's `/var/www/dahab-api/.env` (see the backend's `CI-CD.md`):

- `CORS_ORIGINS` must include `https://admin.dahabsweetseg.com` once it is no longer `*`, or every
  request fails in the browser.
- `STORAGE_BASE_URL` must be `https://api.dahabsweetseg.com/uploads`. Image URLs are built from it,
  and the CSP only lets the dashboard load images from the API's origin over HTTPS.

---

## Day-to-day

Open a PR and CI runs. Merging it to `main` runs CI again, then deploys to production.

**Build-time settings** live in `.env.production` and are compiled into the JavaScript, so they're
public: never put a secret there. Changing one means a new deploy.

**The audit** (`npm run audit:prod`) fails on any high or critical advisory in the production
dependencies, which also stops the deploy. An advisory with no fix the project can take goes in
`ALLOWED` in `scripts/audit-prod.mjs`, with the reason. Today there are two: Zod 3's
`GHSA-mrhx-c7xc-m3w5`, until the move to VeeValidate 5 and Zod 4, and picomatch's
`GHSA-fc5q-39xc-vjpf`, until a fixed release exists (it comes with Vue Router 5 and is not in the
browser bundle).

---

## On the server

```sh
ssh dashboard@134.122.48.155
cd /var/www/dahab-dashboard
readlink current          # what's live
cat .release.prev         # what it replaced
ls -1t releases           # what's still here, newest first
```

### Roll back

`deploy.sh` switches back on its own when the new release isn't served. To go back by hand:

```sh
./deploy.sh "$(cat .release.prev)"
./deploy.sh sha-abc1234            # any release still in releases/
```

Or run **Deploy to production** with the `release` input. A release that's no longer on the server is
rebuilt from its commit: re-run that commit's deploy run (GitHub allows re-runs for 30 days), or run
the workflow from a branch or tag at that commit.

### The Caddy site

`/etc/caddy/dahab-dashboard.caddy` is written by `scripts/server-setup.sh`. To change it, re-run the
script rather than editing the file. Its settings are environment variables: `SITE`, `API_ORIGIN`,
`CSP`, `DEPLOY_DIR`, `SKIP_DNS_CHECK`.

It sends `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`,
`Referrer-Policy`, `Permissions-Policy` and `X-Robots-Tag: noindex` on every response.

The CSP allows scripts, styles and fonts from the dashboard itself. Requests and images may also go
to `API_ORIGIN` (`https://api.dahabsweetseg.com`), which is the API and its `/uploads`. When the app
needs another origin (Sentry's ingest host, for example), re-run the script with a wider `CSP`:

```sh
CSP="default-src 'self'; ... connect-src 'self' https://api.dahabsweetseg.com https://*.ingest.sentry.io; ..." \
    bash /root/dashboard-setup.sh
```

### Moving the dashboard or the API

**To another domain for the dashboard:**

1. Point an `A` record for the new name at `134.122.48.155`.
2. On the server, as root: `SITE=admin.new-domain.example bash /root/dashboard-setup.sh`
3. Set the `PRODUCTION_URL` variable to the new URL, and add it to the backend's `CORS_ORIGINS`.

**To another API host:** re-run the setup with both origins first, so the live build keeps working
until the next one replaces it:

```sh
API_ORIGIN="https://api.dahabsweetseg.com https://api.new-domain.example" bash /root/dashboard-setup.sh
```

Then change `VITE_API_BASE_URL` in `.env.production`, deploy, and re-run the setup with the new
origin alone.

---

## Troubleshooting

**The setup stops at "resolves to ..., not to this server".** The `admin` record is missing or
hasn't spread yet. `dig +short admin.dahabsweetseg.com @ns25.domaincontrol.com` shows what GoDaddy
serves. The server may remember a "no such name" answer for up to 10 minutes.

**`https://admin.dahabsweetseg.com` has no certificate.** `journalctl -u caddy | grep -i acme` shows
why. Let's Encrypt must reach ports 80 and 443 (check a DigitalOcean cloud firewall, if there is
one), and the `A` record must point at the server.

**The dashboard disappeared after the backend's `server-setup.sh` ran.** The backend's Caddyfile
should end with `import /etc/caddy/*.caddy`. If it doesn't, re-run this repository's
`scripts/server-setup.sh`, which adds an import line.

**`Permission denied (publickey)`.** The Actions public key isn't in
`/home/dashboard/.ssh/authorized_keys`, or `SSH_PRIVATE_KEY` is missing its BEGIN/END lines.

**`Host key verification failed`.** `SSH_KNOWN_HOSTS` is empty or stale (e.g. the droplet was
rebuilt, or `SSH_HOST` changed). Re-run `ssh-keyscan` and update the secret.

**`deploy.sh` says the URL isn't serving the new release.** The script has already switched back.
Usual causes: the Caddy site is missing (the setup hasn't run), or `PRODUCTION_URL` points
somewhere else. On the server, `curl -I https://admin.dahabsweetseg.com/` should answer 200.

**The public check fails but `deploy.sh` passed.** The server serves the release, but GitHub's
runner can't reach it: DNS, or a firewall in front of the server.

**Sign-in fails with a network error.** Look at the browser console. A CORS error means the API's
`CORS_ORIGINS` doesn't include `https://admin.dahabsweetseg.com`. A CSP error means
`VITE_API_BASE_URL` and the setup's `API_ORIGIN` don't match.

**An open tab breaks right after a release.** The tab still runs the build it loaded, and the new
release doesn't contain that build's lazily loaded files. Reloading fixes it. The app can do this
on its own by listening for Vite's `vite:preloadError` event.

---

## Known gaps

- **Every push to `main` goes to production.** There is no staging and no approval gate. The plan is
  for production to deploy from version tags with a staging in front of it; neither exists yet. For
  a manual gate now, remove the `push: branches: [main]` trigger from `deploy.yml` and deploy with
  **Run workflow**.
- **Not in CI yet:** end-to-end tests and the bundle-size budget (Plan 1, Tasks 16 and 17), and the
  Sentry source-map upload (D21).
- **Cross-origin API.** The browser only lets the app read the response headers that the API lists
  in `Access-Control-Expose-Headers`. If the API sends `Retry-After`, the app can't see it until the
  backend adds it there, so the "try again in N minutes" message (D14) shows its version without
  minutes.
