# -*- coding: utf-8 -*-
import json
from pathlib import Path

from superdesk import get_resource_service
from superdesk.errors import SuperdeskApiError

from liveblog.core.constants import BLOG_CATEGORIES

_DEFAULT_CATEGORIES_PATH = (
    Path(__file__).resolve().parent.parent
    / "prepopulate"
    / "data_init"
    / "maroela_blog_categories.json"
)


def load_default_blog_categories():
    """Maroela WP categories seed (used when global preference is unset)."""
    try:
        with _DEFAULT_CATEGORIES_PATH.open(encoding="utf-8") as handle:
            data = json.load(handle)
    except (OSError, json.JSONDecodeError):
        return []
    if not isinstance(data, list):
        return []
    return [item.strip() for item in data if isinstance(item, str) and item.strip()]


def get_configured_blog_categories():
    prefs = get_resource_service("global_preferences").get_global_prefs()
    raw = prefs.get(BLOG_CATEGORIES)
    if isinstance(raw, list):
        configured = [item.strip() for item in raw if isinstance(item, str) and item.strip()]
        if configured:
            return configured
    return load_default_blog_categories()


def validate_blog_category(category, existing_category=None):
    """Ensure blog category is empty or in the configured list.

    Grandfather existing values so blogs keep a legacy category until edited.
    """
    if category is None or category == "":
        return ""
    if not isinstance(category, str):
        raise SuperdeskApiError.badRequestError(message="Invalid blog category")
    category = category.strip()
    if category == "":
        return ""
    allowed = set(get_configured_blog_categories())
    if category in allowed:
        return category
    if existing_category and category == existing_category:
        return category
    raise SuperdeskApiError.badRequestError(
        message="Blog category is not in the configured list"
    )
