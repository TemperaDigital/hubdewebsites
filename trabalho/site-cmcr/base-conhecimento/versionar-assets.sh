#!/bin/sh
# Gera cache-busting: acrescenta ?v=<hash do conteudo> em cada asset local
# referenciado no index.html. Roda como passo de build no Railpack.
# Idempotente: pode rodar em cima de um index.html que ja tem "?v=" de um
# deploy anterior (troca pelo hash novo em vez de acumular).
set -e
cd "$(dirname "$0")"
INDEX="index.html"

for arq in assets/app.js assets/estilo.css dados/temas.js dados/regimento.js dados/convencao.js dados/manual.js dados/legislacao.js; do
  esc=$(printf '%s' "$arq" | sed 's/\./\\./g')
  hash=$(sha256sum "$arq" | cut -c1-8)
  sed -i -E "s#=\"${esc}(\\?v=[0-9a-f]+)?\"#=\"${arq}?v=${hash}\"#" "$INDEX"
done

echo "index.html versionado:"
grep -oE '(href|src)="[^"]*\?v=[0-9a-f]+"' "$INDEX"
