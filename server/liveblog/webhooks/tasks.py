# -*- coding: utf-8 -*-
import logging

import requests
from superdesk.celery_app import celery

logger = logging.getLogger("liveblog")


def _retryable_delivery_failure(result):
    if not result:
        return False
    if result.get("status_code") is not None and result["status_code"] >= 500:
        return True
    if result.get("error") and result.get("status_code") is None:
        return True
    return False


def _load_post_and_blog(post_id):
    from superdesk import get_resource_service

    posts = get_resource_service("posts")
    blogs = get_resource_service("blogs")
    post = posts.find_one(req=None, _id=post_id)
    if not post:
        return None, None
    blog_id = post.get("blog")
    blog = blogs.find_one(req=None, _id=blog_id)
    if not blog:
        blog = get_resource_service("client_blogs").find_one(req=None, _id=blog_id)
    return post, blog


def _iter_matching_webhooks(blog_id, event):
    from superdesk import get_resource_service

    from .payloads import webhook_matches_event

    webhooks = get_resource_service("webhooks")
    for webhook in webhooks.get(req=None, lookup={"enabled": True}):
        if not webhook_matches_event(webhook.get("action"), event):
            continue
        configured_blog = webhook.get("blog_id")
        if configured_blog and str(configured_blog) != str(blog_id):
            continue
        yield webhook


def _deliver_webhook_now(webhook, post, blog, event):
    """
    POST synchronously (same path as Integrations → Test).

    Queues a Celery retry only when the destination is unreachable or returns 5xx.
    """
    from .delivery import post_webhook_payload

    result = post_webhook_payload(webhook, post, blog=blog)
    logger.info(
        "Webhook %s event=%s post=%s ok=%s status=%s",
        webhook.get("_id"),
        event,
        post.get("_id"),
        result.get("ok"),
        result.get("status_code"),
    )
    if _retryable_delivery_failure(result):
        deliver_webhook.delay(str(webhook["_id"]), str(post["_id"]), event)
    return result


@celery.task(bind=True, max_retries=3, default_retry_delay=30)
def deliver_webhook(self, webhook_id, post_id, action):
    """Retry path for failed webhook delivery."""
    from superdesk import get_resource_service

    from .delivery import post_webhook_payload
    from .payloads import webhook_matches_event

    webhooks = get_resource_service("webhooks")
    webhook = webhooks.find_one(req=None, _id=webhook_id)
    if not webhook or not webhook.get("enabled"):
        return

    if not webhook_matches_event(webhook.get("action"), action):
        return

    post, blog = _load_post_and_blog(post_id)
    if not post:
        logger.warning("Webhook %s: post %s not found", webhook_id, post_id)
        return

    configured_blog = webhook.get("blog_id")
    if configured_blog and str(configured_blog) != str(post.get("blog")):
        return

    result = post_webhook_payload(webhook, post, blog=blog)

    if result.get("status_code") is not None and result["status_code"] >= 500:
        raise self.retry(
            exc=requests.HTTPError(
                "Webhook destination returned {}".format(result["status_code"])
            )
        )
    if result.get("error") and result.get("status_code") is None:
        raise self.retry(exc=requests.RequestException(result["error"]))


def dispatch_post_webhooks(post_id, action):
    """
    Find matching webhooks and deliver now (in-process).

    Publish used to only ``.delay()`` into Celery; when the worker did not run the
    task, Maroela never saw the post until Integrations → Test (which POSTs
    synchronously). Delivery is therefore synchronous here; Celery is retries only.
    """
    post, blog = _load_post_and_blog(post_id)
    if not post:
        logger.warning("dispatch_post_webhooks: post %s not found", post_id)
        return

    blog_id = post.get("blog")
    matched = 0
    for webhook in _iter_matching_webhooks(blog_id, action):
        matched += 1
        try:
            _deliver_webhook_now(webhook, post, blog, action)
        except Exception:
            logger.exception(
                "Webhook %s delivery raised for post %s event %s",
                webhook.get("_id"),
                post_id,
                action,
            )
            try:
                deliver_webhook.delay(str(webhook["_id"]), str(post_id), action)
            except Exception:
                logger.exception(
                    "Webhook %s could not queue Celery retry for post %s",
                    webhook.get("_id"),
                    post_id,
                )

    if matched == 0:
        logger.info(
            "dispatch_post_webhooks: no enabled webhooks for post %s event %s",
            post_id,
            action,
        )


def notify_post_webhooks(post_id, action):
    """
    Entry point from posts service.

    Runs in the API process so publish uses the same delivery path as Test.
    Failures are logged and never raised to the caller (post save must succeed).
    """
    try:
        dispatch_post_webhooks(post_id, action)
    except Exception:
        logger.exception(
            "notify_post_webhooks failed for post %s action %s", post_id, action
        )
        try:
            dispatch_post_webhooks_async.delay(str(post_id), action)
        except Exception:
            logger.exception(
                "notify_post_webhooks could not queue async fallback for post %s",
                post_id,
            )


@celery.task
def dispatch_post_webhooks_async(post_id, action):
    """Celery fallback when in-process notify fails unexpectedly."""
    dispatch_post_webhooks(post_id, action)
