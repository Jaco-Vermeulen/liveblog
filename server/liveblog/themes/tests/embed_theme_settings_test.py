"""Tests for embed theme settings resolution."""

from unittest import TestCase

from liveblog.themes.themes import ThemesService


class EmbedThemeSettingsTest(TestCase):
    def setUp(self):
        self.service = ThemesService("themes", None)

    def test_theme_document_wins_over_blog_for_defined_keys(self):
        theme = {
            "name": "tribute-light",
            "options": [
                {"name": "showImage", "type": "checkbox", "default": True},
                {"name": "showTitle", "type": "checkbox", "default": True},
                {"name": "postOrder", "type": "select", "default": "editorial"},
            ],
            "settings": {
                "showImage": False,
                "showTitle": False,
                "postOrder": "newest_first",
            },
        }
        blog = {
            "theme_settings": {
                "showImage": True,
                "showTitle": True,
                "postOrder": "oldest_first",
            }
        }

        resolved = self.service.get_embed_theme_settings(theme, blog)

        self.assertFalse(resolved["showImage"])
        self.assertFalse(resolved["showTitle"])
        self.assertEqual(resolved["postOrder"], "newest_first")

    def test_blog_applies_when_theme_document_omits_key(self):
        theme = {
            "name": "tribute-light",
            "options": [
                {"name": "showGallery", "type": "checkbox", "default": False},
                {"name": "showImage", "type": "checkbox", "default": True},
            ],
            "settings": {"showImage": True},
        }
        blog = {"theme_settings": {"showGallery": True, "showImage": False}}

        resolved = self.service.get_embed_theme_settings(theme, blog)

        self.assertTrue(resolved["showGallery"])
        self.assertTrue(resolved["showImage"])
