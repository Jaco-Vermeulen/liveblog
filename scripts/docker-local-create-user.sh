#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
docker compose run --rm -e LIVEBLOG_FORCE_INIT=1 init
