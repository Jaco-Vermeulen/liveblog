from unittest.mock import MagicMock, patch

from superdesk.tests import TestCase
from liveblog.posts.headline import (
    prepare_blog_for_embed,
    resolve_live_headline,
)


class PostHeadlineTestCase(TestCase):
    @patch("liveblog.posts.headline.Blog")
    def test_resolve_live_headline_uses_newest_qualifying_post(self, blog_cls):
        blog_cls.return_value.posts.return_value = {
            "_items": [
                {
                    "headline": "Hidden headline",
                    "show_headline": False,
                    "published_date": "2026-06-09T12:00:00",
                },
                {
                    "headline": "Latest headline",
                    "show_headline": True,
                    "published_date": "2026-06-09T11:00:00",
                },
                {
                    "headline": "Older headline",
                    "show_headline": True,
                    "published_date": "2026-06-09T10:00:00",
                },
            ]
        }

        self.assertEqual(resolve_live_headline("blog-id"), "Latest headline")
        blog_cls.return_value.posts.assert_called_once_with(
            wrap=True, limit=50, ordering="newest_first"
        )

    @patch("liveblog.posts.headline.Blog")
    def test_resolve_live_headline_returns_none_without_qualifying_post(self, blog_cls):
        blog_cls.return_value.posts.return_value = {
            "_items": [
                {"headline": "No flag", "show_headline": False},
                {"headline": "", "show_headline": True},
            ]
        }
        self.assertIsNone(resolve_live_headline("blog-id"))

    def test_prepare_blog_for_embed(self):
        prepared = prepare_blog_for_embed(
            {"title": "Settings title", "current_headline": "Live headline"}
        )
        self.assertEqual(prepared["settings_title"], "Settings title")
        self.assertEqual(prepared["title"], "Live headline")

        prepared = prepare_blog_for_embed(
            {"title": "Settings title", "current_headline": None}
        )
        self.assertEqual(prepared["title"], "Settings title")
