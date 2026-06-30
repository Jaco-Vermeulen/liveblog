#!/usr/bin/env bash
# Copied from Windows? Re-run through sed once (before set -euo pipefail).
if [[ -z "${__DEPLOY_LF_OK:-}" ]]; then
  export __DEPLOY_LF_OK=1
  exec bash <(sed 's/\r$//' "${BASH_SOURCE[0]:-$0}") "$@"
fi
# =============================================================================
# LIVEBLOG production deploy — copy this ONE file to the server, then run:
#
#   sudo bash /root/deploy-liveblog.sh
#
# Pulls /opt/liveblog from GitHub, updates Docker, nginx, and TLS.
# =============================================================================
set -euo pipefail

# ─── CONFIG ───────────────────────────────────────────────────────────────────

REPO_URL="https://github.com/Jaco-Vermeulen/liveblog.git"
BRANCH="master"
INSTALL_DIR="/opt/liveblog"

# Canonical domain — SUPERDESK_* URLs, emails, stored embed links use this host
PUBLIC_HOST="live.maroelamedia.co.za"
# Extra hostnames on the same box (space-separated) — nginx + TLS SAN cert
EXTRA_SERVER_NAMES="live.nuwe-maroela.co.za maroelablog.jnb1.cloudlet.cloud"

USE_NGINX="true"
USE_HTTPS="true"
INSTALL_NGINX="true"
CERTBOT_EMAIL="geen-antwoord@maroelamedia.co.za"

API_PORT="5000"
WS_PORT="5100"
UI_PORT="9000"

LIVEBLOG_DEBUG="false"
EMBED_PROTOCOL=""
SUPERDESK_TESTING="false"
SUPERDESK_RELOAD="false"
# Empty = auto (2 × CPU + 1) via gunicorn_config.py at container start
WEB_CONCURRENCY=""
WEB_TIMEOUT="120"
ELASTIC_AUTO_REINDEX_ON_500="false"
# Empty = auto (2 × CPU) via apply_worker_scaling()
CELERY_WORKER_CONCURRENCY=""
IFRAMELY_KEY="a5ee9a89addd13b7a2e3a48c23e74e8d"

AMAZON_ACCESS_KEY_ID=""
AMAZON_SECRET_ACCESS_KEY=""
AMAZON_REGION=""
AMAZON_CONTAINER_NAME=""
SENTRY_DSN=""

# Mandrill (Mailchimp Transactional) — password is the API key; username is not validated by Mandrill
MAIL_SERVER="smtp.mandrillapp.com"
MAIL_PORT="587"
MAIL_USE_TLS="true"
MAIL_USE_SSL="false"
MAIL_USERNAME="Maroela Media"
MAIL_PASSWORD="md-Gx3eRIxK5Gu77P-HHycn3w"
MAIL_FROM="geen-antwoord@maroelamedia.co.za"
MAIL_SUPPRESS_SEND="false"

INSTALL_DOCKER="true"
FRESH_INSTALL="false"

SUPERDESK_URL=""
SUPERDESK_WS_URL=""
SUPERDESK_CLIENT_URL=""

# ─── end CONFIG ───────────────────────────────────────────────────────────────

PKG_MGR=""

log() { echo "[liveblog] $*"; }
die() { echo "[liveblog] ERROR: $*" >&2; exit 1; }

if [[ "${EUID}" -ne 0 ]]; then
  die "Run as root: sudo bash $0"
fi

detect_pkg_mgr() {
  if [[ -n "${PKG_MGR}" ]]; then
    return 0
  fi
  if command -v apt-get >/dev/null 2>&1; then
    PKG_MGR="apt"
  elif command -v apk >/dev/null 2>&1; then
    PKG_MGR="apk"
  elif command -v dnf >/dev/null 2>&1; then
    PKG_MGR="dnf"
  elif command -v yum >/dev/null 2>&1; then
    PKG_MGR="yum"
  else
    die "No package manager (need apt, apk, dnf, or yum)"
  fi
  log "Package manager: ${PKG_MGR}"
}

pkg_update() {
  detect_pkg_mgr
  case "${PKG_MGR}" in
    apt) apt-get update -qq ;;
    apk) apk update ;;
    dnf) dnf check-update -q; true ;;
    yum) yum check-update -q; true ;;
  esac
}

pkg_install() {
  detect_pkg_mgr
  pkg_update
  case "${PKG_MGR}" in
    apt) apt-get install -y -qq "$@" ;;
    apk) apk add --no-cache "$@" ;;
    dnf) dnf install -y -q "$@" ;;
    yum) yum install -y -q "$@" ;;
  esac
}

svc_enable() {
  local name="$1"
  if command -v systemctl >/dev/null 2>&1; then
    systemctl enable "${name}" 2>/dev/null || true
    systemctl start "${name}" 2>/dev/null || true
  elif command -v rc-update >/dev/null 2>&1; then
    rc-update add "${name}" default 2>/dev/null || true
    rc-service "${name}" start 2>/dev/null || true
  elif command -v service >/dev/null 2>&1; then
    service "${name}" start 2>/dev/null || true
  fi
}

svc_reload() {
  local name="$1"
  if command -v systemctl >/dev/null 2>&1; then
    systemctl reload "${name}" 2>/dev/null || systemctl restart "${name}"
  elif command -v rc-service >/dev/null 2>&1; then
    rc-service "${name}" reload 2>/dev/null || rc-service "${name}" restart
  elif command -v service >/dev/null 2>&1; then
    service "${name}" reload 2>/dev/null || service "${name}" restart
  fi
}

normalize_public_host() {
  PUBLIC_HOST="${PUBLIC_HOST#http://}"
  PUBLIC_HOST="${PUBLIC_HOST#https://}"
  PUBLIC_HOST="${PUBLIC_HOST%%/}"
  PUBLIC_HOST="${PUBLIC_HOST%%/*}"
}

resolve_public_host() {
  normalize_public_host
  if [[ -z "${PUBLIC_HOST}" || "${PUBLIC_HOST}" == "CHANGE_ME" ]]; then
    if [[ "${USE_NGINX}" == "true" ]]; then
      die "Set PUBLIC_HOST to your domain (no http://)"
    fi
    PUBLIC_HOST="$(curl -fsSL --max-time 5 https://api.ipify.org 2>/dev/null || true)"
    if [[ -z "${PUBLIC_HOST}" ]]; then
      PUBLIC_HOST="$(hostname -I 2>/dev/null | awk '{print $1}')"
    fi
    if [[ -z "${PUBLIC_HOST}" ]]; then
      die "Set PUBLIC_HOST in CONFIG"
    fi
    normalize_public_host
    log "Auto PUBLIC_HOST=${PUBLIC_HOST}"
  fi
  if [[ "${USE_NGINX}" == "true" && "${PUBLIC_HOST}" =~ ^[0-9.]+$ ]]; then
    die "USE_NGINX=true needs a domain name, not an IP"
  fi
  log "PUBLIC_HOST=${PUBLIC_HOST} (canonical)"
  if [[ -n "${EXTRA_SERVER_NAMES}" ]]; then
    log "EXTRA_SERVER_NAMES=${EXTRA_SERVER_NAMES}"
  fi
}

install_docker() {
  if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
    log "Docker OK"
    return 0
  fi
  if [[ "${INSTALL_DOCKER}" != "true" ]]; then
    die "Install Docker or set INSTALL_DOCKER=true"
  fi
  log "Installing Docker..."
  pkg_install ca-certificates curl git
  if ! command -v docker >/dev/null 2>&1; then
    curl -fsSL https://get.docker.com | sh
  fi
  case "${PKG_MGR}" in
    apt) pkg_install docker-compose-plugin 2>/dev/null || true ;;
    apk) pkg_install docker-cli-compose 2>/dev/null || true ;;
    dnf|yum) pkg_install docker-compose-plugin 2>/dev/null || true ;;
  esac
  svc_enable docker
  if ! docker compose version >/dev/null 2>&1; then
    die "docker compose missing after install"
  fi
}

apply_https_env() {
  if [[ "${USE_HTTPS}" != "true" ]]; then
    return 0
  fi
  LIVEBLOG_DEBUG="false"
  EMBED_PROTOCOL="https://"
  log "HTTPS: LIVEBLOG_DEBUG=false EMBED_PROTOCOL=https://"
}

build_urls() {
  apply_https_env
  local s="http"
  local ws="ws"
  if [[ "${USE_HTTPS}" == "true" ]]; then
    s="https"
    ws="wss"
  fi
  if [[ "${USE_NGINX}" == "true" ]]; then
    if [[ -z "${SUPERDESK_URL}" ]]; then
      SUPERDESK_URL="${s}://${PUBLIC_HOST}/api"
    fi
    if [[ -z "${SUPERDESK_WS_URL}" ]]; then
      SUPERDESK_WS_URL="${ws}://${PUBLIC_HOST}/ws"
    fi
    if [[ -z "${SUPERDESK_CLIENT_URL}" ]]; then
      SUPERDESK_CLIENT_URL="${s}://${PUBLIC_HOST}"
    fi
  else
    if [[ -z "${SUPERDESK_URL}" ]]; then
      SUPERDESK_URL="${s}://${PUBLIC_HOST}:${API_PORT}/api"
    fi
    if [[ -z "${SUPERDESK_WS_URL}" ]]; then
      SUPERDESK_WS_URL="${ws}://${PUBLIC_HOST}:${WS_PORT}"
    fi
    if [[ -z "${SUPERDESK_CLIENT_URL}" ]]; then
      SUPERDESK_CLIENT_URL="${s}://${PUBLIC_HOST}:${UI_PORT}"
    fi
  fi
  log "SUPERDESK_URL=${SUPERDESK_URL}"
  log "SUPERDESK_WS_URL=${SUPERDESK_WS_URL}"
  log "SUPERDESK_CLIENT_URL=${SUPERDESK_CLIENT_URL}"
}

nginx_conf_path() {
  case "${PKG_MGR}" in
    apt) echo "/etc/nginx/sites-available/liveblog" ;;
    apk) echo "/etc/nginx/http.d/liveblog.conf" ;;
    dnf|yum) echo "/etc/nginx/conf.d/liveblog.conf" ;;
  esac
}

# Shared location blocks — /embed goes to API :5000 (NOT /api/embed, NOT :9000)
write_nginx_locations() {
  cat <<NGX
    location /api {
        proxy_pass http://liveblog_api;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_connect_timeout 10s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
        proxy_redirect off;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location = /embed.js {
        proxy_pass http://liveblog_ui;
        proxy_set_header Host \$host;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location ^~ /embed/ {
        proxy_pass http://liveblog_api;
        proxy_redirect off;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /themes_assets/ {
        alias ${INSTALL_DIR:-/opt/liveblog}/server/liveblog/themes/themes_assets/;
    }

    location /themes_uploads {
        proxy_pass http://liveblog_api;
        proxy_set_header Host \$host;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /ws {
        proxy_pass http://liveblog_ws;
        proxy_http_version 1.1;
        proxy_buffering off;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location / {
        proxy_pass http://liveblog_ui;
        proxy_connect_timeout 60s;
        proxy_read_timeout 300s;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
NGX
}

nginx_server_names() {
  local names="${PUBLIC_HOST}"
  if [[ -n "${EXTRA_SERVER_NAMES}" ]]; then
    names="${names} ${EXTRA_SERVER_NAMES}"
  fi
  echo "${names}"
}

nginx_tls_host() {
  local h
  for h in "${PUBLIC_HOST}" ${EXTRA_SERVER_NAMES}; do
    [[ -d "/etc/letsencrypt/live/${h}" ]] && echo "${h}" && return 0
  done
  return 1
}

write_nginx_config_file() {
  local site ssl_block="" tls_host names
  site="$(nginx_conf_path)"
  names="$(nginx_server_names)"
  mkdir -p "$(dirname "${site}")"
  if tls_host="$(nginx_tls_host)"; then
    ssl_block="
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name ${names};
    client_max_body_size 50m;
    ssl_certificate /etc/letsencrypt/live/${tls_host}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${tls_host}/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
$(write_nginx_locations)
}
"
  fi
  cat >"${site}" <<NGX
# Liveblog — written by deploy-liveblog.sh (do not hand-edit; re-run deploy)
upstream liveblog_api { server 127.0.0.1:${API_PORT}; }
upstream liveblog_ws  { server 127.0.0.1:${WS_PORT}; }
upstream liveblog_ui  { server 127.0.0.1:${UI_PORT}; }

server {
    listen 80;
    listen [::]:80;
    server_name ${names};
    client_max_body_size 50m;
$(write_nginx_locations)
}
${ssl_block}
NGX
  log "Wrote nginx config: ${site}"
}

enable_nginx_site_only() {
  local site f
  site="$(nginx_conf_path)"
  case "${PKG_MGR}" in
    apt)
      mkdir -p /etc/nginx/sites-enabled /etc/nginx/sites-available
      rm -f /etc/nginx/sites-enabled/default
      for f in /etc/nginx/sites-enabled/*; do
        [[ -e "${f}" ]] || continue
        [[ "$(readlink -f "${f}" 2>/dev/null || echo "${f}")" == "${site}" ]] && continue
        rm -f "${f}"
        log "Disabled old nginx site: ${f}"
      done
      ln -sf "${site}" /etc/nginx/sites-enabled/liveblog
      ;;
    apk)
      rm -f /etc/nginx/http.d/default.conf 2>/dev/null || true
      for f in /etc/nginx/http.d/*.conf; do
        [[ -f "${f}" && "${f}" != "${site}" ]] || continue
        rm -f "${f}"
        log "Disabled old nginx site: ${f}"
      done
      ;;
    dnf|yum)
      rm -f /etc/nginx/conf.d/default.conf 2>/dev/null || true
      for f in /etc/nginx/conf.d/*.conf; do
        [[ -f "${f}" && "${f}" != "${site}" ]] || continue
        rm -f "${f}"
        log "Disabled old nginx site: ${f}"
      done
      ;;
  esac
}

nginx_reload() {
  nginx -t
  svc_enable nginx
  svc_reload nginx
}

nginx_verify_embed() {
  local site
  site="$(nginx_conf_path)"
  if ! grep -qE 'location.*/embed' "${site}" 2>/dev/null; then
    die "Config file missing /embed: ${site} — re-run deploy script"
  fi
  log "Config file OK: ${site} has location /embed"
  if nginx -T 2>/dev/null | grep -qE 'location.*/embed'; then
    log "nginx active: location /embed → :${API_PORT}"
    return 0
  fi
  log "WARN: config has /embed but nginx -T does not — reloading..."
  nginx_reload
  if nginx -T 2>/dev/null | grep -qE 'location.*/embed'; then
    log "nginx active after reload"
    return 0
  fi
  die "nginx -T still missing /embed — run: nginx -T | grep server_name; check $(dirname "${site}")"
}

install_nginx() {
  if [[ "${USE_NGINX}" != "true" || "${INSTALL_NGINX}" != "true" ]]; then
    return 0
  fi
  detect_pkg_mgr
  log "Installing/configuring nginx for ${PUBLIC_HOST}..."
  pkg_install nginx
  write_nginx_config_file
  enable_nginx_site_only
  nginx_reload
  nginx_verify_embed
}

certbot_domain_list() {
  local h
  echo -n "${PUBLIC_HOST}"
  for h in ${EXTRA_SERVER_NAMES}; do
    [[ -n "${h}" ]] || continue
    echo -n " ${h}"
  done
}

install_tls() {
  if [[ "${USE_NGINX}" != "true" || "${USE_HTTPS}" != "true" || -z "${CERTBOT_EMAIL}" ]]; then
    return 0
  fi
  local domains h certbot_args=()
  domains="$(certbot_domain_list)"
  log "certbot domains:${domains}"
  case "${PKG_MGR}" in
    apt) pkg_install certbot python3-certbot-nginx ;;
    apk) pkg_install certbot ;;
    dnf|yum) pkg_install certbot python3-certbot-nginx ;;
  esac
  certbot_args=(--nginx --non-interactive --agree-tos -m "${CERTBOT_EMAIL}" --redirect)
  for h in ${domains}; do
    certbot_args+=(-d "${h}")
  done
  if [[ -d "/etc/letsencrypt/live/${PUBLIC_HOST}" ]]; then
    certbot_args+=(--cert-name "${PUBLIC_HOST}" --expand)
  elif [[ -d "/etc/letsencrypt/live/maroelablog.jnb1.cloudlet.cloud" ]]; then
    certbot_args+=(--cert-name "maroelablog.jnb1.cloudlet.cloud" --expand)
  fi
  if certbot "${certbot_args[@]}" 2>/dev/null; then
    log "TLS OK (${domains})"
  else
    log "WARN: certbot failed — ensure DNS for live.maroelamedia.co.za points here, then re-run"
  fi
  write_nginx_config_file
  enable_nginx_site_only
  nginx_reload
  nginx_verify_embed
}

nginx_finalize() {
  if [[ "${USE_NGINX}" != "true" ]]; then
    return 0
  fi
  write_nginx_config_file
  enable_nginx_site_only
  nginx_reload
  nginx_verify_embed
}

clone_or_pull() {
  if [[ "${FRESH_INSTALL}" == "true" && -d "${INSTALL_DIR}/.git" ]]; then
    log "FRESH_INSTALL (keep data/)"
    if [[ -d "${INSTALL_DIR}/data" ]]; then
      mv "${INSTALL_DIR}/data" "/tmp/liveblog-data-$$"
    fi
    rm -rf "${INSTALL_DIR}"
    mkdir -p "${INSTALL_DIR}"
    if [[ -d "/tmp/liveblog-data-$$" ]]; then
      mv "/tmp/liveblog-data-$$" "${INSTALL_DIR}/data"
    fi
  fi
  if [[ -d "${INSTALL_DIR}/.git" ]]; then
    log "git pull ${INSTALL_DIR}"
    git -C "${INSTALL_DIR}" fetch origin
    git -C "${INSTALL_DIR}" checkout "${BRANCH}"
    git -C "${INSTALL_DIR}" pull --ff-only origin "${BRANCH}"
  else
    log "git clone ${INSTALL_DIR}"
    mkdir -p "$(dirname "${INSTALL_DIR}")"
    git clone --branch "${BRANCH}" --depth 1 "${REPO_URL}" "${INSTALL_DIR}"
  fi
}

write_env() {
  local f="${INSTALL_DIR}/.env"
  log "write ${f}"
  cat >"${f}" <<EOF
SUPERDESK_URL=${SUPERDESK_URL}
SUPERDESK_WS_URL=${SUPERDESK_WS_URL}
SUPERDESK_CLIENT_URL=${SUPERDESK_CLIENT_URL}
LIVEBLOG_DEBUG=${LIVEBLOG_DEBUG}
EMBED_PROTOCOL=${EMBED_PROTOCOL}
SUPERDESK_TESTING=${SUPERDESK_TESTING}
SUPERDESK_RELOAD=${SUPERDESK_RELOAD}
LIVEBLOG_MULTI_HOST=true
WEB_CONCURRENCY=${WEB_CONCURRENCY}
WEB_TIMEOUT=${WEB_TIMEOUT}
ELASTIC_AUTO_REINDEX_ON_500=${ELASTIC_AUTO_REINDEX_ON_500}
CELERY_WORKER_CONCURRENCY=${CELERY_WORKER_CONCURRENCY}
IFRAMELY_KEY=${IFRAMELY_KEY}
EOF
  if [[ -n "${AMAZON_ACCESS_KEY_ID}" ]]; then
    cat >>"${f}" <<EOF
AMAZON_ACCESS_KEY_ID=${AMAZON_ACCESS_KEY_ID}
AMAZON_SECRET_ACCESS_KEY=${AMAZON_SECRET_ACCESS_KEY}
AMAZON_REGION=${AMAZON_REGION}
AMAZON_CONTAINER_NAME=${AMAZON_CONTAINER_NAME}
EOF
  fi
  if [[ -n "${SENTRY_DSN}" ]]; then
    echo "SENTRY_DSN=${SENTRY_DSN}" >>"${f}"
  fi
  local mail_from="${MAIL_FROM}"
  if [[ -z "${mail_from}" ]]; then
    mail_from="noreply@${PUBLIC_HOST}"
  fi
  cat >>"${f}" <<EOF
MAIL_SERVER=${MAIL_SERVER}
MAIL_PORT=${MAIL_PORT}
MAIL_USE_TLS=${MAIL_USE_TLS}
MAIL_USE_SSL=${MAIL_USE_SSL}
MAIL_USERNAME="${MAIL_USERNAME}"
MAIL_PASSWORD="${MAIL_PASSWORD}"
MAIL_FROM=${mail_from}
MAIL_SUPPRESS_SEND=${MAIL_SUPPRESS_SEND}
EOF
  chmod 600 "${f}"
  if grep -qE '^SUPERDESK_.*maroelablog' "${f}" 2>/dev/null; then
    log "WARN: .env SUPERDESK_* still uses maroelablog — check PUBLIC_HOST in this script"
  fi
  log "Verify: grep SUPERDESK ${f}"
  grep "^SUPERDESK" "${f}" || true
}

fix_selinux_nginx() {
  if command -v getenforce >/dev/null 2>&1; then
    if [[ "$(getenforce 2>/dev/null)" == "Enforcing" ]]; then
      log "SELinux: httpd_can_network_connect"
      setsebool -P httpd_can_network_connect 1 2>/dev/null || true
    fi
  fi
}

wait_for_server_healthy() {
  local i=0 status
  log "Waiting for liveblog-server to become healthy (ES reindex can take a few minutes)..."
  while [[ $i -lt 90 ]]; do
    status="$(docker inspect -f '{{.State.Health.Status}}' liveblog-server 2>/dev/null || echo missing)"
    if [[ "${status}" == "healthy" ]]; then
      log "liveblog-server healthy"
      return 0
    fi
    if ! docker compose ps server 2>/dev/null | grep -qE 'Up|running'; then
      log "ERROR: liveblog-server not running — last logs:"
      docker compose logs server --tail 150
      die "liveblog-server exited during startup — see logs above"
    fi
    sleep 5
    i=$((i + 1))
  done
  docker compose logs server --tail 150
  die "liveblog-server not healthy after 7.5 minutes"
}

compose_up() {
  log "docker compose in ${INSTALL_DIR}"
  cd "${INSTALL_DIR}"
  docker compose up -d --build
  wait_for_server_healthy
  docker compose up -d client
  fix_selinux_nginx
  log "Containers up (client nginx + static build; first --build may take a few minutes)"
}

register_bundled_themes() {
  log "Sync bundled themes (maroela, nuwe-maroela, …) from repo into MongoDB..."
  cd "${INSTALL_DIR}"
  if ! docker compose exec -T server bash -c "cd /opt/server && python3 manage.py register_local_themes"; then
    log "WARN: register_local_themes failed — run manually after server is healthy"
  fi
}

ensure_latest_deploy_script() {
  local repo_script="${INSTALL_DIR}/deploy-liveblog.sh"
  [[ -d "${INSTALL_DIR}/.git" ]] || return 0
  git -C "${INSTALL_DIR}" fetch origin 2>/dev/null || true
  git -C "${INSTALL_DIR}" checkout "${BRANCH}" 2>/dev/null || true
  git -C "${INSTALL_DIR}" pull --ff-only origin "${BRANCH}" 2>/dev/null || true
  [[ -f "${repo_script}" ]] || return 0
  local self="${BASH_SOURCE[0]}"
  if [[ "${self}" != /* ]]; then
    self="$(cd "$(dirname "${self}")" && pwd)/$(basename "${self}")"
  fi
  if ! cmp -s "${repo_script}" "${self}" 2>/dev/null; then
    log "Outdated copy $(basename "${self}") — re-running ${repo_script}"
    exec bash "${repo_script}" "$@"
  fi
}

print_done() {
  echo ""
  echo "================================================================================"
  echo "Liveblog deploy done (canonical: ${PUBLIC_HOST})"
  echo "Open:   ${SUPERDESK_CLIENT_URL}"
  echo "Login: admin / admin"
  echo "Logs:  cd ${INSTALL_DIR} && docker compose logs -f"
  echo ".env:  ${INSTALL_DIR}/.env"
  if [[ "${USE_NGINX}" == "true" ]]; then
    echo "Also:  https://live.maroelamedia.co.za"
    echo "       https://maroelablog.jnb1.cloudlet.cloud"
    echo "Use https://${PUBLIC_HOST} — NOT :9000 with https"
  fi
  if [[ "${USE_NGINX}" == "true" ]]; then
    echo "Embed: https://${PUBLIC_HOST}/embed/<blog_id>/theme/nuwe-maroela"
    echo "       https://live.maroelamedia.co.za/embed/<blog_id>/theme/nuwe-maroela"
  fi
  echo "================================================================================"
}

apply_worker_scaling() {
  local cpus
  cpus=$(nproc 2>/dev/null || echo 2)
  if [[ -z "${WEB_CONCURRENCY}" ]]; then
    WEB_CONCURRENCY=$(( cpus * 2 + 1 ))
    [[ "${WEB_CONCURRENCY}" -lt 2 ]] && WEB_CONCURRENCY=2
    log "WEB_CONCURRENCY auto: ${WEB_CONCURRENCY} (${cpus} CPUs)"
  fi
  if [[ -z "${CELERY_WORKER_CONCURRENCY}" ]]; then
    CELERY_WORKER_CONCURRENCY=$(( cpus * 2 ))
    [[ "${CELERY_WORKER_CONCURRENCY}" -lt 2 ]] && CELERY_WORKER_CONCURRENCY=2
    log "CELERY_WORKER_CONCURRENCY auto: ${CELERY_WORKER_CONCURRENCY}"
  fi
}

main() {
  ensure_latest_deploy_script
  resolve_public_host
  install_docker
  build_urls
  clone_or_pull
  apply_worker_scaling
  write_env
  compose_up
  register_bundled_themes
  install_nginx
  install_tls
  nginx_finalize
  print_done
}

main "$@"
