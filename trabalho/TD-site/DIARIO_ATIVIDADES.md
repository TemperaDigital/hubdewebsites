# Diário de atividades

Registro cronológico do que mudou, **por quê** e como foi verificado.
Entradas mais recentes no topo.

---

## 2026-09-13 — Criação: separado de dentro de temperadigital/

Esta pasta foi criada pelo usuário durante uma sessão de deploy do
`temperadigital.fguerra.ia.br`. O motivo: a pasta `../temperadigital/`
tinha **dois projetos sobrepostos** — este site estático institucional
(o real, com conteúdo da Têmpera Digital) e um app React/Vite separado
(que na verdade é `estudos.fguerra.ia.br`, não este domínio). Detalhe
completo da descoberta em `../temperadigital/DIARIO_ATIVIDADES.md` e em
[[project_temperadigital_estudos_split]] na memória do agente.

**Arquivos movidos de `../temperadigital/` pra cá:** `index.html`,
`script.js`, `styles.css`, `assets/logo.png`. São o site institucional
completo — Sobre/Serviços/Notícias (RSS do Google News via proxy público
`api.allorigins.win`)/Contato. Sem build, sem backend.

**Deploy:** `Dockerfile` copia só esses 4 itens explicitamente pra dentro
da imagem nginx (**não** monta a pasta inteira como volume) — decisão
deliberada, pra não repetir o incidente de arquivo sensível exposto
publicamente que já aconteceu nessa árvore de sites antes (ver
[[project_hubdewebsites_github_push]] na memória do agente: uma chave SSH
ficou pública por semanas porque a pasta inteira virou webroot). Testado:
`/docker-compose.yml` e `/nginx.conf` retornam 404 no site publicado,
confirmando que só os 4 arquivos do site são servidos.

Container `temperadigital`, porta **8306**. Build e deploy testados
(`docker compose up -d --build`, `curl` confirmando 200 em `/`).

## Pendente

- Rota do Cloudflare Tunnel pra `temperadigital.fguerra.ia.br` →
  `http://localhost:8306` — dashboard Zero Trust, fora do meu alcance
  daqui. O domínio já resolve pro Cloudflare, mas não confirmei se a rota
  já existe ou aponta pra outro lugar (por exemplo, ainda pra dentro de
  `../temperadigital/`, que agora serve outra coisa).
