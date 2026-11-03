# -*- coding: utf-8 -*-
import logging

import requests
from superdesk.celery_app import celery

logger = logging.getLogger("liveblog")


@celery.task(bind=True, max_retries=3, default_retry_delay=30)
def deliver_webhook(self, webhook_id, post_id, action):
    """Deliver a webhook payload for a post event."""
    from superdesk import get_resource_service

    from .delivery import post_webhook_payload
    from .payloads import WEBHOOK_ACTIONS

    webhooks = get_resource_service("webhooks")
    posts = get_resource_service("posts")
    blogs = get_resource_service("blogs")

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
    if not blog:
        blog = get_resource_service("client_blogs").find_one(req=None, _id=blog_id)
    result = post_webhook_payload(webhook, post, blog=blog)

    if result.get("status_code") is not None and result["status_code"] >= 500:
        raise self.retry(
            exc=requests.HTTPError(
                "Webhook destination returned {}".format(result["status_code"])
            )
        )
    if result.get("error") and result.get("status_code") is None:
        raise self.retry(exc=requests.RequestException(result["error"]))


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
