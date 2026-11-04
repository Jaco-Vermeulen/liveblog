# -*- coding: utf-8 -*-
"""Isolated tests for sync dispatch (no Superdesk TestCase / Docker)."""
import importlib.util
import sys
import types
import unittest
from pathlib import Path
from unittest.mock import MagicMock, patch


ROOT = Path(__file__).resolve().parents[3]


def _load_tasks_module():
    """Load tasks.py with lightweight stubs so Celery/Superdesk are not required."""
    if "liveblog.webhooks.tasks" in sys.modules:
        del sys.modules["liveblog.webhooks.tasks"]

    liveblog = types.ModuleType("liveblog")
    liveblog.__path__ = [str(ROOT / "liveblog")]
    sys.modules.setdefault("liveblog", liveblog)

    wh = types.ModuleType("liveblog.webhooks")
    wh.__path__ = [str(ROOT / "liveblog" / "webhooks")]
    sys.modules["liveblog.webhooks"] = wh

    payloads = types.ModuleType("liveblog.webhooks.payloads")

    def webhook_matches_event(webhook_action, event):
        if event not in ("created", "updated", "deleted"):
            return False
        if webhook_action == "post_all":
            return True
        return {
            "post_created": "created",
            "post_updated": "updated",
            "post_deleted": "deleted",
        }.get(webhook_action) == event

    payloads.webhook_matches_event = webhook_matches_event
    sys.modules["liveblog.webhooks.payloads"] = payloads

    delivery = types.ModuleType("liveblog.webhooks.delivery")
    delivery.post_webhook_payload = MagicMock(
        return_value={"ok": True, "status_code": 200}
    )
    sys.modules["liveblog.webhooks.delivery"] = delivery

    celery_mod = types.ModuleType("superdesk.celery_app")

    def celery_task(*_args, **_kwargs):
        def deco(fn):
            fn.delay = MagicMock()
            return fn

        if _args and callable(_args[0]) and not _kwargs:
            return deco(_args[0])
        return deco

    celery_mod.celery = types.SimpleNamespace(task=celery_task)
    superdesk = types.ModuleType("superdesk")
    superdesk.get_resource_service = MagicMock()
    sys.modules["superdesk"] = superdesk
    sys.modules["superdesk.celery_app"] = celery_mod

    requests_mod = types.ModuleType("requests")
    requests_mod.HTTPError = type("HTTPError", (Exception,), {})
    requests_mod.RequestException = type("RequestException", (Exception,), {})
    sys.modules["requests"] = requests_mod

    path = ROOT / "liveblog" / "webhooks" / "tasks.py"
    spec = importlib.util.spec_from_file_location("liveblog.webhooks.tasks", path)
    mod = importlib.util.module_from_spec(spec)
    sys.modules["liveblog.webhooks.tasks"] = mod
    spec.loader.exec_module(mod)
    return mod, delivery


class DispatchSyncTestCase(unittest.TestCase):
    def test_dispatch_posts_synchronously_like_test_button(self):
        mod, delivery = _load_tasks_module()
        post = {"_id": "post-1", "blog": "blog-1"}
        blog = {"_id": "blog-1"}
        webhook = {
            "_id": "hook-1",
            "enabled": True,
            "action": "post_all",
            "blog_id": None,
            "destination_url": "http://example/hook/",
        }

        webhooks_svc = MagicMock()
        webhooks_svc.get.return_value = [webhook]
        posts_svc = MagicMock()
        posts_svc.find_one.return_value = post
        blogs_svc = MagicMock()
        blogs_svc.find_one.return_value = blog

        def router(name):
            return {
                "webhooks": webhooks_svc,
                "posts": posts_svc,
                "blogs": blogs_svc,
                "client_blogs": blogs_svc,
            }[name]

        with patch("superdesk.get_resource_service", side_effect=router):
            mod.dispatch_post_webhooks("post-1", "created")

        delivery.post_webhook_payload.assert_called_once_with(
            webhook, post, blog=blog
        )
        mod.deliver_webhook.delay.assert_not_called()

    def test_dispatch_queues_celery_retry_on_connection_failure(self):
        mod, delivery = _load_tasks_module()
        delivery.post_webhook_payload.return_value = {
            "ok": False,
            "status_code": None,
            "error": "Connection failed: boom",
        }
        post = {"_id": "post-2", "blog": "blog-1"}
        webhook = {
            "_id": "hook-2",
            "enabled": True,
            "action": "post_created",
            "blog_id": "blog-1",
        }

        webhooks_svc = MagicMock()
        webhooks_svc.get.return_value = [webhook]
        posts_svc = MagicMock()
        posts_svc.find_one.return_value = post
        blogs_svc = MagicMock()
        blogs_svc.find_one.return_value = {"_id": "blog-1"}

        def router(name):
            return {
                "webhooks": webhooks_svc,
                "posts": posts_svc,
                "blogs": blogs_svc,
                "client_blogs": blogs_svc,
            }[name]

        with patch("superdesk.get_resource_service", side_effect=router):
            mod.dispatch_post_webhooks("post-2", "created")

        mod.deliver_webhook.delay.assert_called_once_with("hook-2", "post-2", "created")

    def test_single_action_webhook_skips_other_events(self):
        mod, delivery = _load_tasks_module()
        webhook = {
            "_id": "hook-3",
            "enabled": True,
            "action": "post_created",
            "blog_id": None,
        }
        webhooks_svc = MagicMock()
        webhooks_svc.get.return_value = [webhook]
        posts_svc = MagicMock()
        posts_svc.find_one.return_value = {"_id": "post-3", "blog": "blog-1"}
        blogs_svc = MagicMock()
        blogs_svc.find_one.return_value = {"_id": "blog-1"}

        def router(name):
            return {
                "webhooks": webhooks_svc,
                "posts": posts_svc,
                "blogs": blogs_svc,
                "client_blogs": blogs_svc,
            }[name]

        with patch("superdesk.get_resource_service", side_effect=router):
            mod.dispatch_post_webhooks("post-3", "updated")

        delivery.post_webhook_payload.assert_not_called()


if __name__ == "__main__":
    unittest.main()
