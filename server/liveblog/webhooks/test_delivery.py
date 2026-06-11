# -*- coding: utf-8 -*-
import logging

from eve.utils import ParsedRequest
from superdesk import get_resource_service

from .payloads import WEBHOOK_ACTIONS

logger = logging.getLogger(__name__)

OPEN_POST_LOOKUP = {"post_status": "open", "deleted": False}


def _blog_last_post_field(action_key):
    if action_key == "post_updated":
        return "last_updated_post"
    return "last_created_post"


def _latest_post_for_blog(posts_service, blog_id):
    req = ParsedRequest()
    req.sort = "-order"
    req.max_results = 1
    lookup = dict(OPEN_POST_LOOKUP)
    lookup["blog"] = blog_id
    # Mongo query: Eve sort strings like "-order" are not valid for ES (ast.literal_eval).
    return next(posts_service.get_from_mongo(req=req, lookup=lookup), None)


def _latest_post_across_blogs(posts_service):
    req = ParsedRequest()
    req.sort = "-order"
    req.max_results = 1
    return next(
        posts_service.get_from_mongo(req=req, lookup=dict(OPEN_POST_LOOKUP)), None
    )


def _newest_blog_post_marker(blogs, post_field):
    req = ParsedRequest()
    req.max_results = 500
    latest_post_id = None
    latest_ts = None

    for blog in blogs.get(req=req, lookup={}):
        last = blog.get(post_field) or blog.get("last_created_post") or {}
        post_id = last.get("_id")
        updated = last.get("_updated")
        if not post_id:
            continue
        if latest_ts is None or (updated and updated > latest_ts):
            latest_ts = updated
            latest_post_id = post_id

    return latest_post_id


def resolve_webhook_test_post(webhook):
    """
    Pick the most recent post to use for a webhook test delivery.

    Uses the webhook's blog filter when set; otherwise the newest post across blogs.
    """
    posts_service = get_resource_service("posts")
    blogs_service = get_resource_service("client_blogs")

    action_key = webhook.get("action")
    post_field = _blog_last_post_field(action_key)
    configured_blog = webhook.get("blog_id")

    if configured_blog:
        blog = blogs_service.find_one(req=None, _id=configured_blog)
        if not blog:
            return None, "Blog not found for this webhook."

        last = blog.get(post_field) or blog.get("last_created_post") or {}
        post_id = last.get("_id")
        if post_id:
            post = posts_service.find_one(req=None, _id=post_id)
            if post and not post.get("deleted"):
                return post_id, None

        post = _latest_post_for_blog(posts_service, configured_blog)
        if post:
            return post["_id"], None
        return None, "No published posts found for this blog."

    post_id = _newest_blog_post_marker(blogs_service, post_field)
    if post_id:
        post = posts_service.find_one(req=None, _id=post_id)
        if post and not post.get("deleted"):
            return post_id, None

    post = _latest_post_across_blogs(posts_service)
    if post:
        return post["_id"], None
    return None, "No published posts found."


def queue_webhook_test(webhook_id):
    """Queue a test delivery for the webhook's configured action and latest post."""
    from .tasks import deliver_webhook

    webhooks = get_resource_service("webhooks")
    webhook = webhooks.find_one(req=None, _id=webhook_id)
    if not webhook:
        return None, "Webhook not found.", 404

    post_id, error = resolve_webhook_test_post(webhook)
    if not post_id:
        return None, error, 404

    action = WEBHOOK_ACTIONS.get(webhook.get("action"))
    if not action:
        return None, "Webhook action is not supported for testing.", 400

    deliver_webhook.delay(webhook_id, post_id, action)
    logger.info(
        "Queued webhook test %s for post %s (action=%s)",
        webhook_id,
        post_id,
        action,
    )
    return {
        "queued": True,
        "post_id": post_id,
        "action": action,
        "webhook_id": webhook_id,
    }, None, 202
