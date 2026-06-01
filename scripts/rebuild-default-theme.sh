#!/usr/bin/env bash
# Rebuild default theme JS/CSS bundle (required after viewmodel.js / view.js changes).
# Staging hosts often have no Node/npm — we fall back to a one-off Docker container.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
THEME_DIR="${ROOT}/server/liveblog/themes/themes_assets/default"
NODE_IMAGE="${LIVEBLOG_THEME_NODE_IMAGE:-node:16-bullseye}"

log() { echo "[liveblog] $*"; }
die() { echo "[liveblog] ERROR: $*" >&2; exit 1; }

[[ -d "${THEME_DIR}" ]] || die "Theme directory not found: ${THEME_DIR}"
[[ -f "${THEME_DIR}/package.json" ]] || die "Missing ${THEME_DIR}/package.json"

run_npm_build() {
  cd "${THEME_DIR}"
  if [[ ! -d node_modules ]]; then
    log "npm ci in ${THEME_DIR}"
    npm ci
  fi
  log "npm run build"
  npm run build
}

run_docker_build() {
  command -v docker >/dev/null 2>&1 || die "npm not found and docker is not available"
  log "Building theme via Docker (${NODE_IMAGE})"
  docker run --rm \
    -v "${THEME_DIR}:/theme" \
    -w /theme \
    "${NODE_IMAGE}" \
    bash -lc 'set -euo pipefail
      if [[ ! -d node_modules ]]; then npm ci; fi
      npm run build'
}

if command -v npm >/dev/null 2>&1; then
  run_npm_build
elif command -v docker >/dev/null 2>&1; then
  run_docker_build
else
  die "Install Node/npm, or Docker, then re-run: bash scripts/rebuild-default-theme.sh"
fi

log "Rebuilt default theme dist in ${THEME_DIR}/dist"
