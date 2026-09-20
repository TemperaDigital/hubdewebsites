# CLAUDE.md — Intranet TheHub (Federal)

Portal/intranet interno ("The Hub") — React + Vite + TypeScript + Tailwind CSS.
App estático puro (build vira `dist/`, servido via `nginx.conf`/`Dockerfile`
neste próprio diretório).

> Histórico detalhado de sessões anteriores: **`DIARIO_ATIVIDADES.md`** nesta
> mesma pasta. Leia antes de mexer em dependências ou config de build.

## Onde as coisas estão

| Coisa | Onde |
|---|---|
| Caminho real | `/DATA/.media/auxiliar/sites/trabalho/federal/intranet-thehub` — atenção: é `.media` (não `media`) e `intranet-thehub` com hífen. Fácil de digitar errado. |
| Código | `src/` (`App.tsx`, `main.tsx`, `components/`, `pages/`, `data/`, `lib/`) |
| Build | `npm run build` → `tsc -b && vite build` → `dist/` |
| Dev server | `npm run dev` (Vite, porta 5173) |
| Deploy | `Dockerfile` + `docker-entrypoint.sh` + `nginx.conf` no próprio diretório |

## ⚠ Este host (ZimaOS) não tem Node/npm no PATH

Todo comando `npm`/`node` precisa rodar via Docker:

```bash
docker run --rm -i \
  -v /DATA:/DATA \
  -w "$(pwd)" \
  -u "$(id -u):$(id -g)" \
  -e HOME=/tmp \
  node:22-alpine npm <comando>
```

- `-e HOME=/tmp` é obrigatório (senão o npm tenta escrever cache em `/.npm` e
  falha com `EACCES`).
- Se algum `node_modules` estiver corrompido (`ENOTEMPTY` no meio do install),
  não insista — `rm -rf node_modules` e reinstale do zero.
- Para testar dev server de verdade, publique a porta (`-p 5173:5173`) e faça
  um `curl` real — sem publicar a porta, `curl localhost` sempre falha (status
  000) mesmo com o servidor saudável.

## Estado das dependências (última atualização: 2026-09-06)

- `vite`: `^8.2.2` (upgrade de `5.4.8`, via `npm audit fix --force` — motor de
  build agora é Rolldown/Oxc, não esbuild/Rollup).
- `react-router-dom`: `^7.18.3` (upgrade de `6.26.2`). Projeto só usa
  `BrowserRouter`/`Routes`/`Route` — nenhuma feature de v7 (loaders, data
  router) em uso.
- `@vitejs/plugin-react`: `^6.1.1` (upgrade de `4.3.2` — a v4 não declarava
  suporte oficial ao Vite 8, causava warning de peer dependency e erro de
  opção `jsx` inválida no dev server). **Não usar `@vitejs/plugin-react-oxc`
  — está deprecated**, a v6.x do plugin normal já assume o transform Oxc
  sozinha sobre Rolldown-vite.
- `npm audit`: 0 vulnerabilidades no momento.

## Pastas que NÃO pertencem a este projeto (histórico)

Até 2026-09-06 havia três pastas soltas aqui dentro
(`code-review-graph-main`, `onp-spec-driven-main`, `unlazy-main`) — cópias de
código-fonte de outras ferramentas, sem nenhuma referência real no app
(confirmado via grep). Foram movidas para `/DATA/AppData/programacao/`. As
capacidades que elas dão (skills do Claude Code, MCP `code-review-graph`)
continuam disponíveis normalmente — são instaladas globalmente
(`/DATA/.claude/skills/` e `uvx code-review-graph` via `/DATA/.mcp.json`),
não dependem de estarem fisicamente dentro deste diretório. Se aparecerem de
novo aqui, provavelmente foram extraídas por engano — considerar mover, não
apagar.

## Pendências em aberto (não bloqueantes)

- Warning benigno de `__dirname` no `vite.config.ts` (trocar por
  `import.meta.dirname` quando for mexer no arquivo por outro motivo).
- `@vscode/vsce` v2→v3 no `code-review-graph-vscode` (agora em
  `/DATA/AppData/programacao/code-review-graph-main/`) só é relevante se
  aquela extensão for publicada de fato — não é deste projeto.
