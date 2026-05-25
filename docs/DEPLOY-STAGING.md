# Staging deploy (one script)

Fast path: push this repo to **your** Git remote, then on the Linux staging server paste and run a single script.

## 1. Push the repo

```bash
git push origin master   # repo: https://github.com/Jaco-Vermeulen/liveblog
```

## 2. On the staging server

```bash
# Copy scripts/deploy-liveblog-staging.sh.example to the server, rename, edit CONFIG
nano /root/deploy-liveblog.sh
chmod +x /root/deploy-liveblog.sh
sudo /root/deploy-liveblog.sh
```

The script will:

- Install Docker + Compose (optional, `INSTALL_DOCKER=true`)
- Clone or `git pull` into `INSTALL_DIR` (default `/opt/liveblog`)
- Write `.env` with your URLs, keys, and SMTP (`MAIL_*` — Mandrill by default in CONFIG)
- Run `docker compose up -d --build`

**Do not commit** your filled script — add only the `.example` to git. `scripts/deploy-liveblog-staging.sh` is gitignored.

## 3. URLs

By default URLs are built from `PUBLIC_HOST` and ports `9000` / `5000` / `5100`. If nginx terminates TLS on the same host, set `USE_HTTPS=true` and either:

- Put nginx in front and set `SUPERDESK_*` overrides in CONFIG to your public paths, or  
- Proxy to the compose ports and keep auto URLs with `USE_HTTPS=true`.

## 4. Re-run / update

```bash
sudo /root/deploy-liveblog.sh
```

Or manually:

```bash
cd /opt/liveblog && git pull && docker compose up -d --build
```

Default login after init: **admin** / **admin**.
