import logging

import pymongo
from eve.utils import ParsedRequest
from superdesk import get_resource_service
from superdesk.resource import Resource
from superdesk.services import BaseService

logger = logging.getLogger(__name__)


def picture_preview_url(renditions):
    if not renditions:
        return None
    for key in ("viewImage", "thumbnail", "baseImage"):
        rendition = renditions.get(key) or {}
        href = (rendition.get("href") or "").strip()
        if href:
            return href
    return None


def sanitize_media_picture(doc):
    renditions = doc.get("renditions") or {}
    preview = picture_preview_url(renditions)
    if not preview:
        return None
    return {
        "_id": doc.get("_id"),
        "type": doc.get("type") or "picture",
        "unique_name": doc.get("unique_name"),
        "_updated": doc.get("_updated"),
        "renditions": renditions,
    }


def media_pictures_query():
    return {
        "type": "picture",
        "$or": [
            {"state": {"$exists": False}},
            {"state": {"$nin": ["deleted", "spiked", "recalled"]}},
        ],
    }


class MediaPicturesService(BaseService):
    """List uploaded picture archive entries for all users (mongo, no desk filter)."""

    def get(self, req, lookup):
        req = req or ParsedRequest()
        max_results = min(int(req.max_results or 200), 500)
        page = max(int(req.page or 1), 1)
        skip = (page - 1) * max_results

        archive = get_resource_service("archive")
        return (
            archive.find(media_pictures_query())
            .sort("_updated", pymongo.DESCENDING)
            .skip(skip)
            .limit(max_results)
        )

    def on_fetched(self, docs):
        super().on_fetched(docs)
        docs["_items"] = [
            item
            for item in (sanitize_media_picture(doc) for doc in docs.get("_items", []))
            if item
        ]


class MediaPicturesResource(Resource):
    url = "media_pictures"
    datasource = {
        "source": "archive",
        "search_backend": None,
        "default_sort": [("_updated", -1)],
    }
    resource_methods = ["GET"]
    item_methods = []
    privileges = {"GET": "posts"}
