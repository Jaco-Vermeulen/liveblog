"""Tests for theme static asset URL resolution."""

import os
from unittest import TestCase

from liveblog.themes.themes import ThemesService


class ThemeAssetsRootTest(TestCase):
    def setUp(self):
        self.service = ThemesService("themes", None)

    def test_sparse_child_inherits_parent_assets_root(self):
        theme_name = "tribute-light"
        if not self.service.is_local_theme(theme_name):
            self.skipTest("tribute-light is not a local theme in this environment")

        theme_path = self.service.get_theme_path(theme_name)
        images_dir = os.path.join(theme_path, "images")
        if not os.path.isdir(images_dir):
            self.skipTest("tribute-light images/ not present on disk")

        theme = {"name": theme_name, "extends": "default"}
        root = self.service.get_theme_assets_root(theme)

        self.assertTrue(
            root.endswith("/themes_assets/default/"),
            "sparse child should inherit default assets_root, got {!r}".format(root),
        )
        self.assertFalse(self.service.theme_has_full_image_assets(theme_name))

    def test_default_theme_uses_own_assets_root(self):
        theme = {"name": "default"}
        root = self.service.get_theme_assets_root(theme)
        self.assertTrue(root.endswith("/themes_assets/default/"))
        self.assertTrue(self.service.theme_has_full_image_assets("default"))
