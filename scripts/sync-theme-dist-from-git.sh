#!/usr/bin/env bash
# Force theme dist on disk to match git HEAD (fixes stale/corrupt working tree).
set -euo pipefail
INSTALL_DIR="${INSTALL_DIR:-/opt/liveblog}"
cd "${INSTALL_DIR}"

echo "[sync-theme-dist] git HEAD: $(git log -1 --oneline)"
THEME_FILES=(
  server/liveblog/themes/themes_assets/tribute-light/dist/tribute-light.css
  server/liveblog/themes/themes_assets/tribute-light/theme.json
  server/liveblog/themes/themes_assets/tribute-light/templates
  server/liveblog/themes/themes_assets/default/dist/default-a9e961ac13.css
  server/liveblog/themes/themes_assets/default/dist/default-a77864ded7.js
  server/liveblog/themes/themes_assets/default/theme.json
  server/liveblog/themes/themes_assets/default/dist/rev-manifest.json
)

git checkout HEAD -- "${THEME_FILES[@]}"

echo -n "[sync-theme-dist] tribute-light.css scorecard rules: "
grep -c lb-scorecard-card server/liveblog/themes/themes_assets/tribute-light/dist/tribute-light.css

echo "[sync-theme-dist] registering themes in Mongo..."
docker compose exec -T server bash -c 'cd /opt/server && python3 manage.py register_local_themes'

curl -sf "http://127.0.0.1:5000/theme-redeploy/tribute-light" >/dev/null || true
curl -sf "http://127.0.0.1:5000/theme-redeploy/default" >/dev/null || true

echo -n "[sync-theme-dist] HTTP scorecard rules: "
curl -s "http://127.0.0.1:5000/themes_assets/tribute-light/dist/tribute-light.css" | grep -c lb-scorecard-card || true

docker compose restart server
echo "[sync-theme-dist] done."
