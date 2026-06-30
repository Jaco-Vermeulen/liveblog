# Liveblog Docker

Everything is defined in [../docker-compose.yml](../docker-compose.yml).

## Run (production client)

```sh
docker compose up -d --build
```

Open http://localhost:9000 — **admin** / **admin** (React **client_web2** admin, nginx + static build)

No profiles, no extra flags, no manual `manage.py` or `npm` steps on the host.

**Deploy on server:** `git pull && docker compose up -d --build`

## Services

| Service | Role |
|---------|------|
| `redis`, `mongodb`, `elasticsearch` | Infrastructure |
| `init` | One-shot: seed DB, admin user, themes, ES index (skips if `data/.liveblog-initialized` exists) |
| `server` | `honcho` + Procfile-dev (API :5000, WS :5100, Celery) |
| `client` | **Production** — `npm run build` baked into image, nginx on :9000 (proxies `/api`, `/ws`, `/embed/`) |

Startup order: infra healthy → `init` completes → `server` healthy → `client` starts.

## Optional dev client (hot reload)

```sh
docker compose --profile dev up -d client-dev
```

Uses [Dockerfile.client.dev](Dockerfile.client.dev) — Vite dev server with volume-mounted `client_web2/`.

For host-only frontend dev: `cd client_web2 && npm run dev`.

## Commands

```sh
docker compose logs -f
docker compose down
docker compose run --rm -e LIVEBLOG_FORCE_INIT=1 init
docker compose build --no-cache server client
```

## Images

- [Dockerfile.server](Dockerfile.server) — Python 3.6, `pip install -r requirements.txt` at build
- [Dockerfile.client](Dockerfile.client) — Node 20 build → nginx alpine serves `dist/`
- [Dockerfile.client.dev](Dockerfile.client.dev) — optional Vite dev server
- [nginx-client.conf](nginx-client.conf) — SPA + API/WS reverse proxy inside client container

## Legacy admin

The AngularJS client in `client/` is **not** started by compose on `main`. For the old Grunt-based admin, use the `legacy` branch or run it manually (see [README-host-dev.md](../README-host-dev.md)).

## Host nginx (production deploy)

`deploy-liveblog.sh` terminates TLS and reverse-proxies:

- `/api`, `/embed/`, `/themes_uploads` → API :5000
- `/embed.js` → UI :9000 (static file in client image; API route also available)
- `/ws` → WebSocket :5100
- `/` → UI :9000 (static nginx client)
- `/themes_assets/` → static files from disk

The client image uses same-origin `/api` and `same-origin` WebSocket URLs so one build works on any public hostname.
