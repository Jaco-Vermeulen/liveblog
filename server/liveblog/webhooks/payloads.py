# -*- coding: utf-8 -*-
import base64
import hashlib
import html
import logging
import re
from html.parser import HTMLParser

from bson import ObjectId
from bson.errors import InvalidId
from superdesk import get_resource_service

from liveblog.syndication.utils import extract_creator_data, extract_post_items_data

logger = logging.getLogger(__name__)

WEBHOOK_ACTIONS = {
    "post_created": "created",
    "post_updated": "updated",
    "post_deleted": "deleted",
}

POST_EVENT_TO_ACTION = {v: k for k, v in WEBHOOK_ACTIONS.items()}


class _HTMLTextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self._parts = []

    def handle_data(self, data):
        if data and data.strip():
            self._parts.append(data.strip())

    def get_text(self):
        return " ".join(self._parts)


def slugify(value):
    text = (value or "").lower().strip()
    text = re.sub(r"[^\w\s-]", "", text, flags=re.UNICODE)
    text = re.sub(r"[\s_-]+", "-", text, flags=re.UNICODE)
    return text.strip("-") or "post"


def post_id_to_database_id(post_id):
    """Map Liveblog post _id (ObjectId or newsml URN) to a stable numeric id."""
    if isinstance(post_id, ObjectId):
        return int(str(post_id)[-8:], 16)
    post_id_str = str(post_id)
    try:
        return int(str(ObjectId(post_id_str))[-8:], 16)
    except (InvalidId, TypeError, ValueError):
        digest = hashlib.sha256(post_id_str.encode("utf-8")).hexdigest()
        return int(digest[:8], 16)


# Backwards-compatible alias used in tests
object_id_to_database_id = post_id_to_database_id


def graphql_post_id(database_id):
    raw = "post:{}".format(database_id)
    return base64.b64encode(raw.encode("utf-8")).decode("utf-8")


def format_datetime(value):
    if not value:
        return None
    if isinstance(value, str):
        return value[:19] if "T" in value else value
    return value.strftime("%Y-%m-%dT%H:%M:%S")


def strip_html_to_text(text):
    if not text:
        return ""
    parser = _HTMLTextExtractor()
    try:
        parser.feed(text)
        return parser.get_text()
    except Exception:
        return re.sub(r"<[^>]+>", "", text)


def build_excerpt_html(text, max_length=300):
    plain = strip_html_to_text(text)
    if not plain:
        return "<p></p>"
    if len(plain) > max_length:
        plain = plain[: max_length - 1].rstrip() + "…"
    return "<p>{}</p>".format(html.escape(plain))


def _resolve_author(post):
    creator = extract_creator_data(post) or {}
    publisher = post.get("publisher") or {}
    name = (
        creator.get("display_name")
        or publisher.get("display_name")
        or creator.get("byline")
        or publisher.get("byline")
        or creator.get("username")
        or publisher.get("username")
        or "Unknown"
    )
    first_name = creator.get("first_name") or name.split(" ", 1)[0]
    last_name = creator.get("last_name")
    if not last_name and " " in name:
        last_name = name.split(" ", 1)[1]

    avatar_url = creator.get("picture_url") or publisher.get("picture_url")
    if not avatar_url:
        renditions = creator.get("avatar_renditions") or publisher.get(
            "avatar_renditions"
        )
        if renditions:
            avatar_url = (
                renditions.get("thumbnail", {}).get("href")
                or renditions.get("viewImage", {}).get("href")
                or next(
                    (r.get("href") for r in renditions.values() if r.get("href")),
                    None,
                )
            )

    return {
        "node": {
            "name": name,
            "firstName": first_name or name,
            "lastName": last_name or "",
            "slug": slugify(name),
            "avatar": {"url": avatar_url} if avatar_url else {"url": None},
        }
    }


def _first_text_item(items):
    for item in items:
        if item.get("text"):
            return item["text"]
    return ""


def _build_featured_image_node(renditions, alt_text="", caption=""):
    if not renditions:
        return None

    source = renditions.get("viewImage") or renditions.get("original") or {}
    source_url = source.get("href")
    if not source_url:
        return None

    sizes = []
    for key, rendition in renditions.items():
        if not rendition.get("href"):
            continue
        sizes.append(
            {
                "name": key,
                "sourceUrl": rendition.get("href"),
                "width": rendition.get("width"),
                "height": rendition.get("height"),
            }
        )

    width = source.get("width")
    height = source.get("height")

    return {
        "node": {
            "sourceUrl": source_url,
            "altText": alt_text or caption or "",
            "caption": caption or "",
            "mediaDetails": {
                "width": width,
                "height": height,
                "sizes": sizes,
            },
        }
    }


def _build_featured_image(item, renditions):
    if not renditions:
        return None

    meta = item.get("meta", {}) if item else {}
    caption = meta.get("caption") or meta.get("description") or ""
    alt_text = meta.get("alt") or caption or ""
    return _build_featured_image_node(renditions, alt_text=alt_text, caption=caption)


def _resolve_featured_image(post, blog, items):
    """Post featured image, else blog cover image."""
    post_renditions = post.get("featured_image_renditions")
    if post_renditions:
        return _build_featured_image_node(
            post_renditions, alt_text=post.get("headline") or ""
        )

    if post.get("featured_image_url"):
        return {
            "node": {
                "sourceUrl": post.get("featured_image_url"),
                "altText": post.get("headline") or "",
                "caption": "",
                "mediaDetails": {"width": None, "height": None, "sizes": []},
            }
        }

    blog_renditions = blog.get("picture_renditions")
    if blog_renditions:
        return _build_featured_image_node(
            blog_renditions, alt_text=blog.get("title") or ""
        )

    if blog.get("picture_url"):
        return {
            "node": {
                "sourceUrl": blog.get("picture_url"),
                "altText": blog.get("title") or "",
                "caption": "",
                "mediaDetails": {"width": None, "height": None, "sizes": []},
            }
        }

    return None


def _resolve_title(post, items, blog):
    headline = (post.get("headline") or "").strip()
    if headline:
        return headline
    text = strip_html_to_text(_first_text_item(items))
    if text:
        return text[:120]
    return blog.get("title") or "Liveblog post"


def _build_tags_nodes(tags):
    nodes = []
    for tag in tags or []:
        if not tag:
            continue
        nodes.append({"name": tag, "slug": slugify(tag)})
    return {"nodes": nodes}


def _build_categories_nodes(blog):
    """Map the blog's configured category (General settings) to WP GraphQL shape."""
    category = (blog.get("category") or "").strip()
    if not category:
        return {"nodes": []}

    slug = slugify(category)
    return {
        "nodes": [
            {
                "name": category,
                "slug": slug,
                "uri": "/{}/".format(slug),
            }
        ]
    }


def build_news_card_payload(post, blog=None):
    """Build WP GraphQL-compatible news card payload for a single post."""
    if blog is None:
        blogs = get_resource_service("client_blogs")
        blog = blogs.find_one(req=None, _id=post.get("blog")) or {}

    items = extract_post_items_data(post)
    database_id = post_id_to_database_id(post["_id"])
    title = _resolve_title(post, items, blog)
    slug = slugify(title)
    public_url = blog.get("public_url") or ""
    uri = "{}/{}".format(public_url.rstrip("/"), slug) if public_url else "/{}/{}".format(
        slugify(blog.get("title") or "liveblog"), slug
    )

    featured_image = _resolve_featured_image(post, blog, items)

    node = {
        "id": graphql_post_id(database_id),
        "databaseId": database_id,
        "title": title,
        "excerpt": build_excerpt_html(_first_text_item(items)),
        "date": format_datetime(post.get("published_date") or post.get("_created")),
        "modified": format_datetime(
            post.get("content_updated_date")
            or post.get("_updated")
            or post.get("published_date")
        ),
        "uri": uri,
        "slug": slug,
        "author": _resolve_author(post),
        "categories": _build_categories_nodes(blog),
        "tags": _build_tags_nodes(post.get("tags")),
        "featuredImage": featured_image,
        "frontPageBoost": None,
        "frontPageBoostTest": None,
    }

    return {
        "data": {
            "posts": {
                "nodes": [node],
                "pageInfo": {
                    "hasNextPage": False,
                    "endCursor": None,
                },
            }
        }
    }


def build_raw_payload(post):
    """Build the default webhook payload with post and item data."""
    from liveblog.syndication.utils import extract_producer_post_data

    return {
        "post": extract_producer_post_data(post),
        "items": extract_post_items_data(post),
    }


def build_webhook_payload(post, data_format="news_card", blog=None):
    if data_format == "news_card":
        return build_news_card_payload(post, blog=blog)
    return build_raw_payload(post)
