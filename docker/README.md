# Liveblog Docker

Everything is defined in [../docker-compose.yml](../docker-compose.yml).

## Run

```sh
docker compose up -d
```

Open http://localhost:9000 — **admin** / **admin** (React **client_web2** admin)

No profiles, no extra flags, no manual `manage.py` or `npm` steps on the host.

## Services

| Service | Role |
|---------|------|
| `redis`, `mongodb`, `elasticsearch` | Infrastructure |
| `init` | One-shot: seed DB, admin user, themes, ES index (skips if `data/.liveblog-initialized` exists) |
| `server` | `honcho` + Procfile-dev (API :5000, WS :5100) |
| `client` | Vite dev server for `client_web2` (:9000) |

Startup order: infra healthy → `init` completes → `server` healthy → `client` starts.

## Commands

```sh
docker compose logs -f
docker compose down
docker compose run --rm -e LIVEBLOG_FORCE_INIT=1 init
docker compose build --no-cache server client
```

## Images

- [Dockerfile.server](Dockerfile.server) — Python 3.6, `pip install -r requirements.txt` at build
- [Dockerfile.client](Dockerfile.client) — Node 20, `client_web2` (`npm ci` at build when `package-lock.json` is present)

## Legacy admin

The AngularJS client in `client/` is **not** started by compose on `main`. For the old Grunt-based admin, use the `legacy` branch or run it manually (see [README-host-dev.md](../README-host-dev.md)).

## Nginx (not used by compose)

`docker compose up` does **not** use nginx. The UI, API, and WebSocket are exposed directly on ports 9000, 5000, and 5100.

`nginx.conf`, `superdesk_vhost.conf`, and `start.sh` were restored from git for the legacy root [Dockerfile](../Dockerfile) (production single-container setup). That root image is deprecated and is **not** built or run by compose.
