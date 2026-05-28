import superdesk
from apps.auth import AuthResource
from liveblog.auth.db import AccessAuthService
from .reset_password import LiveBlogResetPasswordService
from liveblog.auth import emails as liveblog_emails

from apps.auth.db.reset_password import ResetPasswordResource, ActiveTokensResource
import apps.auth.db.reset_password as reset_password_module
import superdesk.emails as superdesk_emails_module
from apps.auth.db.change_password import ChangePasswordService, ChangePasswordResource

# Afrikaans Maroela templates + web2 /reset-password?token= links.
# Patch both module attr and superdesk.emails — ResetPasswordService imports the latter by name.
reset_password_module.send_reset_password_email = liveblog_emails.send_reset_password_email
superdesk_emails_module.send_reset_password_email = liveblog_emails.send_reset_password_email


def init_app(app):
    endpoint_name = "auth_db"
    service = AccessAuthService("auth", backend=superdesk.get_backend())
    AuthResource(endpoint_name, app=app, service=service)

    endpoint_name = "reset_user_password"
    service = LiveBlogResetPasswordService(
        endpoint_name, backend=superdesk.get_backend()
    )
    ResetPasswordResource(endpoint_name, app=app, service=service)

    endpoint_name = "change_user_password"
    service = ChangePasswordService(endpoint_name, backend=superdesk.get_backend())
    ChangePasswordResource(endpoint_name, app=app, service=service)

    endpoint_name = "active_tokens"
    service = superdesk.Service(endpoint_name, backend=superdesk.get_backend())
    ActiveTokensResource(endpoint_name, app=app, service=service)


superdesk.intrinsic_privilege("auth_db", method=["DELETE"])
