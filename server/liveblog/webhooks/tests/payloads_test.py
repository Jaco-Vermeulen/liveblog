import base64
import unittest
from unittest.mock import patch

from bson import ObjectId

from liveblog.webhooks.payloads import (
    build_excerpt_html,
    build_news_card_payload,
    graphql_post_id,
    object_id_to_database_id,
    slugify,
)


class WebhookPayloadsTestCase(unittest.TestCase):
  def test_slugify_normalizes_text(self):
    self.assertEqual(slugify("SA-nuus Headline!"), "sa-nuus-headline")

  def test_graphql_post_id_encoding(self):
    database_id = 1234
    encoded = graphql_post_id(database_id)
    self.assertEqual(base64.b64decode(encoded).decode(), "post:1234")

  def test_object_id_to_database_id_is_stable(self):
    oid = ObjectId("507f1f77bcf86cd799439011")
    self.assertEqual(object_id_to_database_id(oid), object_id_to_database_id(oid))

  def test_post_id_to_database_id_supports_newsml_urn(self):
    urn = "urn:newsml:localhost:2026-06-09T09:27:11.267459:74d836eb-1529-4d36-ad04-760de658d4c7"
    database_id = object_id_to_database_id(urn)
    self.assertIsInstance(database_id, int)
    self.assertEqual(database_id, object_id_to_database_id(urn))
    self.assertNotEqual(database_id, 1234)

  def test_build_excerpt_html_truncates_and_escapes(self):
    excerpt = build_excerpt_html("<p>Hello &amp; <b>world</b></p>" * 40, max_length=20)
    self.assertTrue(excerpt.startswith("<p>"))
    self.assertIn("…", excerpt)

  @patch("liveblog.webhooks.payloads.extract_post_items_data")
  @patch("liveblog.webhooks.payloads.extract_creator_data")
  def test_build_news_card_payload_shape(self, mock_creator, mock_items):
    post_id = ObjectId("507f1f77bcf86cd799439011")
    database_id = object_id_to_database_id(post_id)
    mock_creator.return_value = {
      "display_name": "Jane Doe",
      "first_name": "Jane",
      "last_name": "Doe",
      "picture_url": "https://example.com/avatar.jpg",
    }
    mock_items.return_value = [
      {
        "text": "<p>Excerpt HTML…</p>",
        "item_type": "text",
        "group_type": "inline",
        "meta": {},
      },
      {
        "text": "<figure><img /></figure>",
        "item_type": "image",
        "group_type": "inline",
        "meta": {
          "caption": "Caption",
          "media": {
            "renditions": {
              "viewImage": {
                "href": "https://example.com/image.jpg",
                "width": 1200,
                "height": 800,
              }
            }
          },
        },
      },
    ]

    post = {
      "_id": post_id,
      "headline": "Headline",
      "published_date": "2026-06-09T08:30:00",
      "content_updated_date": "2026-06-09T10:15:00",
      "_updated": "2026-06-09T10:15:00",
      "tags": ["politiek"],
      "blog": ObjectId(),
      "original_creator": ObjectId(),
    }
    blog = {
      "title": "SA-nuus",
      "category": "Nuus",
      "public_url": "https://example.com/nuus/sa-nuus",
    }

    payload = build_news_card_payload(post, blog=blog)
    node = payload["data"]["posts"]["nodes"][0]

    self.assertEqual(node["id"], graphql_post_id(database_id))
    self.assertEqual(node["databaseId"], database_id)
    self.assertEqual(node["title"], "Headline")
    self.assertEqual(node["excerpt"], "<p>Excerpt HTML…</p>")
    self.assertEqual(node["date"], "2026-06-09T08:30:00")
    self.assertEqual(node["modified"], "2026-06-09T10:15:00")
    self.assertEqual(node["slug"], "headline")
    self.assertEqual(node["author"]["node"]["name"], "Jane Doe")
    self.assertEqual(node["tags"]["nodes"][0]["slug"], "politiek")
    self.assertEqual(node["categories"]["nodes"][0]["name"], "Nuus")
    self.assertEqual(node["categories"]["nodes"][0]["slug"], "nuus")
    self.assertEqual(node["categories"]["nodes"][0]["uri"], "/nuus/")
    self.assertIsNone(node["featuredImage"])
    self.assertIsNone(node["frontPageBoost"])
    self.assertFalse(payload["data"]["posts"]["pageInfo"]["hasNextPage"])

  @patch("liveblog.webhooks.payloads.extract_post_items_data")
  @patch("liveblog.webhooks.payloads.extract_creator_data")
  def test_categories_empty_when_blog_has_no_category(self, mock_creator, mock_items):
    mock_creator.return_value = {"display_name": "Author"}
    mock_items.return_value = []
    post = {
      "_id": ObjectId("507f1f77bcf86cd799439011"),
      "headline": "Headline",
      "published_date": "2026-06-09T08:30:00",
      "blog": ObjectId(),
    }
    blog = {"title": "Toets Blog", "category": ""}
    node = build_news_card_payload(post, blog=blog)["data"]["posts"]["nodes"][0]
    self.assertEqual(node["categories"]["nodes"], [])

  @patch("liveblog.webhooks.payloads._resolve_author")
  @patch("liveblog.webhooks.payloads.extract_post_items_data")
  def test_featured_image_falls_back_to_blog_picture(self, mock_items, mock_author):
    mock_author.return_value = {"node": {"name": "Author"}}
    mock_items.return_value = []
    post = {
      "_id": ObjectId("507f1f77bcf86cd799439011"),
      "headline": "Headline",
      "published_date": "2026-06-09T08:30:00",
      "blog": ObjectId(),
    }
    blog = {
      "title": "Nuus",
      "picture_url": "https://example.com/blog-cover.jpg",
      "picture_renditions": {
        "viewImage": {
          "href": "https://example.com/blog-cover.jpg",
          "width": 800,
          "height": 600,
        }
      },
    }
    node = build_news_card_payload(post, blog=blog)["data"]["posts"]["nodes"][0]
    self.assertEqual(
      node["featuredImage"]["node"]["sourceUrl"], "https://example.com/blog-cover.jpg"
    )
