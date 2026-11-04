# -*- coding: utf-8 -*-
import importlib.util
import sys
import types
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]


def _load_payloads():
    """Load payloads helpers without requiring Superdesk at import time."""
    liveblog = types.ModuleType("liveblog")
    liveblog.__path__ = [str(ROOT / "liveblog")]
    sys.modules.setdefault("liveblog", liveblog)

    wh = types.ModuleType("liveblog.webhooks")
    wh.__path__ = [str(ROOT / "liveblog" / "webhooks")]
    sys.modules.setdefault("liveblog.webhooks", wh)

    # payloads.py imports these at module level — stub only what import needs.
    sys.modules.setdefault("bson", types.ModuleType("bson"))
    sys.modules["bson"].ObjectId = type("ObjectId", (), {})
    bson_errors = types.ModuleType("bson.errors")
    bson_errors.InvalidId = type("InvalidId", (Exception,), {})
    sys.modules["bson.errors"] = bson_errors

    superdesk = types.ModuleType("superdesk")
    superdesk.get_resource_service = lambda *_a, **_k: None
    sys.modules.setdefault("superdesk", superdesk)

    syn = types.ModuleType("liveblog.syndication")
    syn.__path__ = [str(ROOT / "liveblog" / "syndication")]
    sys.modules.setdefault("liveblog.syndication", syn)
    utils = types.ModuleType("liveblog.syndication.utils")
    utils.extract_creator_data = lambda *_a, **_k: {}
    utils.extract_post_items_data = lambda *_a, **_k: []
    sys.modules["liveblog.syndication.utils"] = utils

    path = ROOT / "liveblog" / "webhooks" / "payloads.py"
    name = "liveblog.webhooks.payloads_matching_test"
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    sys.modules[name] = mod
    spec.loader.exec_module(mod)
    return mod


class WebhookMatchesEventTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.payloads = _load_payloads()

    def test_post_all_matches_every_lifecycle_event(self):
        match = self.payloads.webhook_matches_event
        for event in ("created", "updated", "deleted"):
            self.assertTrue(match("post_all", event))

    def test_single_action_matches_only_its_event(self):
        match = self.payloads.webhook_matches_event
        self.assertTrue(match("post_created", "created"))
        self.assertFalse(match("post_created", "updated"))
        self.assertFalse(match("post_created", "deleted"))

        self.assertTrue(match("post_updated", "updated"))
        self.assertFalse(match("post_updated", "created"))

        self.assertTrue(match("post_deleted", "deleted"))
        self.assertFalse(match("post_deleted", "created"))

    def test_unknown_action_or_event_does_not_match(self):
        match = self.payloads.webhook_matches_event
        self.assertFalse(match("nope", "created"))
        self.assertFalse(match("post_all", "published"))
        self.assertFalse(match(None, "created"))


if __name__ == "__main__":
    unittest.main()
