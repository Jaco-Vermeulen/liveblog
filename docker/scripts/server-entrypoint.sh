#!/bin/bash
set -euo pipefail

/bin/bash /docker/scripts/wait-for-infra.sh

cd /opt/server

echo "Starting Liveblog server (honcho, WEB_CONCURRENCY=${WEB_CONCURRENCY:-1})..."
exec honcho -f /opt/docker/Procfile-dev start
