# -*- coding: utf-8; -*-
#
# Automatic Elasticsearch recovery when API responses are HTTP 500.
# Mongo is the source of truth; ES drift often causes list/query failures.

import logging
import os
import subprocess
import threading
import time

logger = logging.getLogger(__name__)

_REINDEX_ENV_KEY = "liveblog.elastic_reindex_attempted"
_RECOVERY_MARKER = "liveblog.elastic_recovery_installed"
_reindex_lock = threading.Lock()
_last_reindex_at = 0.0
REINDEX_COOLDOWN_SEC = 30
REINDEX_TIMEOUT_SEC = 600


def run_index_from_mongo_all(flask_app):
    """Run ``manage.py app:index_from_mongo --all`` on the server."""
    global _last_reindex_at

    with _reindex_lock:
        now = time.time()
        if now - _last_reindex_at < REINDEX_COOLDOWN_SEC:
            logger.info(
                "elastic_recovery: skipping index_from_mongo --all (cooldown %.0fs)",
                REINDEX_COOLDOWN_SEC,
            )
            return

        server_dir = flask_app.config.get("APP_ABSPATH") or os.path.dirname(
            os.path.dirname(os.path.abspath(__file__))
        )
        cmd = ["python3", "manage.py", "app:index_from_mongo", "--all"]
        logger.warning(
            "elastic_recovery: running %s (cwd=%s)", " ".join(cmd), server_dir
        )

        completed = subprocess.run(
            cmd,
            cwd=server_dir,
            timeout=REINDEX_TIMEOUT_SEC,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True,
        )
        if completed.stdout:
            for line in completed.stdout.splitlines():
                logger.info("elastic_recovery: %s", line.rstrip())

        if completed.returncode != 0:
            raise RuntimeError(
                "index_from_mongo --all failed with exit code {}".format(
                    completed.returncode
                )
            )

        _last_reindex_at = time.time()
        logger.info("elastic_recovery: index_from_mongo --all finished")


def _capture_wsgi_response(wsgi_app, environ):
    """Invoke WSGI app without sending headers to the client yet."""
    status_holder = []
    headers_holder = []
    error_holder = []

    def capture_start_response(status, response_headers, exc_info=None):
        status_holder.append(status)
        headers_holder.append(response_headers)
        return lambda data: None

    try:
        body = list(wsgi_app(environ, capture_start_response))
    except Exception:
        logger.exception("elastic_recovery: unhandled WSGI exception on first attempt")
        error_holder.append(True)
        body = []

    if error_holder or not status_holder:
        return "500 Internal Server Error", [], body

    return status_holder[0], headers_holder[0], body


def _emit_wsgi_response(start_response, status, headers, body):
    write = start_response(status, headers)
    if write:
        for chunk in body:
            if chunk:
                write(chunk)
    return body


def _should_recover(status_code, had_exception):
    return had_exception or status_code >= 500


def install_elastic_recovery(app):
    """On HTTP 500 or WSGI crash, reindex from Mongo and retry the request once."""
    if not app.config.get("ELASTIC_AUTO_REINDEX_ON_500", True):
        return

    original_wsgi = app.wsgi_app
    if getattr(original_wsgi, _RECOVERY_MARKER, False):
        return

    def elastic_recovery_wsgi(environ, start_response):
        if environ.get(_REINDEX_ENV_KEY):
            return original_wsgi(environ, start_response)

        status, headers, body = _capture_wsgi_response(original_wsgi, environ)
        status_code = int(status.split(" ", 1)[0])
        had_exception = not headers and status_code >= 500

        if not _should_recover(status_code, had_exception):
            return _emit_wsgi_response(start_response, status, headers, body)

        path = environ.get("PATH_INFO", "")
        method = environ.get("REQUEST_METHOD", "")
        logger.warning(
            "elastic_recovery: failure on %s %s (status=%s, exception=%s) "
            "— reindexing from Mongo before retry",
            method,
            path,
            status_code,
            had_exception,
        )

        environ[_REINDEX_ENV_KEY] = True
        try:
            run_index_from_mongo_all(app)
        except Exception:
            logger.exception("elastic_recovery: index_from_mongo --all failed")
            if had_exception:
                start_response(
                    "500 Internal Server Error",
                    [("Content-Type", "text/html; charset=utf-8")],
                )
                return body
            return _emit_wsgi_response(start_response, status, headers, body)

        try:
            return original_wsgi(environ, start_response)
        except Exception:
            logger.exception("elastic_recovery: retry still failed after reindex")
            start_response(
                "500 Internal Server Error",
                [("Content-Type", "text/html; charset=utf-8")],
            )
            return [b"<html><head><title>Internal Server Error</title></head>"
                    b"<body><h1><p>Internal Server Error</p></h1></body></html>"]

    elastic_recovery_wsgi.__name__ = "elastic_recovery_wsgi"
    setattr(elastic_recovery_wsgi, _RECOVERY_MARKER, True)
    app.wsgi_app = elastic_recovery_wsgi
