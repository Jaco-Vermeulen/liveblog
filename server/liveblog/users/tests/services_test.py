import unittest
from unittest.mock import MagicMock, patch

from liveblog.users.services import (
    reconcile_orphan_session_preferences,
    user_has_active_sessions,
)


class UserSessionPreferencesTest(unittest.TestCase):
    @patch("liveblog.users.services.get_resource_service")
    def test_user_has_active_sessions_true_when_auth_records_exist(self, mock_get_service):
        auth = MagicMock()
        auth.get.return_value.count.return_value = 2
        mock_get_service.return_value = auth

        self.assertTrue(user_has_active_sessions("user-1"))

    @patch("liveblog.users.services.get_resource_service")
    def test_user_has_active_sessions_false_when_no_auth_records(self, mock_get_service):
        auth = MagicMock()
        auth.get.return_value.count.return_value = 0
        mock_get_service.return_value = auth

        self.assertFalse(user_has_active_sessions("user-1"))

    @patch("liveblog.users.services.user_has_active_sessions", return_value=False)
    def test_reconcile_clears_stale_session_preferences(self, _has_sessions):
        user_service = MagicMock()
        user = {
            "_id": "user-1",
            "session_preferences": {"dead-session-id": {"desk:items": []}},
        }

        reconciled = reconcile_orphan_session_preferences(user_service, user)

        user_service.system_update.assert_called_once_with(
            "user-1",
            {"session_preferences": {}},
            user,
        )
        self.assertEqual(reconciled["session_preferences"], {})

    @patch("liveblog.users.services.user_has_active_sessions", return_value=True)
    def test_reconcile_keeps_session_preferences_when_auth_still_active(self, _has_sessions):
        user_service = MagicMock()
        prefs = {"live-session-id": {"desk:items": []}}
        user = {"_id": "user-1", "session_preferences": prefs}

        reconciled = reconcile_orphan_session_preferences(user_service, user)

        user_service.system_update.assert_not_called()
        self.assertEqual(reconciled["session_preferences"], prefs)

    def test_reconcile_noop_when_session_preferences_empty(self):
        user_service = MagicMock()
        user = {"_id": "user-1", "session_preferences": {}}

        reconciled = reconcile_orphan_session_preferences(user_service, user)

        user_service.system_update.assert_not_called()
        self.assertEqual(reconciled["session_preferences"], {})
