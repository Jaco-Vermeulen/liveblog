from liveblog.blogs.blog import Blog
from superdesk import get_resource_service
from eve.io.base import DataLayer


def resolve_live_headline(blog_id):
    """
    Return the headline from the newest published open post that opts in to
    updating the live blog title, or None when no post qualifies.
    """
    blog = Blog(blog_id)
    posts = blog.posts(wrap=True, limit=50, ordering="newest_first")
    for post in posts.get("_items", []):
        if not post.get("show_headline"):
            continue
        headline = (post.get("headline") or "").strip()
        if headline:
            return headline
    return None


def refresh_blog_current_headline(blog_id):
    """Persist the resolved live headline on the blog document."""
    blogs = get_resource_service("client_blogs")
    blog = blogs.find_one(req=None, _id=blog_id)
    if not blog:
        return None

    headline = resolve_live_headline(blog_id)
    if blog.get("current_headline") == headline:
        return headline

    updates = {"current_headline": headline}
    try:
        blogs.system_update(blog_id, updates, blog)
    except DataLayer.OriginalChangedError:
        blog = blogs.find_one(req=None, _id=blog_id)
        blogs.system_update(blog_id, updates, blog)
    return headline


def prepare_blog_for_embed(blog):
    """
    Copy blog for public embed rendering.

    Preserves the settings title in ``settings_title`` and sets ``title`` to the
    live headline when one is active.
    """
    blog = dict(blog)
    settings_title = blog.get("title", "")
    blog["settings_title"] = settings_title
    live = (blog.get("current_headline") or "").strip()
    blog["title"] = live or settings_title
    return blog
