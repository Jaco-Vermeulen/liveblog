import ast
import unittest
from unittest.mock import MagicMock

from bson import ObjectId

from liveblog.webhooks.test_delivery import (
    _latest_post_across_blogs,
    _latest_post_for_blog,
)


class TestDeliverySortTestCase(unittest.TestCase):
    def test_eve_sort_string_is_not_elastic_literal(self):
        with self.assertRaises(ValueError):
            ast.literal_eval("-order")

    def test_latest_post_for_blog_uses_mongo_not_elastic(self):
        posts_service = MagicMock()
        posts_service.get_from_mongo.return_value = iter(
            [{"_id": "post-1", "order": 5.0, "post_status": "open", "deleted": False}]
        )
        blog_id = ObjectId()

        post = _latest_post_for_blog(posts_service, blog_id)

        self.assertEqual(post["_id"], "post-1")
        posts_service.get_from_mongo.assert_called_once()
        posts_service.get.assert_not_called()
        _, kwargs = posts_service.get_from_mongo.call_args
        self.assertEqual(kwargs["lookup"]["blog"], blog_id)
        self.assertEqual(kwargs["lookup"]["post_status"], "open")
        self.assertFalse(kwargs["lookup"]["deleted"])
        self.assertEqual(kwargs["req"].sort, "-order")
        self.assertEqual(kwargs["req"].max_results, 1)

    def test_latest_post_across_blogs_uses_mongo_not_elastic(self):
        posts_service = MagicMock()
        posts_service.get_from_mongo.return_value = iter(
            [{"_id": "post-2", "order": 1.0, "post_status": "open", "deleted": False}]
        )

        post = _latest_post_across_blogs(posts_service)

        self.assertEqual(post["_id"], "post-2")
        posts_service.get_from_mongo.assert_called_once()
        posts_service.get.assert_not_called()
