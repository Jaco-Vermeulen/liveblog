#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
docker compose up -d
echo ""
echo "Liveblog is starting (first run builds images and seeds the DB — can take 15+ minutes)."
echo "  UI:    http://localhost:9000"
echo "  API:   http://localhost:5000/api"
echo "  User:  admin / admin"
echo ""
echo "Logs:  docker compose logs -f"
echo "Stop:  docker compose down"
