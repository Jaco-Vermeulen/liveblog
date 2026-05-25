#!/bin/bash
# Infra readiness (compose healthchecks already passed; this is a fast sanity check).
set -euo pipefail

wait_tcp() {
  local host="$1" port="$2" name="$3"
  local i=0
  while ! timeout 1 bash -c "echo >/dev/tcp/${host}/${port}" 2>/dev/null; do
    i=$((i + 1))
    if [[ $i -ge 60 ]]; then
      echo "Timeout waiting for ${name} at ${host}:${port}"
      exit 1
    fi
    echo "waiting for ${name} on ${host}:${port}..."
    sleep 1
  done
}

wait_tcp mongodb 27017 MongoDB
wait_tcp redis 6379 Redis
wait_tcp elasticsearch 9200 Elasticsearch

echo "All infrastructure services are reachable."
