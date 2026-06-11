import unittest
from unittest.mock import MagicMock, patch

from liveblog.elastic_recovery import (
    REINDEX_COOLDOWN_SEC,
    _REINDEX_ENV_KEY,
    install_elastic_recovery,
    run_index_from_mongo_all,
)


class TestElasticRecovery(unittest.TestCase):
    def test_run_index_from_mongo_all_invokes_manage_py(self):
        flask_app = MagicMock()
        flask_app.config = {"APP_ABSPATH": "/opt/server"}
        completed = MagicMock(returncode=0, stdout="Indexing data\n")

        with patch("liveblog.elastic_recovery._last_reindex_at", 0.0):
            with patch(
                "liveblog.elastic_recovery.subprocess.run", return_value=completed
            ) as run_cmd:
                run_index_from_mongo_all(flask_app)

        run_cmd.assert_called_once()
        args, kwargs = run_cmd.call_args
        self.assertEqual(
            args[0],
            ["python3", "manage.py", "app:index_from_mongo", "--all"],
        )
        self.assertEqual(kwargs["cwd"], "/opt/server")

    def test_run_index_from_mongo_all_respects_cooldown(self):
        flask_app = MagicMock()

        with patch("liveblog.elastic_recovery.subprocess.run") as run_cmd:
            with patch("liveblog.elastic_recovery._last_reindex_at", 9999999999.0):
                run_index_from_mongo_all(flask_app)

        run_cmd.assert_not_called()

    def test_middleware_retries_once_after_500(self):
        calls = {"count": 0}

        def inner_wsgi(environ, start_response):
            calls["count"] += 1
            if calls["count"] == 1:
                start_response("500 Internal Server Error", [("Content-Type", "text/plain")])
                return [b"fail"]
            start_response("200 OK", [("Content-Type", "text/plain")])
            return [b"ok"]

        flask_app = MagicMock()
        flask_app.config = {"ELASTIC_AUTO_REINDEX_ON_500": True}
        flask_app.wsgi_app = inner_wsgi
        install_elastic_recovery(flask_app)

        environ = {}
        status_holder = []
        with patch("liveblog.elastic_recovery.run_index_from_mongo_all"):
            body = b"".join(
                flask_app.wsgi_app(
                    environ,
                    lambda status, headers, exc_info=None: status_holder.append(status),
                )
            )

        self.assertEqual(calls["count"], 2)
        self.assertEqual(status_holder[-1], "200 OK")
        self.assertEqual(body, b"ok")
        self.assertTrue(environ.get(_REINDEX_ENV_KEY))

    def test_middleware_retries_after_wsgi_exception(self):
        calls = {"count": 0}

        def inner_wsgi(environ, start_response):
            calls["count"] += 1
            if calls["count"] == 1:
                raise RuntimeError("elastic blew up")
            start_response("200 OK", [("Content-Type", "text/plain")])
            return [b"ok"]

        flask_app = MagicMock()
        flask_app.config = {"ELASTIC_AUTO_REINDEX_ON_500": True}
        flask_app.wsgi_app = inner_wsgi
        install_elastic_recovery(flask_app)

        status_holder = []
        with patch("liveblog.elastic_recovery.run_index_from_mongo_all"):
            body = b"".join(
                flask_app.wsgi_app(
                    {},
                    lambda status, headers, exc_info=None: status_holder.append(status),
                )
            )

        self.assertEqual(calls["count"], 2)
        self.assertEqual(status_holder[-1], "200 OK")
        self.assertEqual(body, b"ok")

    def test_middleware_returns_500_when_retry_still_fails(self):
        def inner_wsgi(environ, start_response):
            start_response("500 Internal Server Error", [("Content-Type", "text/plain")])
            return [b"still broken"]

        flask_app = MagicMock()
        flask_app.config = {"ELASTIC_AUTO_REINDEX_ON_500": True}
        flask_app.wsgi_app = inner_wsgi
        install_elastic_recovery(flask_app)

        with patch("liveblog.elastic_recovery.run_index_from_mongo_all"):
            status_holder = []
            body = b"".join(
                flask_app.wsgi_app(
                    {},
                    lambda status, headers, exc_info=None: status_holder.append(status),
                )
            )

        self.assertEqual(status_holder[-1], "500 Internal Server Error")
        self.assertEqual(body, b"still broken")

    def test_middleware_skipped_when_disabled(self):
        calls = {"count": 0}

        def inner_wsgi(environ, start_response):
            calls["count"] += 1
            start_response("500 Internal Server Error", [("Content-Type", "text/plain")])
            return [b"fail"]

        flask_app = MagicMock()
        flask_app.config = {"ELASTIC_AUTO_REINDEX_ON_500": False}
        flask_app.wsgi_app = inner_wsgi
        install_elastic_recovery(flask_app)

        status_holder = []
        body = b"".join(
            flask_app.wsgi_app(
                {},
                lambda status, headers, exc_info=None: status_holder.append(status),
            )
        )

        self.assertEqual(calls["count"], 1)
        self.assertEqual(status_holder[-1], "500 Internal Server Error")
        self.assertEqual(body, b"fail")

    def test_cooldown_constant_is_positive(self):
        self.assertGreater(REINDEX_COOLDOWN_SEC, 0)


if __name__ == "__main__":
    unittest.main()
