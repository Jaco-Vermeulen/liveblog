# -*- coding: utf-8 -*-
"""Maroela-branded transactional e-mail helpers (Afrikaans, web2 reset links)."""
import logging
import re

from flask import current_app as app, render_template
from superdesk.emails import send_email

logger = logging.getLogger(__name__)


def _reset_password_url(token):
    base = (app.config.get("CLIENT_URL") or "").rstrip("/")
    return "{}/reset-password?token={}".format(base, token)


def _logo_url():
    """Hosted white Maroela logo (CDN — works in Gmail/Outlook without attachments)."""
    return app.config.get("EMAIL_LOGO_URL") or (
        "https://mcusercontent.com/3d8f21b3e2/images/"
        "3a06e0a5-db1d-a4ea-cac2-8e87fb118fd0.png"
    )


def _email_trace_id(token):
    """Short id for logs + footer (support debugging)."""
    return "reset-{}".format(re.sub(r"[^a-zA-Z0-9]", "", token)[:16])


def send_reset_password_email(doc, token_ttl):
    """Replace superdesk default (English, /#/reset-password hash URL)."""
    app_name = app.config.get("APPLICATION_NAME", "Maroela Media Liveblog")
    support_email = app.config.get("MAIL_FROM") or app.config.get("ADMINS", [""])[0]
    url = _reset_password_url(doc["token"])
    hours = int(token_ttl) * 24
    email_trace = _email_trace_id(doc["token"])
    logo_url = _logo_url()

    subject = render_template("reset_password_subject.txt")
    text_body = render_template(
        "reset_password.txt",
        email=doc["email"],
        expires=hours,
        url=url,
        app_name=app_name,
        support_email=support_email,
        email_trace=email_trace,
    )
    html_body = render_template(
        "reset_password.html",
        email=doc["email"],
        expires=hours,
        url=url,
        app_name=app_name,
        logo_url=logo_url,
        support_email=support_email,
        email_trace=email_trace,
    )
    sender = app.config["ADMINS"][0]

    logger.info(
        "Queue password-reset e-mail trace=%s to=%s logo=%s",
        email_trace,
        doc["email"],
        logo_url,
    )

    send_email.delay(
        subject=subject,
        sender=sender,
        recipients=[doc["email"]],
        text_body=text_body,
        html_body=html_body,
    )
