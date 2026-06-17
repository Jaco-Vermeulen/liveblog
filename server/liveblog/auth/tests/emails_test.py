# -*- coding: utf-8 -*-
from unittest.mock import patch

from superdesk.tests import TestCase

from liveblog.auth.emails import (
    _email_trace_id,
    _logo_url,
    _reset_password_url,
    send_activate_account_email,
    send_reset_password_email,
)


class ResetPasswordEmailTest(TestCase):
    def test_reset_url_uses_web2_path_without_hash(self):
        with self.app.app_context():
            self.app.config["CLIENT_URL"] = "http://localhost:9001"
            url = _reset_password_url("test-token-abc")
            self.assertEqual(
                url, "http://localhost:9001/reset-password?token=test-token-abc"
            )

    def test_logo_url_uses_cdn_default(self):
        with self.app.app_context():
            self.assertIn("mcusercontent.com", _logo_url())
            self.assertTrue(_logo_url().endswith(".png"))

    def test_logo_url_env_override(self):
        with self.app.app_context():
            self.app.config["EMAIL_LOGO_URL"] = "https://example.com/logo.png"
            self.assertEqual(_logo_url(), "https://example.com/logo.png")

    def test_email_trace_id(self):
        trace = _email_trace_id("abc-123-xyz")
        self.assertTrue(trace.startswith("reset-"))

    @patch("liveblog.auth.emails.send_email")
    def test_send_uses_afrikaans_templates_with_logo_img(self, mock_send):
        with self.app.app_context():
            self.app.config["CLIENT_URL"] = "http://localhost:9000"
            self.app.config["APPLICATION_NAME"] = "Maroela Media Liveblog"
            self.app.config["MAIL_FROM"] = "geen-antwoord@maroelamedia.co.za"
            self.app.config["ADMINS"] = ["geen-antwoord@maroelamedia.co.za"]

            send_reset_password_email(
                {"email": "user@example.com", "token": "tok123"}, token_ttl=1
            )

            mock_send.delay.assert_called_once()
            kwargs = mock_send.delay.call_args[1]
            self.assertIn("Maroela Media", kwargs["subject"])
            self.assertIn("Herstel", kwargs["subject"])
            self.assertIn("/reset-password?token=tok123", kwargs["html_body"])
            self.assertIn("Stel wagwoord", kwargs["html_body"])
            self.assertIn("mcusercontent.com", kwargs["html_body"])
            self.assertNotIn("<svg", kwargs["html_body"])
            self.assertNotIn("cid:", kwargs["html_body"])
            self.assertIn("reset-tok123", kwargs["html_body"])
            self.assertNotIn("/#/reset-password", kwargs["html_body"])

    @patch("liveblog.auth.emails.send_email")
    @patch("liveblog.auth.emails.get_resource_service")
    def test_activate_account_email_uses_web2_url(self, mock_users_service, mock_send):
        mock_users_service.return_value.find_one.return_value = {
            "_id": "u1",
            "first_name": "Test",
            "username": "testuser",
            "email": "user@example.com",
        }
        with self.app.app_context():
            self.app.config["CLIENT_URL"] = "http://localhost:9000"
            self.app.config["APPLICATION_NAME"] = "Maroela Media Liveblog"
            self.app.config["ADMINS"] = ["geen-antwoord@maroelamedia.co.za"]

            send_activate_account_email(
                {"email": "user@example.com", "token": "activate-tok", "user": "u1"},
                activate_ttl=7,
            )

            mock_send.delay.assert_called_once()
            kwargs = mock_send.delay.call_args[1]
            self.assertIn("/reset-password?token=activate-tok", kwargs["html_body"])
            self.assertNotIn("/#/reset-password", kwargs["html_body"])
