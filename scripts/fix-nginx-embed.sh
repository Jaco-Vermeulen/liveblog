#!/usr/bin/env bash
# Fix nginx only — /embed → API :5000. Run on server as root:
#   cd /opt/liveblog && sudo bash scripts/fix-nginx-embed.sh
set -euo pipefail
PUBLIC_HOST="${PUBLIC_HOST:-live.nuwe-maroela.co.za}"
EXTRA_SERVER_NAMES="${EXTRA_SERVER_NAMES:-maroelablog.jnb1.cloudlet.cloud}"
API_PORT="${API_PORT:-5000}"
WS_PORT="${WS_PORT:-5100}"
UI_PORT="${UI_PORT:-9000}"
[[ "${EUID}" -eq 0 ]] || { echo "sudo bash $0"; exit 1; }

names="${PUBLIC_HOST}"
[[ -n "${EXTRA_SERVER_NAMES}" ]] && names="${names} ${EXTRA_SERVER_NAMES}"

if command -v apt-get >/dev/null 2>&1; then
  SITE=/etc/nginx/sites-available/liveblog
  mkdir -p /etc/nginx/sites-enabled
  rm -f /etc/nginx/sites-enabled/default
  for f in /etc/nginx/sites-enabled/*; do
    [[ -e "${f}" ]] || continue
    [[ "$(readlink -f "${f}" 2>/dev/null || echo "${f}")" == "${SITE}" ]] && continue
    rm -f "${f}"
    echo "removed ${f}"
  done
  ln -sf "${SITE}" /etc/nginx/sites-enabled/liveblog
elif command -v apk >/dev/null 2>&1; then
  SITE=/etc/nginx/http.d/liveblog.conf
  rm -f /etc/nginx/http.d/default.conf
  for f in /etc/nginx/http.d/*.conf; do
    [[ -f "${f}" && "${f}" != "${SITE}" ]] || continue
    rm -f "${f}"
    echo "removed ${f}"
  done
else
  SITE=/etc/nginx/conf.d/liveblog.conf
  rm -f /etc/nginx/conf.d/default.conf 2>/dev/null || true
  for f in /etc/nginx/conf.d/*.conf; do
    [[ -f "${f}" && "${f}" != "${SITE}" ]] || continue
    rm -f "${f}"
    echo "removed ${f}"
  done
fi

tls_host=""
for h in ${PUBLIC_HOST} ${EXTRA_SERVER_NAMES}; do
  [[ -d "/etc/letsencrypt/live/${h}" ]] && tls_host="${h}" && break
done

ssl_block=""
if [[ -n "${tls_host}" ]]; then
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
    location /api { proxy_pass http://liveblog_api; proxy_set_header Host \$host; proxy_set_header X-Forwarded-Proto \$scheme; }
    location /embed { proxy_pass http://liveblog_api; proxy_set_header Host \$host; proxy_set_header X-Forwarded-Proto \$scheme; }
    location /themes_assets/ { alias ${INSTALL_DIR:-/opt/liveblog}/server/liveblog/themes/themes_assets/; }
    location /themes_uploads { proxy_pass http://liveblog_api; proxy_set_header Host \$host; }
    location /ws { proxy_pass http://liveblog_ws; proxy_http_version 1.1; proxy_set_header Upgrade \$http_upgrade; proxy_set_header Connection \"Upgrade\"; proxy_set_header Host \$host; }
    location / { proxy_pass http://liveblog_ui; proxy_set_header Host \$host; proxy_set_header X-Forwarded-Proto \$scheme; }
}
"
fi

mkdir -p "$(dirname "${SITE}")"
cat >"${SITE}" <<EOF
upstream liveblog_api { server 127.0.0.1:${API_PORT}; }
upstream liveblog_ws { server 127.0.0.1:${WS_PORT}; }
upstream liveblog_ui { server 127.0.0.1:${UI_PORT}; }
server {
    listen 80;
    listen [::]:80;
    server_name ${names};
    client_max_body_size 50m;
    location /api { proxy_pass http://liveblog_api; proxy_set_header Host \$host; proxy_set_header X-Forwarded-Proto \$scheme; }
    location /embed { proxy_pass http://liveblog_api; proxy_set_header Host \$host; proxy_set_header X-Forwarded-Proto \$scheme; }
    location /themes_assets/ { alias ${INSTALL_DIR:-/opt/liveblog}/server/liveblog/themes/themes_assets/; }
    location /themes_uploads { proxy_pass http://liveblog_api; proxy_set_header Host \$host; }
    location /ws { proxy_pass http://liveblog_ws; proxy_http_version 1.1; proxy_set_header Upgrade \$http_upgrade; proxy_set_header Connection "Upgrade"; proxy_set_header Host \$host; }
    location / { proxy_pass http://liveblog_ui; proxy_set_header Host \$host; proxy_set_header X-Forwarded-Proto \$scheme; }
}
${ssl_block}
EOF

nginx -t
systemctl reload nginx 2>/dev/null || rc-service nginx reload
echo "Wrote ${SITE} for: ${names}"
nginx -T 2>/dev/null | grep -E 'server_name|location /embed' || true
nginx -T 2>/dev/null | grep -q "location /embed" && echo "YES: /embed active" || echo "NO: still missing /embed"
