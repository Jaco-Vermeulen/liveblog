#!/usr/bin/env bash
# =============================================================================
# LIVEBLOG deploy — run from ANY directory:
#   sudo /path/to/deploy-liveblog.sh
#   sudo bash /path/to/deploy-liveblog.sh
# =============================================================================
set -euo pipefail

# ─── CONFIG ───────────────────────────────────────────────────────────────────

REPO_URL="https://github.com/Jaco-Vermeulen/liveblog.git"
BRANCH="master"
INSTALL_DIR="/opt/liveblog"

# Domain only — no http:// no trailing slash
PUBLIC_HOST="live.nuwe-maroela.co.za"

USE_NGINX="true"
USE_HTTPS="true"
INSTALL_NGINX="true"
CERTBOT_EMAIL=""

API_PORT="5000"
WS_PORT="5100"
UI_PORT="9000"

LIVEBLOG_DEBUG="true"
EMBED_PROTOCOL=""
SUPERDESK_TESTING="true"
WEB_CONCURRENCY="1"
IFRAMELY_KEY="a5ee9a89addd13b7a2e3a48c23e74e8d"

AMAZON_ACCESS_KEY_ID=""
AMAZON_SECRET_ACCESS_KEY=""
AMAZON_REGION=""
AMAZON_CONTAINER_NAME=""
SENTRY_DSN=""

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
  log "PUBLIC_HOST=${PUBLIC_HOST}"
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

install_nginx() {
  if [[ "${USE_NGINX}" != "true" || "${INSTALL_NGINX}" != "true" ]]; then
    return 0
  fi
  detect_pkg_mgr
  log "nginx for ${PUBLIC_HOST}..."
  pkg_install nginx
  local site
  site="$(nginx_conf_path)"
  mkdir -p "$(dirname "${site}")"
  cat >"${site}" <<NGX
upstream liveblog_api { server 127.0.0.1:${API_PORT}; }
upstream liveblog_ws  { server 127.0.0.1:${WS_PORT}; }
upstream liveblog_ui  { server 127.0.0.1:${UI_PORT}; }

server {
    listen 80;
    listen [::]:80;
    server_name ${PUBLIC_HOST};
    client_max_body_size 50m;

    location /api {
        proxy_pass http://liveblog_api;
        proxy_redirect off;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
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
}
NGX
  if [[ "${PKG_MGR}" == "apt" ]]; then
    mkdir -p /etc/nginx/sites-enabled
    ln -sf "${site}" /etc/nginx/sites-enabled/liveblog
    rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
  fi
  nginx -t
  svc_enable nginx
  svc_reload nginx
  log "nginx OK"
}

install_tls() {
  if [[ "${USE_NGINX}" != "true" || "${USE_HTTPS}" != "true" || -z "${CERTBOT_EMAIL}" ]]; then
    return 0
  fi
  log "certbot ${PUBLIC_HOST}..."
  case "${PKG_MGR}" in
    apt) pkg_install certbot python3-certbot-nginx ;;
    apk) pkg_install certbot ;;
    dnf|yum) pkg_install certbot python3-certbot-nginx ;;
  esac
  if certbot --nginx -d "${PUBLIC_HOST}" --non-interactive --agree-tos -m "${CERTBOT_EMAIL}" --redirect 2>/dev/null; then
    log "TLS OK"
  else
    log "WARN: certbot failed — run: certbot --nginx -d ${PUBLIC_HOST}"
  fi
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
WEB_CONCURRENCY=${WEB_CONCURRENCY}
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
  chmod 600 "${f}"
}

port_is_up() {
  local port="$1"
  if curl -sf --max-time 3 "http://127.0.0.1:${port}/" -o /dev/null 2>/dev/null; then
    return 0
  fi
  if curl -sf --max-time 3 "http://127.0.0.1:${port}" -o /dev/null 2>/dev/null; then
    return 0
  fi
  return 1
}

wait_for_port() {
  local port="$1"
  local label="$2"
  local max="${3:-360}"
  local i=0
  log "wait ${label} :${port} (max ${max}s)..."
  while [[ "${i}" -lt "${max}" ]]; do
    if port_is_up "${port}"; then
      log "${label} up on :${port}"
      return 0
    fi
    sleep 5
    i=$((i + 5))
  done
  log "WARN: ${label} not up on :${port}"
  return 1
}

fix_selinux_nginx() {
  if command -v getenforce >/dev/null 2>&1; then
    if [[ "$(getenforce 2>/dev/null)" == "Enforcing" ]]; then
      log "SELinux: httpd_can_network_connect"
      setsebool -P httpd_can_network_connect 1 2>/dev/null || true
    fi
  fi
}

compose_up() {
  log "docker compose in ${INSTALL_DIR}"
  cd "${INSTALL_DIR}"
  docker compose up -d --build
  docker compose up -d --force-recreate client server
  fix_selinux_nginx
  wait_for_port "${API_PORT}" "API" 240 || true
  wait_for_port "${UI_PORT}" "UI" 480 || true
}

print_done() {
  echo ""
  echo "================================================================================"
  echo "Done. Open: ${SUPERDESK_CLIENT_URL}"
  echo "Login: admin / admin"
  echo "Logs:  cd ${INSTALL_DIR} && docker compose logs -f"
  echo ".env:  ${INSTALL_DIR}/.env"
  if [[ "${USE_NGINX}" == "true" ]]; then
    echo "Use https://${PUBLIC_HOST} — NOT :9000 with https"
  fi
  if [[ "${USE_HTTPS}" == "true" && -z "${CERTBOT_EMAIL}" ]]; then
    echo "TLS:   certbot --nginx -d ${PUBLIC_HOST}"
  fi
  echo "================================================================================"
}

main() {
  resolve_public_host
  install_docker
  build_urls
  clone_or_pull
  write_env
  compose_up
  install_nginx
  install_tls
  print_done
}

main "$@"
