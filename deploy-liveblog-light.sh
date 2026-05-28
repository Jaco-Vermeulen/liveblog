#!/usr/bin/env bash
# =============================================================================
# LIVEBLOG light deploy — same as deploy-liveblog.sh but does NOT touch nginx.
# Use when nginx/TLS is already configured on the server.
# Run from ANY directory:
#   sudo /path/to/deploy-liveblog-light.sh
#   sudo bash /path/to/deploy-liveblog-light.sh
# =============================================================================
set -euo pipefail

# ─── CONFIG ───────────────────────────────────────────────────────────────────

REPO_URL="https://github.com/Jaco-Vermeulen/liveblog.git"
BRANCH="master"
INSTALL_DIR="/opt/liveblog"

# Domain only — no http:// no trailing slash
PUBLIC_HOST="live.nuwe-maroela.co.za"
# Extra hostnames on same box (space-separated), e.g. cloudlet default hostname
EXTRA_SERVER_NAMES="maroelablog.jnb1.cloudlet.cloud"

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

# Mandrill (Mailchimp Transactional) — password is the API key; username is not validated by Mandrill
MAIL_SERVER="smtp.mandrillapp.com"
MAIL_PORT="587"
MAIL_USE_TLS="true"
MAIL_USE_SSL="false"
MAIL_USERNAME="Maroela Media"
MAIL_PASSWORD="md-Gx3eRIxK5Gu77P-HHycn3w"
MAIL_FROM="noreply@nuwe-maroela.co.za"
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
  if grep -q "maroelablog.jnb1.cloudlet.cloud" "${f}" 2>/dev/null; then
    log "WARN: .env still contains old host maroelablog — check PUBLIC_HOST"
  fi
  log "Verify: grep SUPERDESK ${f}"
  grep "^SUPERDESK" "${f}" || true
  log "Verify: grep MAIL_SERVER ${f}"
  grep "^MAIL_SERVER=" "${f}" || true
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
  log "Containers started in background (client_web2 Vite may take a minute on first npm install)"
}

register_bundled_themes() {
  log "Sync bundled themes (maroela, nuwe-maroela, …) from repo into MongoDB..."
  cd "${INSTALL_DIR}"
  if ! docker compose exec -T server bash -c "cd /opt/server && python3 manage.py register_local_themes"; then
    log "WARN: register_local_themes failed — run manually after server is healthy"
  fi
}

print_done() {
  echo ""
  echo "================================================================================"
  echo "Done (light deploy — nginx not modified). Open: ${SUPERDESK_CLIENT_URL}"
  echo "Login: admin / admin"
  echo "Logs:  cd ${INSTALL_DIR} && docker compose logs -f"
  echo ".env:  ${INSTALL_DIR}/.env"
  if [[ "${USE_NGINX}" == "true" ]]; then
    echo "Use https://${PUBLIC_HOST} — NOT :9000 with https"
  fi
  if [[ "${USE_NGINX}" == "true" ]]; then
    echo "Embed: https://${PUBLIC_HOST}/embed/<blog_id>/theme/nuwe-maroela"
    echo "       https://${PUBLIC_HOST}/embed/<blog_id>/theme/maroela"
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
  register_bundled_themes
  print_done
}

main "$@"
