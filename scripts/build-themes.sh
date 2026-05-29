#!/usr/bin/env bash
# Build default + tribute-light theme dist (commit output — server git pull needs no npm).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEFAULT="$ROOT/server/liveblog/themes/themes_assets/default"
TRIBUTE="$ROOT/server/liveblog/themes/themes_assets/tribute-light"

echo "[build-themes] default (gulp, Node 11 Docker)..."
docker run --rm -v "$DEFAULT:/w" -w /w node:11.15.0 bash -c '
  sed -i "s/deb.debian.org/archive.debian.org/g" /etc/apt/sources.list
  sed -i "s|security.debian.org|archive.debian.org|g" /etc/apt/sources.list
  sed -i "/stretch-updates/d" /etc/apt/sources.list
  apt-get update -qq
  apt-get install -y -qq --allow-unauthenticated git python make g++
  rm -rf node_modules
  npm install
  npm run build
'

echo "[build-themes] tribute-light CSS..."
(cd "$TRIBUTE" && npm ci && npm run build:css)

echo "[build-themes] done. Commit dist/ + theme.json + rev-manifest.json"
