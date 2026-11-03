import unittest
from unittest.mock import MagicMock, patch

from liveblog.webhooks.delivery import (
    post_webhook_payload,
    resolve_webhook_secret,
    webhook_auth_headers,
)


class WebhookAuthHeadersTestCase(unittest.TestCase):
    def test_both_headers_when_secret_provided(self):
        headers = webhook_auth_headers("shared-secret")
        self.assertEqual(
            headers,
            {
                "x-liveblog-secret": "shared-secret",
                "x-webhook-secret": "shared-secret",
            },
        )

    def test_empty_dict_when_secret_empty(self):
        self.assertEqual(webhook_auth_headers(""), {})
        self.assertEqual(webhook_auth_headers("   "), {})

    def test_empty_dict_when_secret_none_and_resolver_empty(self):
        with patch(
            "liveblog.webhooks.delivery.resolve_webhook_secret", return_value=None
        ):
            self.assertEqual(webhook_auth_headers(), {})

    @patch.dict("os.environ", {"LIVEBLOG_WEBHOOK_SECRET": "from-env"}, clear=False)
    def test_resolve_falls_back_to_environ_without_app(self):
        # No flask app context in this unit test → env fallback.
        self.assertEqual(resolve_webhook_secret(), "from-env")

    @patch.dict("os.environ", {"LIVEBLOG_WEBHOOK_SECRET": "  "}, clear=False)
    def test_resolve_whitespace_env_is_unset(self):
        self.assertIsNone(resolve_webhook_secret())


class PostWebhookPayloadTestCase(unittest.TestCase):
    @patch("liveblog.webhooks.delivery.webhook_auth_headers", return_value={})
    @patch("liveblog.webhooks.delivery.build_webhook_payload")
    @patch("liveblog.webhooks.delivery.resolve_webhook_delivery_url")
    @patch("liveblog.webhooks.delivery.requests.post")
    def test_ok_on_http_200_with_blog_key(
        self, mock_post, mock_resolve, mock_build, mock_auth
    ):
        mock_resolve.return_value = "https://example.com/hook"
        mock_build.return_value = {
            "blogKey": "verkiesing-2026",
            "placementTags": ["topstories", "sa-nuus"],
            "pageUri": "/regstreeks/verkiesing-2026/",
            "data": {},
        }
        response = MagicMock()
        response.status_code = 200
        response.text = (
            '{"ok": true, "blogKey": "verkiesing-2026", "placementTags": null}'
        )
        response.json.return_value = {
            "ok": True,
            "blogKey": "verkiesing-2026",
            "placementTags": None,
        }
        mock_post.return_value = response

        result = post_webhook_payload(
            {"_id": "w1", "destination_url": "example.com/hook", "data_format": "news_card"},
            {"_id": "p1"},
            blog={"title": "X"},
        )

        self.assertTrue(result["ok"])
        self.assertEqual(result["status_code"], 200)
        self.assertEqual(result["sent"]["placementTags"], ["topstories", "sa-nuus"])
        self.assertTrue(result["sent"]["hasPlacementTagsKey"])
        self.assertIsNone(result["received"]["placementTags"])
        self.assertIn('"placementTags": ["topstories", "sa-nuus"]', result["request_body"])
        self.assertIn("placementTags", result["response_body"])
        self.assertIsNone(result["error"])
        self.assertFalse(result["auth_headers_sent"])
        mock_post.assert_called_once()
        self.assertIsNone(mock_post.call_args.kwargs.get("headers"))

    @patch(
        "liveblog.webhooks.delivery.webhook_auth_headers",
        return_value={
            "x-liveblog-secret": "s3cret",
            "x-webhook-secret": "s3cret",
        },
    )
    @patch("liveblog.webhooks.delivery.build_webhook_payload")
    @patch("liveblog.webhooks.delivery.resolve_webhook_delivery_url")
    @patch("liveblog.webhooks.delivery.requests.post")
    def test_sends_secret_headers_when_configured(
        self, mock_post, mock_resolve, mock_build, mock_auth
    ):
        mock_resolve.return_value = "https://example.com/hook"
        mock_build.return_value = {"blogKey": "sa-nuus", "data": {}}
        response = MagicMock()
        response.status_code = 200
        response.text = '{"ok": true}'
        response.json.return_value = {"ok": True}
        mock_post.return_value = response

        result = post_webhook_payload(
            {"_id": "w1", "destination_url": "example.com/hook"},
            {"_id": "p1"},
        )

        self.assertTrue(result["ok"])
        self.assertTrue(result["auth_headers_sent"])
        kwargs = mock_post.call_args.kwargs
        self.assertEqual(
            kwargs["headers"],
            {
                "x-liveblog-secret": "s3cret",
                "x-webhook-secret": "s3cret",
            },
        )

    @patch("liveblog.webhooks.delivery.webhook_auth_headers", return_value={})
    @patch("liveblog.webhooks.delivery.build_webhook_payload")
    @patch("liveblog.webhooks.delivery.resolve_webhook_delivery_url")
    @patch("liveblog.webhooks.delivery.requests.post")
    def test_not_ok_on_non_200(self, mock_post, mock_resolve, mock_build, mock_auth):
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

    @patch("liveblog.webhooks.delivery.webhook_auth_headers", return_value={})
    @patch("liveblog.webhooks.delivery.build_webhook_payload")
    @patch("liveblog.webhooks.delivery.resolve_webhook_delivery_url")
    @patch("liveblog.webhooks.delivery.requests.post")
    def test_connection_error(self, mock_post, mock_resolve, mock_build, mock_auth):
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
