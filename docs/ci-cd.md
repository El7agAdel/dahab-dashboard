# CI/CD and deployment

How the dashboard is checked, built and deployed to **staging**, on the backend's server at
**167.71.141.187**, next to the API that already runs there. The backend's own pipeline is
described in its repository's `CI-CD.md`; nothing here changes it.

| What         | Value                                                                  |
| ------------ | ---------------------------------------------------------------------- |
| Repository   | `github.com/omenway/dahab-dashboard`                                   |
| Server       | `167.71.141.187` (the backend's droplet), user `dashboard`             |
| Deploy dir   | `/var/www/dahab-dashboard`                                             |
| Staging URL  | `http://167.71.141.187:8080` (HTTP until a domain is pointed at it)    |
| API it calls | `http://167.71.141.187/api/v1`, set in `.env.staging`                  |

## How it works

```
Pull request ──────────► ci.yml
                          ├─ quality  oxlint + eslint · prettier · vue-tsc
                          ├─ unit     vitest
                          ├─ build    vite build · MSW is not in dist/
                          └─ audit    npm audit of the production dependencies

Push to main ──────────► deploy.yml
                          ├─ ci       (re-runs every job above)
                          ├─ build    vite build --mode staging → sha-<short-sha>.tar.gz (a run artifact)
                          └─ deploy   ssh → upload the tarball + deploy.sh → deploy.sh sha-<short-sha>
                                         ├─ unpack into releases/sha-<short-sha> and check it
                                         ├─ point `current` at it (one atomic rename)
                                         ├─ fetch index.html through Caddy and compare it with the release
                                         └─ point `current` back if they differ
```

On the server:

```
Internet ──► :80   Caddy ──► the API, exactly as before   (/etc/caddy/Caddyfile, from the backend's setup)
         └─► :8080 Caddy ──► /var/www/dahab-dashboard/current   (/etc/caddy/dahab-dashboard.caddy)
                              ├─ /assets/*  the file, cached for a year (names are content-hashed); missing → 404
                              └─ anything else → the file, or index.html for app routes; revalidated on every load
```

The dashboard is static files, so it runs no container. It adds nothing to the droplet's 458 MB of
memory, and a release takes about 1.5 MB of a disk with about 1.6 GB free.

### Sharing the server with the backend

- **Its own Caddy site on its own port.** The API's `:80` block is not edited. The Caddyfile gains
  one line at the end, `import /etc/caddy/dahab-dashboard.caddy`.
- **Its own user, `dashboard`, outside the `docker` group.** This repository's deploy key can write
  to `/var/www/dahab-dashboard` and nothing else. It can't reach the containers, the database or the
  API's `.env`. The setup also closes the backend's `backups/` directory to other users, because
  its dumps were world-readable.
- **Deploys restart and reload nothing.** Only the setup script touches Caddy, with a graceful
  reload. If the API stops answering through Caddy afterwards, the script puts the old config back.
- **No shared state.** It has its own deploy directory and its own GitHub concurrency group. It
  doesn't put Docker images or registry logins on the server.

### What `scripts/deploy.sh` guarantees

1. Refuses a release whose `index.html` is missing, or loads an `/assets/` file the release lacks.
2. Makes every file readable by Caddy, whatever the umask.
3. Switches with a single rename: a visitor gets the old build or the new one, never a mix.
4. Checks that Caddy serves the new `index.html`. If not, it switches back to the previous
   release and exits non-zero, so the workflow shows red.
5. Keeps the newest 5 releases on the server, always including the live one and the one it
   replaced. Rolling back to any of them is instant and needs nothing from GitHub.

Releases are named after their commit (`sha-abc1234`). `readlink current` or `cat .release` shows
what's live.

---

## One-time setup

Do these in order. **Don't push to `main` before step 3**, because every push to `main` deploys.

### 1. Prepare the server

This needs root SSH access to the droplet. The backend's `server-setup.sh` must already have run
(it has: Caddy, ufw and the API are up).

```sh
scp scripts/server-setup.sh root@167.71.141.187:/root/dashboard-setup.sh
ssh root@167.71.141.187 'bash /root/dashboard-setup.sh'
```

The script:

- creates the `dashboard` user with root's SSH keys;
- creates `/var/www/dahab-dashboard` with `releases/` and `incoming/`;
- closes `/var/www/dahab-api/backups` to other users;
- opens port 8080 in ufw;
- adds the Caddy site with the caching and security headers listed under **The Caddy site**.

It is safe to re-run. If the droplet also has a DigitalOcean cloud firewall, allow TCP 8080 there.

### 2. SSH key for GitHub Actions

Use a key of its own rather than the backend's, so either repository's access can be revoked on its
own:

```sh
ssh-keygen -t ed25519 -C "github-actions-dahab-dashboard" -f ~/.ssh/dahab_dashboard_deploy -N ""
ssh-copy-id -i ~/.ssh/dahab_dashboard_deploy.pub dashboard@167.71.141.187
ssh -i ~/.ssh/dahab_dashboard_deploy -o IdentitiesOnly=yes dashboard@167.71.141.187 'ls /var/www/dahab-dashboard'   # must work without a password
ssh-keyscan -p 22 167.71.141.187                                                                                    # output goes in SSH_KNOWN_HOSTS
```

`IdentitiesOnly=yes` makes the test use the new key alone. Without it, ssh can fall back to your
personal key and pass even when the new key isn't installed.

### 3. GitHub secrets and variables

Repository → **Settings → Secrets and variables → Actions**.

**Secrets**

| Secret            | Value                                                                   |
| ----------------- | ----------------------------------------------------------------------- |
| `SSH_PRIVATE_KEY` | the whole of `~/.ssh/dahab_dashboard_deploy`, including BEGIN/END lines |
| `SSH_KNOWN_HOSTS` | the full output of the `ssh-keyscan` above                              |
| `SSH_HOST`        | `167.71.141.187`                                                        |
| `SSH_USER`        | `dashboard`                                                             |

**Variables**

| Variable      | Value                        | Needed?                                                                    |
| ------------- | ---------------------------- | -------------------------------------------------------------------------- |
| `STAGING_URL` | `http://167.71.141.187:8080` | recommended: each deploy then checks that this URL serves the new build    |
| `DEPLOY_DIR`  | `/var/www/dahab-dashboard`   | only if you change the directory                                           |
| `SSH_PORT`    | `22`                         | only if SSH moves off 22                                                   |

### 4. First deploy

GitHub only offers **Run workflow** once the workflow file is on `main`, so the first deploy is the
merge that brings it there. Open the pull request first: CI runs on it and shows the checks are
green. Merging it then deploys. Open `http://167.71.141.187:8080` when the run is green.

From then on, **Actions → Deploy to staging → Run workflow** is available. Tick **dry_run** for a
rehearsal: it uploads and checks the release but switches nothing.

### 5. Branch protection (recommended)

Require the CI checks (**Lint, format, types**, **Unit tests**, **Build**, **Audit production
dependencies**) on `main`, so only green PRs merge. For a private repository, GitHub enforces this
only on a paid plan.

---

## Day-to-day

Open a PR and CI runs. Merging it to `main` runs CI again, then deploys to staging.

**Build-time settings** for staging live in `.env.staging` and are compiled into the JavaScript, so
they're public: never put a secret there. Changing one means a new deploy.

---

## On the server

```sh
ssh dashboard@167.71.141.187
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

Or run **Deploy to staging** with the `release` input. A release that's no longer on the server is
rebuilt from its commit: re-run that commit's deploy run (GitHub allows re-runs for 30 days), or run
the workflow from a branch or tag at that commit.

### The Caddy site

`/etc/caddy/dahab-dashboard.caddy` is written by `scripts/server-setup.sh`. To change it, re-run the
script rather than editing the file. Its settings are environment variables: `SITE`, `API_ORIGIN`,
`CSP`, `DEPLOY_DIR`.

It sends `Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`
and `X-Robots-Tag: noindex` on every response. It adds `Strict-Transport-Security` once the site has
a domain.

The CSP allows scripts, styles and fonts from the dashboard itself. Requests and images may also go
to `API_ORIGIN`, which is the API and its `/uploads`. When the app needs another origin (Sentry's
ingest host, for example), re-run the script with a wider `CSP`:

```sh
CSP="default-src 'self'; ... connect-src 'self' http://167.71.141.187 https://*.ingest.sentry.io; ..." \
    bash /root/dashboard-setup.sh
```

### Adding a domain and HTTPS

1. Point an `A` record (e.g. `staging-admin.dahabsweets.com`) at `167.71.141.187`.
2. On the server, as root:

   ```sh
   SITE=staging-admin.dahabsweets.com bash /root/dashboard-setup.sh   # Caddy gets a certificate
   ufw delete allow 8080/tcp                                           # the port is no longer used
   ```

3. Set the `STAGING_URL` variable to the new URL.
4. An HTTPS page can't call an `http://` API. Before step 2, the API needs HTTPS too (see the
   backend's `CI-CD.md`). Then update `VITE_API_BASE_URL` in `.env.staging`, re-run the script with
   `API_ORIGIN=https://<api domain>`, and redeploy.
5. Add the dashboard's origin to the backend's `CORS_ORIGINS` if it's no longer `*`.

---

## Troubleshooting

**The dashboard disappeared after the backend's `server-setup.sh` ran.** That script rewrites
`/etc/caddy/Caddyfile` from scratch, which drops the `import` line. Re-run this repository's
`scripts/server-setup.sh`.

**`Permission denied (publickey)`.** The Actions public key isn't in
`/home/dashboard/.ssh/authorized_keys`, or `SSH_PRIVATE_KEY` is missing its BEGIN/END lines.

**`Host key verification failed`.** `SSH_KNOWN_HOSTS` is empty or stale (e.g. the droplet was
rebuilt). Re-run `ssh-keyscan` and update the secret.

**`deploy.sh` says the URL isn't serving the new release.** The script has already switched back.
Usual causes: the Caddy site is missing (the setup hasn't run, or the import line was dropped, see
above), or `STAGING_URL` points somewhere else. On the server, `curl -I http://127.0.0.1:8080/`
should answer 200.

**The public check fails but `deploy.sh` passed.** The server serves the release, but the runner
can't reach it. Port 8080 is blocked outside the server, usually by a DigitalOcean cloud firewall.

**An open tab breaks right after a release.** The tab still runs the build it loaded, and the new
release doesn't contain that build's lazily loaded files. Reloading fixes it. The app can do this
on its own by listening for Vite's `vite:preloadError` event.

---

## Known gaps

- **Staging only.** The plan is for production to deploy from version tags to a production
  backend, and that backend doesn't exist yet. When it does, this server becomes the backend's
  staging as well.
- **No approval gate.** As with the backend, a green run on `main` goes straight to staging.
- **HTTP only** until a domain points at the server.
- **Not in CI yet:** end-to-end tests and the bundle-size budget (Plan 1, Tasks 16 and 17), and the
  Sentry source-map upload (D21).
- **Cross-origin API.** The browser only lets the app read the response headers that the API lists
  in `Access-Control-Expose-Headers`. If the API sends `Retry-After`, the app can't see it until the
  backend adds it there, so the "try again in N minutes" message (D14) shows its version without
  minutes.
