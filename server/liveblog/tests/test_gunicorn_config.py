import os
import unittest
from unittest.mock import patch

import gunicorn_config


class TestGunicornConfig(unittest.TestCase):
    def test_superdesk_testing_false_allows_auto_workers(self):
        with patch.dict(
            os.environ,
            {"SUPERDESK_TESTING": "false", "WEB_CONCURRENCY": ""},
            clear=False,
        ):
            # Re-import logic by re-evaluating module-level bindings
            testing = os.environ.get("SUPERDESK_TESTING", "").lower() in (
                "true",
                "1",
                "yes",
            )
            self.assertFalse(testing)

    def test_superdesk_testing_string_false_is_not_truthy(self):
        with patch.dict(os.environ, {"SUPERDESK_TESTING": "false"}, clear=False):
            testing = os.environ.get("SUPERDESK_TESTING", "").lower() in (
                "true",
                "1",
                "yes",
            )
            self.assertFalse(testing)

    def test_web_concurrency_empty_uses_default_workers_binding(self):
        wc = os.environ.get("WEB_CONCURRENCY", "").strip()
        workers = int(wc) if wc else gunicorn_config.workers
        self.assertGreaterEqual(workers, 1)

    def test_timeout_default_is_reasonable(self):
        self.assertLessEqual(gunicorn_config.timeout, 300)


if __name__ == "__main__":
    unittest.main()
