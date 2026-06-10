# -*- coding: utf-8 -*-
import logging

import superdesk
from flask import current_app as app

from liveblog.utils.api import api_error, api_response
from .test_delivery import queue_webhook_test

logger = logging.getLogger(__name__)

webhooks_blueprint = superdesk.Blueprint("webhooks_custom", __name__)


@webhooks_blueprint.route("/api/webhooks/<webhook_id>/test", methods=["POST"])
def test_webhook(webhook_id):
    if not app.auth.authorized([], "global_preferences", "POST"):
        return app.auth.authenticate()

    result, error, status = queue_webhook_test(webhook_id)
    if error:
        return api_error(error, status)
    return api_response(result, status)
