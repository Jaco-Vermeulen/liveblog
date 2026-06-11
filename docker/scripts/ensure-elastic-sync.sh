#!/bin/bash
# Keep Elasticsearch in sync with Mongo after ES volume wipes or failed init.
# Mongo is the source of truth; ES is only the search index for list/filter queries.
set -euo pipefail

ES_URL="${ELASTICSEARCH_URL:-http://elasticsearch:9200}"
ES_INDEX="${ELASTICSEARCH_INDEX:-liveblog}"
MONGO_URI="${MONGO_URI:-mongodb://mongodb:27017/liveblog}"

if ! curl -sf "${ES_URL}/_cluster/health" >/dev/null 2>&1; then
  echo "ensure-elastic-sync: Elasticsearch not reachable, skipping."
  exit 0
fi

cd /opt/server

if ! curl -sf "${ES_URL}/${ES_INDEX}" >/dev/null 2>&1; then
  echo "ensure-elastic-sync: alias ${ES_INDEX} missing — rebuilding index..."
  if ! python3 manage.py app:rebuild_elastic_index --index="${ES_INDEX}"; then
    echo "ensure-elastic-sync: WARN rebuild failed — starting API anyway (posts may be empty until reindex)"
  fi
fi

es_count() {
  local resource="$1"
  curl -sf "${ES_URL}/${ES_INDEX}/${resource}/_count" 2>/dev/null \
    | python3 -c "import sys,json; print(json.load(sys.stdin).get('count',0))" 2>/dev/null \
    || echo 0
}

mongo_count() {
  local collection="$1"
  mongo "${MONGO_URI}" --quiet --eval "db.${collection}.count()" 2>/dev/null || echo 0
}

sync_if_behind() {
  local mongo_collection="$1"
  local es_resource="$2"
  local mongo_n es_n

  mongo_n="$(mongo_count "${mongo_collection}")"
  es_n="$(es_count "${es_resource}")"

  if [[ "${mongo_n}" =~ ^[0-9]+$ ]] && [[ "${es_n}" =~ ^[0-9]+$ ]] && [[ "${mongo_n}" -gt "${es_n}" ]]; then
    echo "ensure-elastic-sync: ${mongo_collection} — Mongo ${mongo_n}, ES ${es_n} — reindexing..."
    if ! python3 manage.py app:index_from_mongo --from="${es_resource}"; then
      echo "ensure-elastic-sync: WARN index_from_mongo ${es_resource} failed — continuing"
    fi
  fi
}

# blogs list API → mongo blogs / elastic blogs
sync_if_behind "blogs" "blogs"
# blog timeline posts → mongo archive / elastic archive (particular_type=post)
sync_if_behind "archive" "archive"
