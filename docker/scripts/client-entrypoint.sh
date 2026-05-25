#!/bin/bash
set -euo pipefail

cd /opt/client

API_URL="${SUPERDESK_URL:-http://localhost:5000/api}"
WS_URL="${SUPERDESK_WS_URL:-ws://localhost:5100}"

if [[ ! -f node_modules/.docker-ready ]]; then
  echo "Installing client dependencies (npm ci)..."
  npm ci
  touch node_modules/.docker-ready
fi

# Fail fast if HTTPS site is configured with HTTP API (mixed content / wrong protocol)
if [[ "${SUPERDESK_CLIENT_URL:-}" == https://* && "${API_URL}" == http://* ]]; then
  echo "ERROR: SUPERDESK_CLIENT_URL is https but SUPERDESK_URL is http — fix /opt/liveblog/.env" >&2
  exit 1
fi

export SUPERDESK_URL="${API_URL}"
export SUPERDESK_WS_URL="${WS_URL}"

echo "Starting Liveblog client on :9000"
echo "  SUPERDESK_CLIENT_URL=${SUPERDESK_CLIENT_URL:-not set}"
echo "  SUPERDESK_URL=${API_URL}"
echo "  SUPERDESK_WS_URL=${WS_URL}"

exec grunt --force server --server="${API_URL}" --ws="${WS_URL}"
