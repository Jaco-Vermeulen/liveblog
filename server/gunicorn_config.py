import os
import multiprocessing

bind = "0.0.0.0:%s" % os.environ.get("PORT", "5000")
_default_workers = 1 if os.environ.get("SUPERDESK_TESTING") else (multiprocessing.cpu_count() * 2 + 1)
workers = int(os.environ.get("WEB_CONCURRENCY", _default_workers))

accesslog = "-"
access_log_format = "%(m)s %(U)s status=%(s)s time=%(T)ss size=%(B)sb"

reload = os.environ.get("SUPERDESK_RELOAD", "").lower() in ("true", "1", "yes")

# Reindex-from-mongo on 500 can take several minutes on large datasets.
timeout = int(os.environ.get("WEB_TIMEOUT", 600))
