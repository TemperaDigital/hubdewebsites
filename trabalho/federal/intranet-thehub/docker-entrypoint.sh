#!/bin/sh
set -e

# Gera /config.js em RUNTIME a partir das variáveis de ambiente do container.
# Assim a mesma imagem serve qualquer ambiente, sem "assar" a URL no build.
# NUNCA injetar service_role — apenas URL e ANON KEY (pública).
cat > /usr/share/nginx/html/config.js <<EOF
window.__RUNTIME_CONFIG__ = {
  VITE_SUPABASE_URL: "${VITE_SUPABASE_URL}",
  VITE_SUPABASE_ANON_KEY: "${VITE_SUPABASE_ANON_KEY}"
};
EOF

exec nginx -g 'daemon off;'
