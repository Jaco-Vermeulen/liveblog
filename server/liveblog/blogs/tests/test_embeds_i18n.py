import unittest

from liveblog.blogs.embeds import merge_theme_i18n


class MergeThemeI18nTestCase(unittest.TestCase):
    def test_child_inherits_parent_poll_strings(self):
        parent = {
            "name": "default",
            "i18n": {
                "af": {
                    "Vote": "Stem",
                    "Load more posts": "Laai meer",
                }
            },
        }
        child = {
            "name": "maroela",
            "extends": "default",
            "i18n": {
                "af": {
                    "Filter": "Filter",
                }
            },
        }

        def fake_find_one(req=None, name=None):
            if name == "default":
                return parent
            return None

        from unittest.mock import patch

        with patch(
            "liveblog.blogs.embeds.get_resource_service"
        ) as mock_service:
            mock_service.return_value.find_one.side_effect = fake_find_one
            merged = merge_theme_i18n(child)

        self.assertEqual(merged["af"]["Vote"], "Stem")
        self.assertEqual(merged["af"]["Filter"], "Filter")
        self.assertEqual(merged["af"]["Load more posts"], "Laai meer")
