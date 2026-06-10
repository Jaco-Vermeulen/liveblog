# -*- coding: utf-8 -*-
import liveblog.core as core_app
import liveblog.blogs as blog_app

from superdesk.tests import TestCase
from superdesk.errors import SuperdeskApiError
from superdesk import get_resource_service

from liveblog.blogs.categories import (
    get_configured_blog_categories,
    load_default_blog_categories,
    validate_blog_category,
)
from liveblog.core.constants import BLOG_CATEGORIES


class BlogCategoriesTestCase(TestCase):
    def setUp(self):
        core_app.init_app(self.app)
        blog_app.init_app(self.app)

    def test_default_categories_loaded_from_seed(self):
        defaults = load_default_blog_categories()
        self.assertIn("Nuus", defaults)
        self.assertIn("SA-nuus", defaults)
        self.assertIn("Wêreldnuus", defaults)
        self.assertGreater(len(defaults), 50)

    def test_validate_allows_empty_and_configured(self):
        self.assertEqual(validate_blog_category(""), "")
        self.assertEqual(validate_blog_category(None), "")
        self.assertEqual(validate_blog_category("Nuus"), "Nuus")

    def test_validate_rejects_unknown_category(self):
        with self.assertRaises(SuperdeskApiError):
            validate_blog_category("Breaking News")

    def test_validate_grandfathers_existing_category(self):
        self.assertEqual(
            validate_blog_category("Breaking News", existing_category="Breaking News"),
            "Breaking News",
        )

    def test_get_configured_blog_categories_from_global_preferences(self):
        service = get_resource_service("global_preferences")
        service.post([{"key": BLOG_CATEGORIES, "value": ["Nuus", "Sport"]}])
        self.assertEqual(get_configured_blog_categories(), ["Nuus", "Sport"])
