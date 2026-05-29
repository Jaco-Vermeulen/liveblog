#!/usr/bin/env bash
# DEV MACHINE ONLY — build theme dist, then commit + push.
# Server deploy: scripts/deploy-themes.sh (git pull + register_local_themes). No npm on server.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEFAULT="$ROOT/server/liveblog/themes/themes_assets/default"
TRIBUTE="$ROOT/server/liveblog/themes/themes_assets/tribute-light"
DIST_CSS="default-a9e961ac13.css"
DIST_JS="default-a77864ded7.js"

echo "[build-themes] default JS (gulp, Node 11 Docker, NO uglify)..."
docker run --rm -v "$DEFAULT:/w" -w /w node:11.15.0 bash -c '
  sed -i "s/deb.debian.org/archive.debian.org/g" /etc/apt/sources.list
  sed -i "s|security.debian.org|archive.debian.org|g" /etc/apt/sources.list
  sed -i "/stretch-updates/d" /etc/apt/sources.list
  apt-get update -qq
  apt-get install -y -qq --allow-unauthenticated git python make g++
  rm -rf node_modules
  npm install
  NODE_ENV=development npx gulp production
'

echo "[build-themes] pin default dist filenames..."
BUILT_CSS="$(node -pe "require('$DEFAULT/dist/rev-manifest.json')['default.css']")"
BUILT_JS="$(node -pe "require('$DEFAULT/dist/rev-manifest.json')['default.js']")"
cp "$DEFAULT/dist/$BUILT_CSS" "$DEFAULT/dist/$DIST_CSS"
cp "$DEFAULT/dist/$BUILT_JS" "$DEFAULT/dist/$DIST_JS"
node -e "
const fs=require('fs');
const p='$DEFAULT/dist/rev-manifest.json';
fs.writeFileSync(p, JSON.stringify({ 'default.css': '$DIST_CSS', 'default.js': '$DIST_JS' }, null, 2) + '\n');
const t=JSON.parse(fs.readFileSync('$DEFAULT/theme.json','utf8'));
t.version=(parseFloat(t.version)+0.1).toFixed(1);
t.devStyles=['dist/$DIST_CSS'];
t.devScripts=['dist/$DIST_JS'];
t.styles=['dist/$DIST_CSS'];
t.scripts=['dist/$DIST_JS'];
fs.writeFileSync('$DEFAULT/theme.json', JSON.stringify(t, null, 4) + '\n');
"

echo "[build-themes] tribute-light CSS..."
(cd "$TRIBUTE" && npm ci && npm run build:css)

echo "[build-themes] done."
echo "  default: dist/$DIST_CSS dist/$DIST_JS"
echo "  tribute-light: dist/tribute-light.css"
echo "Commit dist/ + theme.json + rev-manifest.json, then push."
