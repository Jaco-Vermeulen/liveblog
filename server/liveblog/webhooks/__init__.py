import superdesk

from liveblog.webhooks.resource import WebhooksResource, WebhooksService
from liveblog.webhooks.routes import webhooks_blueprint
from liveblog.webhooks.tasks import deliver_webhook, dispatch_post_webhooks

__all__ = ["deliver_webhook", "dispatch_post_webhooks", "webhooks_blueprint"]


def init_app(app):
    endpoint_name = "webhooks"
    service = WebhooksService(endpoint_name, backend=superdesk.get_backend())
    WebhooksResource(endpoint_name, app=app, service=service)
    app.register_blueprint(webhooks_blueprint)
