import os
import multiprocessing

bind = "0.0.0.0:%s" % os.environ.get("PORT", "5000")


def _env_truthy(name):
    return os.environ.get(name, "").lower() in ("true", "1", "yes")


_testing = _env_truthy("SUPERDESK_TESTING")
_default_workers = 1 if _testing else (multiprocessing.cpu_count() * 2 + 1)

_wc = os.environ.get("WEB_CONCURRENCY", "").strip()
workers = int(_wc) if _wc else _default_workers

accesslog = "-"
access_log_format = "%(m)s %(U)s status=%(s)s time=%(T)ss size=%(B)sb"

reload = _env_truthy("SUPERDESK_RELOAD")

# Fail fast on hung requests; no longer tied to elastic reindex-on-500 (was 600s).
timeout = int(os.environ.get("WEB_TIMEOUT", 120))
graceful_timeout = int(os.environ.get("WEB_GRACEFUL_TIMEOUT", 30))
keepalive = int(os.environ.get("WEB_KEEPALIVE", 5))

# Recycle workers to contain slow memory growth under sustained traffic.
max_requests = int(os.environ.get("WEB_MAX_REQUESTS", 1000))
max_requests_jitter = int(os.environ.get("WEB_MAX_REQUESTS_JITTER", 50))

# Faster worker heartbeat on Linux Docker (falls back silently if unavailable).
_worker_tmp = os.environ.get("GUNICORN_WORKER_TMP_DIR", "/dev/shm")
if os.path.isdir(_worker_tmp):
    worker_tmp_dir = _worker_tmp
