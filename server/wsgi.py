# -*- coding: utf-8; -*-
#
# This file is part of Superdesk.
#
# Copyright 2013, 2014, 2015 Sourcefabric z.u. and contributors.
#
# For the full copyright and license information, please see the
# AUTHORS and LICENSE files distributed with this source code, or
# at https://www.sourcefabric.org/superdesk/license

from app import get_app

_application = None


def _load_application():
    global _application
    if _application is None:
        _application = get_app()
    return _application


class LazyWSGIApp(object):
    """Defer app creation until first request (gunicorn worker is ready)."""

    def __call__(self, environ, start_response):
        # Use wrapped wsgi_app so elastic recovery middleware is always in path.
        return _load_application().wsgi_app(environ, start_response)


application = LazyWSGIApp()
