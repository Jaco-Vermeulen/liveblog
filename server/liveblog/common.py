import flask
import superdesk
from superdesk.utc import utcnow
from superdesk.celery_app import update_key
import unittest
from superdesk.errors import SuperdeskApiError


def get_user(required=False):
    user = flask.g.get("user", {})
    if "_id" not in user and required:
        raise superdesk.SuperdeskError(payload="Invalid user.")
    return user


def update_dates_for(doc):
    for item in ["firstcreated", "versioncreated"]:
        doc.setdefault(item, utcnow())


def check_comment_length(text):
    # TODO: move to validators.
    if not 1 <= len(text) <= 300:
        raise SuperdeskApiError(
            payload="Allowed length: between 1 and 300. You exceeded the allowed length"
        )


class BlogCache(object):
    """Manage the cache for blogs"""

    def __init__(self, cache):
        self.cache = cache

    def __get_blog_version(self, blog, invalidate=False):
        """
        Return the blog cache version.
        If invalidate is true, the version will be incremented
        """
        return update_key("%s__version" % (blog), flag=invalidate)

    def __create_blog_cache_key(self, blog, key):
        """return a key name for the given blog and key"""
        return "%s__%s__%s" % (blog, self.__get_blog_version(blog), key)

    def get(self, blog, key):
        """retrieve value from the cache"""
        return self.cache.get(self.__create_blog_cache_key(blog, key))

    def set(self, blog, key, value, timeout=None):
        """save value to the cache

        :param timeout: seconds to keep the entry. None uses Flask-Cache default
            (CACHE_DEFAULT_TIMEOUT). Prefer an explicit timeout for live poll data.
        """
        cache_key = self.__create_blog_cache_key(blog, key)
        if timeout is None:
            return self.cache.set(cache_key, value)
        return self.cache.set(cache_key, value, timeout=timeout)

    def invalidate(self, blog):
        """invalidate the cache for the given blog"""
        return self.__get_blog_version(blog, invalidate=True)


def client_posts_cache_timeout(docs, empty_timeout, filled_timeout):
    """TTL for client blog posts cache entries.

    Empty poll results must not outlive a short window: after invalidate, the first
    miss can race Elasticsearch and cache "no posts" until expiry.
    """
    if not docs:
        return empty_timeout
    return filled_timeout


class BlogCacheTestCase(unittest.TestCase):
    def test_cache(self):
        from flask_cache import Cache
        import app as app_module

        with app_module.get_app().app_context():
            from flask import current_app as app

            cache = Cache(app, config={"CACHE_TYPE": "simple"})
            blog_cache = BlogCache(cache)
            self.assertEqual(blog_cache.get("blog", "key"), None)
            blog_cache.set("blog", "key", "value")
            self.assertEqual(blog_cache.get("blog", "key"), "value")
            blog_cache.invalidate("blog")
            self.assertEqual(blog_cache.get("blog", "key"), None)

    def test_set_passes_explicit_timeout(self):
        class RecordingCache(object):
            def __init__(self):
                self.calls = []

            def get(self, key):
                return None

            def set(self, key, value, timeout=None):
                self.calls.append({"key": key, "value": value, "timeout": timeout})
                return True

        cache = RecordingCache()
        blog_cache = BlogCache(cache)
        blog_cache.set("blog", "key", "value", timeout=5)
        self.assertEqual(len(cache.calls), 1)
        self.assertEqual(cache.calls[0]["timeout"], 5)
        self.assertEqual(cache.calls[0]["value"], "value")

    def test_client_posts_cache_timeout_empty_vs_filled(self):
        self.assertEqual(client_posts_cache_timeout([], 5, 30), 5)
        self.assertEqual(client_posts_cache_timeout([{"_id": "1"}], 5, 30), 30)


def run_once(func):
    """
    Decorator to ensure that the decorated method only runs once
    """

    def wrapper(*args, **kwargs):
        if not hasattr(wrapper, "has_run"):
            wrapper.has_run = True
            return func(*args, **kwargs)

    return wrapper
