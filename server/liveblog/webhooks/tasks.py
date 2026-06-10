# -*- coding: utf-8 -*-
import logging

import requests
from superdesk.celery_app import celery

logger = logging.getLogger("liveblog")


@celery.task(bind=True, max_retries=3, default_retry_delay=30)
def deliver_webhook(self, webhook_id, post_id, action):
    """Deliver a webhook payload for a post event."""
    from superdesk import get_resource_service

    from .payloads import WEBHOOK_ACTIONS, build_webhook_payload

    webhooks = get_resource_service("webhooks")
    posts = get_resource_service("posts")
    blogs = get_resource_service("client_blogs")

    webhook = webhooks.find_one(req=None, _id=webhook_id)
    if not webhook or not webhook.get("enabled"):
        return

    expected_action = WEBHOOK_ACTIONS.get(webhook.get("action"))
    if expected_action != action:
        return

    post = posts.find_one(req=None, _id=post_id)
    if not post:
        logger.warning("Webhook %s: post %s not found", webhook_id, post_id)
        return

    blog_id = post.get("blog")
    configured_blog = webhook.get("blog_id")
    if configured_blog and str(configured_blog) != str(blog_id):
        return

    blog = blogs.find_one(req=None, _id=blog_id)
    payload = build_webhook_payload(
        post, data_format=webhook.get("data_format", "news_card"), blog=blog
    )
    from liveblog.syndication.utils import resolve_webhook_delivery_url

    destination = resolve_webhook_delivery_url(webhook.get("destination_url"))

    logger.info(
        "Delivering webhook %s to %s for post %s (action=%s, format=%s)",
        webhook_id,
        destination,
        post_id,
        action,
        webhook.get("data_format"),
    )

    try:
        response = requests.post(destination, json=payload, timeout=15)
        logger.info(
            "Webhook %s response: status=%s body=%s",
            webhook_id,
            response.status_code,
            response.text[:500],
        )
        if response.status_code >= 500:
            raise requests.HTTPError(
                "Webhook destination returned {}".format(response.status_code)
            )
    except Exception as exc:
        logger.exception("Webhook %s delivery failed", webhook_id)
        raise self.retry(exc=exc)


@celery.task
def dispatch_post_webhooks(post_id, action):
    """Find matching webhooks and queue delivery tasks."""
    from superdesk import get_resource_service

    from .payloads import POST_EVENT_TO_ACTION

    action_key = POST_EVENT_TO_ACTION.get(action)
    if not action_key:
        return

    posts = get_resource_service("posts")
    post = posts.find_one(req=None, _id=post_id)
    if not post:
        logger.warning("dispatch_post_webhooks: post %s not found", post_id)
        return

    blog_id = post.get("blog")
    webhooks = get_resource_service("webhooks")
    lookup = {"enabled": True, "action": action_key}
    for webhook in webhooks.get(req=None, lookup=lookup):
        configured_blog = webhook.get("blog_id")
        if configured_blog and str(configured_blog) != str(blog_id):
            continue
        deliver_webhook.delay(webhook["_id"], post_id, action)
