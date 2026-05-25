# Liveblog
[Download](https://github.com/liveblog/liveblog/archive/master.zip) •
[Fork](https://github.com/liveblog/liveblog) •
[License](https://github.com/liveblog/liveblog/blob/master/LICENSE) •
[Documentation](http://sourcefabric.booktype.pro/live-blog-30-for-journalists/what-is-live-blog/) •
*Version 3.91.1*

[![Liveblog CI](https://github.com/liveblog/liveblog/workflows/Liveblog%20CI/badge.svg)](https://github.com/liveblog/liveblog/actions)

[![Lint](https://github.com/liveblog/liveblog/actions/workflows/lint.yml/badge.svg)](https://github.com/liveblog/liveblog/actions/workflows/lint.yml)

## Liveblog Setup (Docker)

**One command.** Builds images, starts databases, seeds data, runs API + workers + WebSocket + frontend.

### Requirements

- [Docker Engine](https://docs.docker.com/engine/install/) 20.10+ with **Compose V2** (`docker compose`)

```sh
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

### Run

From the repository root:

```sh
docker compose up -d
```

First run builds images and can take **15–30 minutes**. Open **http://localhost:9000** — login **admin** / **admin**

| Service | URL |
|---------|-----|
| UI | http://localhost:9000 |
| API | http://localhost:5000/api |
| WebSocket | ws://localhost:5100 |

### What `docker compose up` does automatically

| Step | Where |
|------|--------|
| Redis, MongoDB, Elasticsearch | compose |
| `pip install -r requirements.txt` | server image build |
| `app:initialize_data` | init |
| `users:create` (admin) | init |
| `register_local_themes` | init |
| Elasticsearch index + rebuild | init |
| `honcho` (gunicorn, wamp, celery, beat) | server |
| `npm ci` + `grunt server` | client |

No profiles. No manual pyenv, pip, manage.py, honcho, npm, or grunt on the host.

### Useful commands

```sh
docker compose logs -f
docker compose down
docker compose up -d --build    # after requirements.txt or package-lock.json changes
docker compose run --rm -e LIVEBLOG_FORCE_INIT=1 init
```

See [docker/README.md](docker/README.md).

### Staging server (one script)

Copy [scripts/deploy-liveblog-staging.sh.example](scripts/deploy-liveblog-staging.sh.example) to your server, fill in CONFIG (repo URL, host, keys), run as root. See [docs/DEPLOY-STAGING.md](docs/DEPLOY-STAGING.md).

##### Amazon S3

For S3 asset storage see [AMAZON-S3-PUBLISHED-URL.MD](AMAZON-S3-PUBLISHED-URL.MD).

### Testing

```sh
cd server
behave --format progress2 --logging-level ERROR features/syndication.feature
```

### Production frontend

```shell
cd client
grunt build --force
grunt connect:build
```

### Optional: host development

See [README-host-dev.md](README-host-dev.md).
