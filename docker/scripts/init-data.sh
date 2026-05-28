#!/bin/bash
set -euo pipefail

MARKER="${LIVEBLOG_INIT_MARKER:-/data/.liveblog-initialized}"
ES_URL="${ELASTICSEARCH_URL:-http://elasticsearch:9200}"
ES_INDEX="${ELASTICSEARCH_INDEX:-liveblog}"

if [[ -f "${MARKER}" && "${LIVEBLOG_FORCE_INIT:-0}" != "1" ]]; then
  echo "Init already completed (${MARKER}). Set LIVEBLOG_FORCE_INIT=1 to re-run."
  exit 0
fi

/bin/bash /docker/scripts/wait-for-infra.sh

cd /opt/server

echo "Ensuring Elasticsearch index ${ES_INDEX}..."
if ! curl -sf "${ES_URL}/${ES_INDEX}" >/dev/null 2>&1; then
  curl -sf -X POST "${ES_URL}/${ES_INDEX}" >/dev/null || true
fi

echo "Initializing Liveblog data..."
set +u
python3 manage.py app:initialize_data
python3 manage.py users:create -u admin -p admin -e 'admin@example.com' --admin --firstname Admin --lastname User || true
python3 manage.py register_local_themes
python3 manage.py app:rebuild_elastic_index --index="${ES_INDEX}"
python3 manage.py app:index_from_mongo --from=blogs
python3 manage.py app:index_from_mongo --from=archive
set -u

mkdir -p "$(dirname "${MARKER}")"
touch "${MARKER}"
echo "Liveblog initialized. Open http://localhost:9000 — login admin / admin"
