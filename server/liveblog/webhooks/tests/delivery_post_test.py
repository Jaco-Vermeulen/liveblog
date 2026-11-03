import unittest
from unittest.mock import MagicMock, patch

from liveblog.webhooks.delivery import post_webhook_payload


class PostWebhookPayloadTestCase(unittest.TestCase):
    @patch("liveblog.webhooks.delivery.build_webhook_payload")
    @patch("liveblog.webhooks.delivery.resolve_webhook_delivery_url")
    @patch("liveblog.webhooks.delivery.requests.post")
    def test_ok_on_http_200_with_blog_key(
        self, mock_post, mock_resolve, mock_build
    ):
        mock_resolve.return_value = "https://example.com/hook"
        mock_build.return_value = {"data": {}}
        response = MagicMock()
        response.status_code = 200
        response.text = '{"ok": true, "blogKey": "verkiesing-2026"}'
        response.json.return_value = {"ok": True, "blogKey": "verkiesing-2026"}
        mock_post.return_value = response

        result = post_webhook_payload(
            {"_id": "w1", "destination_url": "example.com/hook", "data_format": "news_card"},
            {"_id": "p1"},
            blog={"title": "X"},
        )

        self.assertTrue(result["ok"])
        self.assertEqual(result["status_code"], 200)
        self.assertEqual(result["blogKey"], "verkiesing-2026")
        self.assertIsNone(result["error"])

    @patch("liveblog.webhooks.delivery.build_webhook_payload")
    @patch("liveblog.webhooks.delivery.resolve_webhook_delivery_url")
    @patch("liveblog.webhooks.delivery.requests.post")
    def test_not_ok_on_non_200(self, mock_post, mock_resolve, mock_build):
        mock_resolve.return_value = "https://example.com/hook"
        mock_build.return_value = {"data": {}}
        response = MagicMock()
        response.status_code = 500
        response.text = "boom"
        response.json.side_effect = ValueError("no json")
        mock_post.return_value = response

        result = post_webhook_payload(
            {"_id": "w1", "destination_url": "example.com/hook"},
            {"_id": "p1"},
        )

        self.assertFalse(result["ok"])
        self.assertEqual(result["status_code"], 500)
        self.assertIn("HTTP 500", result["error"])

    @patch("liveblog.webhooks.delivery.build_webhook_payload")
    @patch("liveblog.webhooks.delivery.resolve_webhook_delivery_url")
    @patch("liveblog.webhooks.delivery.requests.post")
    def test_connection_error(self, mock_post, mock_resolve, mock_build):
        import requests

        mock_resolve.return_value = "https://example.com/hook"
        mock_build.return_value = {"data": {}}
        mock_post.side_effect = requests.ConnectionError("refused")

        result = post_webhook_payload(
            {"_id": "w1", "destination_url": "example.com/hook"},
            {"_id": "p1"},
        )

        self.assertFalse(result["ok"])
        self.assertIsNone(result["status_code"])
        self.assertIn("Connection failed", result["error"])
