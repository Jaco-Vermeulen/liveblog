import liveblog.blogs as blogs
import liveblog.core as core
import liveblog.posts as posts
import liveblog.webhooks as webhooks
import superdesk.users as users_app
from unittest.mock import patch

from bson import ObjectId
from superdesk import get_resource_service
from superdesk.tests import TestCase
from liveblog.common import run_once


class WebhooksModuleTestCase(TestCase):
  @run_once
  def setup_test_case(self):
    test_config = {
      "LIVEBLOG_DEBUG": True,
      "EMBED_PROTOCOL": "http://",
      "CORS_ENABLED": False,
      "DEBUG": False,
    }
    self.app.config.update(test_config)

    for lb_app in [core, blogs, posts, webhooks, users_app]:
      lb_app.init_app(self.app)

    self.client = self.app.test_client()

  def setUp(self):
    self.setup_test_case()
    self.webhooks_service = get_resource_service("webhooks")

  def test_create_and_list_webhook(self):
    blog_id = ObjectId()
    webhook_id = self.webhooks_service.post(
      [
        {
          "name": "News card hook",
          "destination_url": "http://localhost:9999/webhook/",
          "action": "post_created",
          "blog_id": blog_id,
          "data_format": "news_card",
          "enabled": True,
        }
      ]
    )[0]

    webhook = self.webhooks_service.find_one(req=None, _id=webhook_id)
    self.assertEqual(webhook["name"], "News card hook")
    self.assertEqual(webhook["action"], "post_created")
    self.assertEqual(webhook["data_format"], "news_card")
    self.assertTrue(webhook["enabled"])

  @patch("liveblog.webhooks.tasks.deliver_webhook.delay")
  def test_dispatch_post_webhooks_filters_by_action_and_blog(self, mock_delay):
    from unittest.mock import MagicMock, patch

    blog_a = ObjectId()
    blog_b = ObjectId()
    post_id = ObjectId()

    posts_service = MagicMock()
    posts_service.find_one.return_value = {"_id": post_id, "blog": blog_a}

    webhook_match = self.webhooks_service.post(
      [
        {
          "name": "Match",
          "destination_url": "http://localhost:9999/webhook/",
          "action": "post_created",
          "blog_id": blog_a,
          "data_format": "news_card",
          "enabled": True,
        }
      ]
    )[0]
    self.webhooks_service.post(
      [
        {
          "name": "Wrong blog",
          "destination_url": "http://localhost:9999/other/",
          "action": "post_created",
          "blog_id": blog_b,
          "data_format": "news_card",
          "enabled": True,
        },
        {
          "name": "Disabled",
          "destination_url": "http://localhost:9999/disabled/",
          "action": "post_created",
          "data_format": "news_card",
          "enabled": False,
        },
      ]
    )

    original_get = get_resource_service

    def service_router(name):
      if name == "posts":
        return posts_service
      return original_get(name)

    from liveblog.webhooks.tasks import dispatch_post_webhooks

    with patch("superdesk.get_resource_service", side_effect=service_router):
      dispatch_post_webhooks(post_id, "created")

    mock_delay.assert_called_once_with(webhook_match, post_id, "created")

  @patch("liveblog.webhooks.tasks.deliver_webhook.delay")
  @patch("liveblog.webhooks.test_delivery.resolve_webhook_test_post")
  def test_queue_webhook_test(self, mock_resolve, mock_delay):
    from liveblog.webhooks.test_delivery import queue_webhook_test

    webhook_id = self.webhooks_service.post(
      [
        {
          "name": "Test hook",
          "destination_url": "http://127.0.0.1:3000/hook/",
          "action": "post_updated",
          "data_format": "news_card",
          "enabled": True,
        }
      ]
    )[0]
    post_id = "urn:newsml:localhost:test-post"
    mock_resolve.return_value = (post_id, None)

    result, error, status = queue_webhook_test(webhook_id)
    self.assertIsNone(error)
    self.assertEqual(status, 202)
    self.assertTrue(result["queued"])
    self.assertEqual(result["post_id"], post_id)
    self.assertEqual(result["action"], "updated")
    mock_delay.assert_called_once_with(webhook_id, post_id, "updated")

  def test_queue_webhook_test_no_posts(self):
    from liveblog.webhooks.test_delivery import queue_webhook_test

    webhook_id = self.webhooks_service.post(
      [
        {
          "name": "Empty hook",
          "destination_url": "http://127.0.0.1:3000/hook/",
          "action": "post_created",
          "data_format": "news_card",
          "enabled": True,
        }
      ]
    )[0]

    with patch(
      "liveblog.webhooks.test_delivery.resolve_webhook_test_post",
      return_value=(None, "No published posts found."),
    ):
      result, error, status = queue_webhook_test(webhook_id)

    self.assertIsNone(result)
    self.assertEqual(status, 404)
    self.assertIn("No published posts", error)

  def test_test_webhook_route_requires_auth(self):
    response = self.client.post("/api/webhooks/000000000000000000000000/test")
    self.assertIn(response.status_code, (401, 403))
