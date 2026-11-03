# -*- coding: utf-8 -*-
"""Synchronous webhook HTTP delivery (shared by Celery and test endpoint)."""
import logging

import requests

from liveblog.syndication.utils import resolve_webhook_delivery_url

from .payloads import build_webhook_payload

logger = logging.getLogger("liveblog")

DELIVERY_TIMEOUT_SECONDS = 15


def _parse_response_json(response):
    try:
        data = response.json()
    except ValueError:
        return None
    return data if isinstance(data, dict) else None


def post_webhook_payload(webhook, post, blog=None):
    """
    POST the webhook payload to the destination once.

    Returns a dict:
      ok (bool) — True only for HTTP 200 (Maroela success contract)
      status_code (int|None)
      destination (str)
      response_body (str) — truncated
      blogKey (str|None) — from JSON body when present
      error (str|None) — transport / non-success summary
    """
    payload = build_webhook_payload(
        post, data_format=webhook.get("data_format", "news_card"), blog=blog
    )
    destination = resolve_webhook_delivery_url(webhook.get("destination_url"))

    sent = {}
    if isinstance(payload, dict):
        if "blogKey" in payload:
            sent["blogKey"] = payload.get("blogKey")
        if "pageUri" in payload:
            sent["pageUri"] = payload.get("pageUri")
        # Explicit null when omitted so callers can tell "not attached" from "[]".
        sent["placementTags"] = payload.get("placementTags")

    result = {
        "ok": False,
        "status_code": None,
        "destination": destination,
        "response_body": "",
        "blogKey": sent.get("blogKey"),
        "placementTags": sent.get("placementTags"),
        "pageUri": sent.get("pageUri"),
        "sent": sent,
        "error": None,
    }

    logger.info(
        "Delivering webhook %s to %s for post %s (format=%s)",
        webhook.get("_id"),
        destination,
        post.get("_id"),
        webhook.get("data_format"),
    )

    try:
        response = requests.post(
            destination, json=payload, timeout=DELIVERY_TIMEOUT_SECONDS
        )
    except requests.RequestException as exc:
        result["error"] = "Connection failed: {}".format(exc)
        logger.exception("Webhook %s delivery failed", webhook.get("_id"))
        return result

    body_text = (response.text or "")[:500]
    result["status_code"] = response.status_code
    result["response_body"] = body_text

    parsed = _parse_response_json(response)
    if parsed:
        # Prefer consumer echo when present; keep what we sent otherwise.
        blog_key = parsed.get("blogKey") or parsed.get("blog_key")
        if blog_key is not None:
            result["blogKey"] = str(blog_key)
        if "placementTags" in parsed:
            result["placementTags"] = parsed.get("placementTags")
        elif "tags" in parsed and isinstance(parsed.get("tags"), list):
            result["placementTags"] = parsed.get("tags")

    logger.info(
        "Webhook %s response: status=%s body=%s",
        webhook.get("_id"),
        response.status_code,
        body_text,
    )

    # Consumer contract: success is HTTP 200 (with { ok, blogKey, … }).
    if response.status_code == 200:
        result["ok"] = True
        if parsed is not None and parsed.get("ok") is False:
            result["ok"] = False
            result["error"] = "Destination returned 200 but ok=false"
        return result

    result["error"] = "Destination returned HTTP {}".format(response.status_code)
    return result
