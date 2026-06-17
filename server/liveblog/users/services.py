import flask
from flask import current_app as app
from superdesk import get_resource_service
from superdesk.users.services import DBUsersService, is_sensitive_update


def user_has_active_sessions(user_id):
    """True when the auth collection still has a session for this user."""
    sessions = get_resource_service("auth").get(req=None, lookup={"user": user_id})
    return bool(sessions.count())


def reconcile_orphan_session_preferences(user_service, user):
    """
    Superdesk blocks role/user_type changes when session_preferences is non-empty.
    That dict can outlive real auth sessions (failed logout, session:gc, stale tabs).
    Clear it when no auth sessions remain so admins can update roles again.
    """
    if not user.get("session_preferences"):
        return user
    if user_has_active_sessions(user["_id"]):
        return user
    user_service.system_update(user["_id"], {"session_preferences": {}}, user)
    return {**user, "session_preferences": {}}


class LiveBlogUserService(DBUsersService):
    """
    Extends superdesk.users default app to add some additional functionality
    only concerning Live Blog, like hiding users' sensitive information for users
    that do not have enough permissions to do so.
    """

    def on_update(self, updates, original):
        if is_sensitive_update(updates):
            original = reconcile_orphan_session_preferences(self, original)
        super().on_update(updates, original)

    def on_fetched(self, document):
        super().on_fetched(document)

        for doc in document["_items"]:
            self.__hide_sensitive_data(doc)

    def on_fetched_item(self, doc):
        super().on_fetched_item(doc)
        self.__hide_sensitive_data(doc)

    def __hide_sensitive_data(self, doc):
        """Set default fields for users"""

        if flask.g.user["_id"] == doc["_id"]:
            return

        if app.config["HIDE_USERS_SENSITIVE_DATA"]:
            doc["email"] = "hidden"
            doc["first_name"] = "hidden"
