import unittest

from liveblog.syndication.utils import resolve_webhook_delivery_url


class WebhookDeliveryUrlTestCase(unittest.TestCase):
    def test_rewrites_localhost_to_docker_host(self):
        url = resolve_webhook_delivery_url("127.0.0.1:3000/api/webhooks/liveblog/nuus/")
        self.assertEqual(
            url, "http://host.docker.internal:3000/api/webhooks/liveblog/nuus/"
        )

    def test_leaves_remote_ip_unchanged(self):
        url = resolve_webhook_delivery_url("192.168.1.10:3000/hook/")
        self.assertEqual(url, "http://192.168.1.10:3000/hook/")
