from unittest import TestCase

from liveblog.posts import utils as post_utils


def _text_item(text):
    return {"item_type": "text", "text": text}


def _image_item():
    return {"item_type": "image", "text": "https://example.com/photo.jpg"}


def _embed_item(provider_name, url="https://example.com/article"):
    return {
        "item_type": "embed",
        "text": "<iframe></iframe>",
        "meta": {
            "provider_name": provider_name,
            "provider_url": url,
            "original_url": url,
        },
    }


class CalculatePostTypeTestCase(TestCase):
    def test_single_text_uses_text_type(self):
        post = {}
        post_utils.calculate_post_type(post, [_text_item("Hello")])
        self.assertEqual(post["post_items_type"], "text")

    def test_image_and_text_use_tree_avatar_type(self):
        post = {}
        post_utils.calculate_post_type(post, [_image_item(), _text_item("Caption")])
        self.assertEqual(post["post_items_type"], "image")

    def test_text_and_embed_with_custom_text_use_tree_avatar(self):
        post = {}
        post_utils.calculate_post_type(
            post, [_text_item("Our take on the story"), _embed_item("Twitter")]
        )
        self.assertEqual(post["post_items_type"], "text")
        self.assertNotIn("post_items_icon", post)

    def test_embed_only_known_social_uses_provider_type(self):
        post = {}
        post_utils.calculate_post_type(post, [_embed_item("Facebook")])
        self.assertEqual(post["post_items_type"], "embed-facebook")
        self.assertNotIn("post_items_icon", post)

    def test_embed_only_unknown_provider_uses_favicon(self):
        post = {}
        post_utils.calculate_post_type(
            post, [_embed_item("Example", "https://news.example.com/story")]
        )
        self.assertEqual(post["post_items_type"], "embed")
        self.assertEqual(
            post["post_items_icon"],
            "https://www.google.com/s2/favicons?domain=news.example.com&sz=64",
        )

    def test_multiple_images_without_text_use_slideshow(self):
        post = {}
        post_utils.calculate_post_type(
            post, [_image_item(), _image_item(), _image_item()]
        )
        self.assertEqual(post["post_items_type"], "slideshow")

    def test_poll_with_text_uses_poll(self):
        post = {}
        post_utils.calculate_post_type(
            post,
            [
                {"item_type": "poll", "poll_body": {"question": "Q?"}},
                _text_item("Context"),
            ],
        )
        self.assertEqual(post["post_items_type"], "poll")
