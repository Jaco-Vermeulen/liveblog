# -*- coding: utf-8 -*-
import logging

from superdesk.resource import Resource
from superdesk.services import BaseService

from liveblog.syndication.utils import normalize_http_url, trailing_slash

logger = logging.getLogger(__name__)

WEBHOOK_ACTIONS = ["post_created", "post_updated", "post_deleted"]
WEBHOOK_DATA_FORMATS = ["news_card", "raw"]


webhooks_schema = {
    "name": {"type": "string", "required": True},
    "destination_url": {
        "type": "string",
        "required": True,
        "httpsurl": {"key_field": None, "check_auth": False, "webhook": True},
    },
    "action": {
        "type": "string",
        "required": True,
        "allowed": WEBHOOK_ACTIONS,
    },
    "blog_id": Resource.rel(
        "client_blogs", embeddable=True, required=False, nullable=True, type="objectid"
    ),
    "data_format": {
        "type": "string",
        "required": True,
        "allowed": WEBHOOK_DATA_FORMATS,
        "default": "news_card",
    },
    "enabled": {"type": "boolean", "default": True},
}


class WebhooksService(BaseService):
    notification_key = "webhooks"

    def on_create(self, docs):
        for doc in docs:
            if doc.get("destination_url"):
                doc["destination_url"] = trailing_slash(
                    normalize_http_url(doc["destination_url"])
                )
        super().on_create(docs)

    def on_update(self, updates, original):
        if updates.get("destination_url"):
            updates["destination_url"] = trailing_slash(
                normalize_http_url(updates["destination_url"])
            )
        super().on_update(updates, original)


class WebhooksResource(Resource):
    datasource = {
        "source": "webhooks",
        "search_backend": None,
        "default_sort": [("name", 1)],
    }

    schema = webhooks_schema

    privileges = {
        "GET": "global_preferences",
        "POST": "global_preferences",
        "PATCH": "global_preferences",
        "PUT": "global_preferences",
        "DELETE": "global_preferences",
    }
