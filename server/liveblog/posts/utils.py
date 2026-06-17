import logging
import re
from urllib.parse import urlparse

from flask import current_app as app
from itertools import groupby
from superdesk import get_resource_service
from superdesk.utc import utcnow


logger = logging.getLogger("superdesk")

KNOWN_SOCIAL_EMBED_MARKERS = (
    "facebook",
    "twitter",
    "youtube",
    "instagram",
    "brightcove",
)


def get_associations(post):
    for group in post.get("groups", []):
        for assoc in group.get("refs", []):
            yield assoc


def get_associations_ids(post):
    ids = []

    for assoc in get_associations(post):
        ref_id = assoc.get("residRef", None)
        if ref_id:
            ids.append(ref_id)

    return ids


def get_related_items(post):
    """
    Returns a list of all the related items for the given post.
    """
    items = []
    items_refs = [
        assoc for group in post.get("groups", []) for assoc in group.get("refs", [])
    ]

    for ref in items_refs:
        item = ref.get("item")
        if item:
            items.append(item)

    return items


def get_first_item_of_type(items, item_type):
    """Returns the first item for the given type."""
    for item in items:
        if item.get("item_type") == item_type:
            return item


def _strip_html(text):
    return re.sub(r"<[^>]+>", "", text or "").strip()


def _is_meaningful_text_item(item):
    if item.get("item_type", "").lower() != "text":
        return False
    return bool(_strip_html(item.get("text")))


def _is_editorial_item(item):
    item_type = item.get("item_type", "").lower()
    if item_type in ("comment", "embed"):
        return False
    if item_type == "text":
        return _is_meaningful_text_item(item)
    if item_type.startswith("advertisement"):
        return False
    return item_type in ("image", "quote", "poll", "scorecard", "video")


def _editorial_display_type(item):
    item_type = item.get("item_type", "").lower()
    meta = item.get("meta") or {}
    if item_type == "text" and meta.get("quote"):
        return "quote"
    return item_type or "text"


def _resolve_editorial_type(editorial_items):
    display_types = [_editorial_display_type(item) for item in editorial_items]
    image_count = display_types.count("image")

    if image_count > 1 and "text" not in display_types and "poll" not in display_types:
        return "slideshow"
    if "poll" in display_types:
        return "poll"
    return display_types[0]


def _is_known_social_provider(provider_name):
    provider = (provider_name or "").lower().strip()
    if provider in ("x", "twitter"):
        return True
    return any(marker in provider for marker in KNOWN_SOCIAL_EMBED_MARKERS)


def _embed_favicon_url(item):
    meta = item.get("meta") or {}
    for key in ("provider_url", "original_url", "url"):
        raw_url = meta.get(key)
        if not raw_url:
            continue
        try:
            hostname = urlparse(str(raw_url)).hostname
        except ValueError:
            continue
        if hostname:
            return "https://www.google.com/s2/favicons?domain={}&sz=64".format(hostname)
    return None


def get_embed_type(item):
    meta = item.get("meta") or {}
    provider_name = meta.get("provider_name")
    if provider_name:
        post_items_type = "embed-{}".format(str(provider_name).lower())
    else:
        post_items_type = "embed"
    return post_items_type


def resolve_embed_post_type(item):
    """
    Returns (post_items_type, post_items_icon) for a standalone embed item.
    Unknown / generic providers fall back to a site favicon when available.
    """
    meta = item.get("meta") or {}
    provider_name = meta.get("provider_name")
    post_items_type = get_embed_type(item)
    if _is_known_social_provider(provider_name):
        return post_items_type, None
    favicon = _embed_favicon_url(item)
    if favicon:
        return "embed", favicon
    return post_items_type, None


def calculate_post_type(post, items=None):
    """
    Tries to get the main post types based on the number of items related to the post
    and to the content of those items.

    Returns the post with post_items_type attribute if possible
    """

    items = items or get_related_items(post)
    items_length = len(items)
    post_items_type = None
    post_items_icon = None

    if not items_length:
        return post

    if any(
        item.get("item_type", "").lower().startswith("advertisement") for item in items
    ):
        post_items_type = "advertisement"
    elif items_length == 1:
        item = items[0]
        item_type = item.get("item_type", "").lower()

        if item_type == "embed":
            post_items_type, post_items_icon = resolve_embed_post_type(item)
        elif item_type == "poll":
            post_items_type = "poll"
        else:
            post_items_type = _editorial_display_type(item)
    else:
        editorial_items = [item for item in items if _is_editorial_item(item)]
        if editorial_items:
            post_items_type = _resolve_editorial_type(editorial_items)
        else:
            for item_type, group in groupby(items, key=lambda i: i.get("item_type")):
                if item_type == "image" and sum(1 for _ in group) > 1:
                    post_items_type = "slideshow"
                    break

    post["post_items_type"] = post_items_type
    if post_items_icon:
        post["post_items_icon"] = post_items_icon
    elif "post_items_icon" in post:
        del post["post_items_icon"]

    return post


def attach_syndication(post):
    """
    Checks if post is syndicated and fetches the reference from the database
    """

    if post.get("syndication_in"):
        post["syndication_in"] = get_resource_service("syndication_in").find_one(
            req=None, _id=post["syndication_in"]
        )


def get_first_item(post):
    """
    It gets the first related item of a post. If the post is syndicated then
    it will return the syndicated item instead as the first one
    """
    is_syndicated = post.get("syndication_in")
    main_item = {}

    try:
        for group in post["groups"]:
            if group["id"] == "main":
                if is_syndicated:
                    for ref in group["refs"]:
                        syndicated_creator = ref.get("item", {}).get(
                            "syndicated_creator"
                        )
                        if syndicated_creator:
                            main_item = ref.get("item")
                            break
                else:
                    main_item = group["refs"][0]["item"]
                    break

    except Exception as err:
        logger.info(
            "Imposible to get the main item for the post {}. Error: {}".format(
                post, err
            )
        )

    return main_item


def check_content_diff(updates, original):
    """
    Checks if there are any content differences between the original and updated
    objects
    """
    content_diff = False

    if not updates.get("groups", False):
        return content_diff

    original_refs = original["groups"][1]["refs"]
    updated_refs = updates["groups"][1]["refs"]

    if len(original_refs) != len(updated_refs):
        return True

    for index, item_ref in enumerate(updated_refs):
        service_name = item_ref.get("location", "archive")
        service = get_resource_service(service_name)
        item = service.find_one(req=None, _id=item_ref["residRef"])
        item_type = item.get("item_type")

        if item_type == "poll":
            original_poll_body = original_refs[index]["item"].get("poll_body", {})
            item_poll_body = item.get("poll_body", {})

            original_active_until = original_poll_body.get("active_until")
            item_active_until = item_poll_body.get("active_until")

            if original_active_until and item_active_until:
                if original_active_until != item_active_until:
                    return True
        else:
            if item["text"] != original_refs[index]["item"]["text"]:
                return True

    return content_diff


def update_associated_post(blog_id, item_id):
    """
    Updates all associated blog posts related to the given item i.e poll.
    """
    posts_service = get_resource_service("client_posts")

    for post in posts_service.find({"blog": blog_id, "particular_type": "post"}):
        for assoc in get_associations(post):
            if assoc.get("residRef") == item_id:
                updated_post = post.copy()
                updated_post["content_updated_date"] = utcnow()
                posts_service.update(post.get("_id"), updated_post, post)
                app.blog_cache.invalidate(blog_id)
