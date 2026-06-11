import unittest
from unittest.mock import MagicMock, patch

from liveblog.elastic_recovery import (
    REINDEX_COOLDOWN_SEC,
    _REINDEX_ENV_KEY,
    install_elastic_recovery,
    run_index_from_mongo_all,
)


class TestElasticRecovery(unittest.TestCase):
    def test_run_index_from_mongo_all_invokes_command(self):
        flask_app = MagicMock()
        command = MagicMock()

        with patch("liveblog.elastic_recovery._last_reindex_at", 0.0):
            with patch(
                "superdesk.commands.index_from_mongo.IndexFromMongo",
                return_value=command,
            ):
                run_index_from_mongo_all(flask_app)

        command.run.assert_called_once_with(
            collection_name=None,
            all_collections=True,
            page_size=None,
            from_datetime=None,
        )
        flask_app.app_context.assert_called_once()

    def test_run_index_from_mongo_all_respects_cooldown(self):
        flask_app = MagicMock()
        command = MagicMock()

        with patch(
            "superdesk.commands.index_from_mongo.IndexFromMongo",
            return_value=command,
        ) as index_cls:
            with patch("liveblog.elastic_recovery._last_reindex_at", 9999999999.0):
                run_index_from_mongo_all(flask_app)

        index_cls.assert_not_called()

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
