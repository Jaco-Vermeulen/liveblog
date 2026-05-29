from flask.helpers import send_from_directory


def send_themes_assets_static_file(app, static_folder):
    """Serve bundled theme static files from disk (themes_assets/)."""

    def _inner(filename):
        cache_timeout = app.config["SEND_FILE_MAX_AGE_DEFAULT"]
        return send_from_directory(
            static_folder, filename, cache_timeout=cache_timeout.total_seconds()
        )

    return _inner


def send_uploaded_static_file(app):
    """
    Function used internally to send theme uploaded static
    files from the static folder to the browser.
    """

    def _inner(filename):
        cache_timeout = app.config["SEND_FILE_MAX_AGE_DEFAULT"]
        static_folder = app.config["UPLOAD_THEMES_DIRECTORY"]
        return send_from_directory(
            static_folder, filename, cache_timeout=cache_timeout.total_seconds()
        )

    return _inner
