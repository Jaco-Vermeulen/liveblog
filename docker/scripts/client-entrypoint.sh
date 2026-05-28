#!/bin/bash
set -euo pipefail

cd /opt/client

API_PROXY_TARGET="${VITE_LIVEBLOG_API_URL:-http://server:5000/api}"
WS_URL="${VITE_LIVEBLOG_WS_URL:-ws://localhost:5100}"
CLIENT_PORT="${CLIENT_PORT:-9000}"

if [[ ! -x node_modules/.bin/vite ]]; then
  echo "Installing client_web2 dependencies..."
  if [[ -f package-lock.json ]]; then
    npm ci
  else
    npm install
  fi
fi

if [[ "${SUPERDESK_CLIENT_URL:-}" == https://* && "${API_PROXY_TARGET}" == http://* ]]; then
  echo "ERROR: SUPERDESK_CLIENT_URL is https but VITE_LIVEBLOG_API_URL is http — fix .env" >&2
  exit 1
fi

export VITE_LIVEBLOG_API_URL="${API_PROXY_TARGET}"
export VITE_LIVEBLOG_WS_URL="${WS_URL}"
export VITE_DEV_HOST="${VITE_DEV_HOST:-0.0.0.0}"
export CLIENT_PORT="${CLIENT_PORT}"

echo "Starting Liveblog client_web2 (Vite) on :${CLIENT_PORT}"
echo "  SUPERDESK_CLIENT_URL=${SUPERDESK_CLIENT_URL:-http://localhost:9000}"
echo "  VITE_LIVEBLOG_API_URL=${VITE_LIVEBLOG_API_URL} (Vite proxy target)"
echo "  VITE_LIVEBLOG_WS_URL=${VITE_LIVEBLOG_WS_URL}"

exec npx vite --host "${VITE_DEV_HOST}" --port "${CLIENT_PORT}"
