# -*- coding: utf-8 -*-
from unittest.mock import MagicMock, patch

from apps.auth.errors import CredentialsAuthError
from superdesk.tests import TestCase

from liveblog.auth.db import AccessAuthService


class AccessAuthServiceTest(TestCase):
    def setUp(self):
        super().setUp()
        self.service = AccessAuthService("auth", backend=MagicMock())

    @patch.object(AccessAuthService, "disable_sd_desktop_notification")
    @patch.object(AccessAuthService, "_check_subscription_level")
    @patch("liveblog.auth.db.get_resource_service")
    def test_missing_stored_password_raises_credentials_error_not_attribute_error(
        self, mock_get_service, _check_sub, _disable_sd
    ):
        auth_users = MagicMock()
        auth_users.find_one.return_value = {"username": "invited", "password": None}
        mock_get_service.return_value = auth_users

        with self.assertRaises(CredentialsAuthError):
            self.service.authenticate(
                {"username": "invited", "password": "anything"}
            )

    @patch.object(AccessAuthService, "disable_sd_desktop_notification")
    @patch.object(AccessAuthService, "_check_subscription_level")
    @patch("liveblog.auth.db.get_resource_service")
    def test_missing_submitted_password_raises_credentials_error(
        self, mock_get_service, _check_sub, _disable_sd
    ):
        auth_users = MagicMock()
        auth_users.find_one.return_value = {
            "username": "invited",
            "password": b"$2b$12$hashed",
        }
        mock_get_service.return_value = auth_users

        with self.assertRaises(CredentialsAuthError):
            self.service.authenticate({"username": "invited", "password": None})
