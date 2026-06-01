#!/usr/bin/env bash
# Rebuild default theme JS/CSS bundle (required after viewmodel.js / view.js changes).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
THEME_DIR="${ROOT}/server/liveblog/themes/themes_assets/default"
cd "${THEME_DIR}"
if [[ ! -d node_modules ]]; then
  npm ci
fi
npm run build
echo "[liveblog] Rebuilt default theme dist in ${THEME_DIR}/dist"
