# -*- coding: utf-8 -*-
"""Synchronous webhook HTTP delivery (shared by Celery and test endpoint)."""
import json
import logging

import requests

from liveblog.syndication.utils import resolve_webhook_delivery_url

from .payloads import build_webhook_payload

logger = logging.getLogger("liveblog")

DELIVERY_TIMEOUT_SECONDS = 15
BODY_LOG_LIMIT = 2000


def _parse_response_json(response):
    try:
        data = response.json()
    except ValueError:
        return None
    return data if isinstance(data, dict) else None


def _root_envelope(payload):
    """Root identity/placement fields actually present on the outbound JSON."""
    if not isinstance(payload, dict):
        return {
            "blogKey": None,
            "placementTags": None,
            "pageUri": None,
            "hasPlacementTagsKey": False,
        }
    return {
        "blogKey": payload.get("blogKey"),
        "placementTags": payload.get("placementTags"),
        "pageUri": payload.get("pageUri"),
        "hasPlacementTagsKey": "placementTags" in payload,
        "placementTagsType": type(payload.get("placementTags")).__name__
        if "placementTags" in payload
        else None,
    }


def post_webhook_payload(webhook, post, blog=None):
    """
    POST the webhook payload to the destination once.

    Returns a dict with:
      ok — True only for HTTP 200 (Maroela success contract)
      sent — root envelope we put on the wire (not the UI form)
      request_body — JSON text of the outbound body (truncated)
      response_body — raw destination response text (truncated)
      received — parsed destination JSON when available
    """
    payload = build_webhook_payload(
        post, data_format=webhook.get("data_format", "news_card"), blog=blog
    )
    destination = resolve_webhook_delivery_url(webhook.get("destination_url"))
    sent = _root_envelope(payload)

    try:
        request_body = json.dumps(payload, ensure_ascii=False, default=str)
    except (TypeError, ValueError):
        request_body = str(payload)
    if len(request_body) > BODY_LOG_LIMIT:
        request_body = request_body[:BODY_LOG_LIMIT] + "…"

    result = {
        "ok": False,
        "status_code": None,
        "destination": destination,
        "request_body": request_body,
        "response_body": "",
        "blogKey": sent.get("blogKey"),
        "placementTags": sent.get("placementTags"),
        "pageUri": sent.get("pageUri"),
        "sent": sent,
        "received": None,
        "error": None,
    }

    logger.info(
        "Delivering webhook %s to %s for post %s (format=%s sent_placement=%s)",
        webhook.get("_id"),
        destination,
        post.get("_id"),
        webhook.get("data_format"),
        sent.get("placementTags"),
    )

    try:
        response = requests.post(
            destination, json=payload, timeout=DELIVERY_TIMEOUT_SECONDS
        )
    except requests.RequestException as exc:
        result["error"] = "Connection failed: {}".format(exc)
        logger.exception("Webhook %s delivery failed", webhook.get("_id"))
        return result

    body_text = (response.text or "")[:BODY_LOG_LIMIT]
    result["status_code"] = response.status_code
    result["response_body"] = body_text

    parsed = _parse_response_json(response)
    if parsed is not None:
        result["received"] = {
            "ok": parsed.get("ok"),
            "blogKey": parsed.get("blogKey") or parsed.get("blog_key"),
            "placementTags": parsed.get("placementTags")
            if "placementTags" in parsed
            else parsed.get("tags")
            if isinstance(parsed.get("tags"), list)
            else None,
            "hasPlacementTagsKey": "placementTags" in parsed,
        }
        # Top-level convenience fields: destination echo when present.
        if result["received"].get("blogKey") is not None:
            result["blogKey"] = str(result["received"]["blogKey"])
        if "placementTags" in parsed or isinstance(parsed.get("tags"), list):
            result["placementTags"] = result["received"].get("placementTags")

    logger.info(
        "Webhook %s response: status=%s body=%s",
        webhook.get("_id"),
        response.status_code,
        body_text,
    )

    if response.status_code == 200:
        result["ok"] = True
        if parsed is not None and parsed.get("ok") is False:
            result["ok"] = False
            result["error"] = "Destination returned 200 but ok=false"
        return result

    result["error"] = "Destination returned HTTP {}".format(response.status_code)
    return result
