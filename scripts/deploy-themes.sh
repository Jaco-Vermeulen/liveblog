#!/usr/bin/env bash
# Deploy prebuilt theme dist from git — NO npm, NO gulp on the server.
set -euo pipefail
INSTALL_DIR="${INSTALL_DIR:-/opt/liveblog}"
cd "${INSTALL_DIR}"
git pull origin master
docker compose exec -T server bash -c 'cd /opt/server && python3 manage.py register_local_themes'
docker compose restart server
echo "Themes deployed from committed dist/. Hard-refresh embeds."
