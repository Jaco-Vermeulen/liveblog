import unittest

from liveblog.items.media_pictures import picture_preview_url, sanitize_media_picture


class MediaPicturesTest(unittest.TestCase):
    def test_picture_preview_url_prefers_view_image(self):
        renditions = {
            "thumbnail": {"href": "https://example.com/thumb.jpg"},
            "viewImage": {"href": "https://example.com/view.jpg"},
        }
        self.assertEqual(picture_preview_url(renditions), "https://example.com/view.jpg")

    def test_sanitize_media_picture_rejects_missing_renditions(self):
        self.assertIsNone(sanitize_media_picture({"_id": "1", "renditions": {}}))

    def test_sanitize_media_picture_keeps_valid_picture(self):
        doc = {
            "_id": "1",
            "unique_name": "cover.jpg",
            "renditions": {"viewImage": {"href": "https://example.com/cover.jpg"}},
        }
        sanitized = sanitize_media_picture(doc)
        self.assertEqual(sanitized["_id"], "1")
        self.assertEqual(
            picture_preview_url(sanitized["renditions"]), "https://example.com/cover.jpg"
        )


if __name__ == "__main__":
    unittest.main()
