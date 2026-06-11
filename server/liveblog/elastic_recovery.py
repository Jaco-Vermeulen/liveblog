# -*- coding: utf-8; -*-
#
# Automatic Elasticsearch recovery when API responses are HTTP 500.
# Mongo is the source of truth; ES drift often causes list/query failures.

import logging
import threading
import time

logger = logging.getLogger(__name__)

_REINDEX_ENV_KEY = "liveblog.elastic_reindex_attempted"
_reindex_lock = threading.Lock()
_last_reindex_at = 0.0
REINDEX_COOLDOWN_SEC = 30


def run_index_from_mongo_all(flask_app):
    """Run ``manage.py app:index_from_mongo --all`` in-process."""
    global _last_reindex_at

    with _reindex_lock:
        now = time.time()
        if now - _last_reindex_at < REINDEX_COOLDOWN_SEC:
            logger.info(
                "elastic_recovery: skipping index_from_mongo --all (cooldown %.0fs)",
                REINDEX_COOLDOWN_SEC,
            )
            return

        from superdesk.commands.index_from_mongo import IndexFromMongo

        logger.warning("elastic_recovery: running index_from_mongo --all")
        with flask_app.app_context():
            IndexFromMongo().run(
                collection_name=None,
                all_collections=True,
                page_size=None,
                from_datetime=None,
            )
        _last_reindex_at = time.time()
        logger.info("elastic_recovery: index_from_mongo --all finished")


def _capture_wsgi_response(wsgi_app, environ):
    """Invoke WSGI app without sending headers to the client yet."""
    status_holder = []
    headers_holder = []

    def capture_start_response(status, response_headers, exc_info=None):
        status_holder.append(status)
        headers_holder.append(response_headers)
        return lambda data: None

    body = list(wsgi_app(environ, capture_start_response))
    status = status_holder[0] if status_holder else "500 Internal Server Error"
    headers = headers_holder[0] if headers_holder else []
    return status, headers, body


def _emit_wsgi_response(start_response, status, headers, body):
    write = start_response(status, headers)
    if write:
        for chunk in body:
            if chunk:
                write(chunk)
    return body


def install_elastic_recovery(app):
    """On HTTP 500, reindex from Mongo and transparently retry the request once."""
    if not app.config.get("ELASTIC_AUTO_REINDEX_ON_500", True):
        return

    original_wsgi = app.wsgi_app

    def elastic_recovery_wsgi(environ, start_response):
        if environ.get(_REINDEX_ENV_KEY):
            return original_wsgi(environ, start_response)

        status, headers, body = _capture_wsgi_response(original_wsgi, environ)
        status_code = int(status.split(" ", 1)[0])

        if status_code < 500:
            return _emit_wsgi_response(start_response, status, headers, body)

        path = environ.get("PATH_INFO", "")
        method = environ.get("REQUEST_METHOD", "")
        logger.warning(
            "elastic_recovery: HTTP %s on %s %s — reindexing from Mongo before retry",
            status_code,
            method,
            path,
        )

        environ[_REINDEX_ENV_KEY] = True
        try:
            run_index_from_mongo_all(app)
        except Exception:
            logger.exception("elastic_recovery: index_from_mongo --all failed")
            return _emit_wsgi_response(start_response, status, headers, body)

        return original_wsgi(environ, start_response)

    app.wsgi_app = elastic_recovery_wsgi
