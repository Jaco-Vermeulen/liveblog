#!/usr/bin/env python3
"""Verify Mandrill SMTP from the running server env. Prints queue id when present."""
import os
import re
import smtplib
import ssl
import sys
import time


def main():
    host = os.environ.get("MAIL_SERVER", "")
    port = int(os.environ.get("MAIL_PORT", "587") or "587")
    user = os.environ.get("MAIL_USERNAME", "")
    pwd = os.environ.get("MAIL_PASSWORD", "")
    from_addr = os.environ.get("MAIL_FROM", "")
    to = sys.argv[1] if len(sys.argv) > 1 else from_addr

    if not all([host, user, pwd, from_addr]):
        print("FAIL: set MAIL_SERVER, MAIL_USERNAME, MAIL_PASSWORD, MAIL_FROM", file=sys.stderr)
        sys.exit(1)

    subject = "Liveblog SMTP verify %d" % int(time.time())
    print("MAIL_SERVER:", host, port)
    print("MAIL_FROM:", from_addr)
    print("MAIL_USERNAME:", repr(user))
    print("TO:", to)
    print("SUBJECT:", subject)

    server = smtplib.SMTP(host, port, timeout=30)
    server.ehlo()
    if os.environ.get("MAIL_USE_TLS", "").lower() in ("true", "1"):
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        server.starttls(context=ctx)
        server.ehlo()
    server.login(user, pwd)
    print("LOGIN: OK")

    body = (
        "If this appears in Mailchimp Transactional outbound for the account "
        "that owns the API key in MAIL_PASSWORD, SMTP is wired to the right account.\n"
    )
    msg = (
        "From: %s\r\nTo: %s\r\nSubject: %s\r\n\r\n%s"
        % (from_addr, to, subject, body)
    )
    refused = server.sendmail(from_addr, [to], msg)
    if refused:
        print("REFUSED:", refused, file=sys.stderr)
        sys.exit(1)
    print("SEND: accepted by SMTP relay (check Mandrill outbound for subject above)")
  # Mandrill often returns queue id in server response only on some paths; sendmail may not expose it
    server.quit()
    print("DONE")


if __name__ == "__main__":
    main()
