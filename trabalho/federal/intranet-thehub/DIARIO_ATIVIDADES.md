# Diário de Atividades — Intranet TheHub (Federal)

> Registro cronológico das atividades executadas neste projeto.
> Atualizado ao final de cada sessão relevante.

**Servidor:** ZimaOS @ 192.168.1.153 (usuário de trabalho: `gestor`, grupos: samba, wheel, docker)
**Caminho real do projeto:** `/DATA/.media/auxiliar/sites/trabalho/federal/intranet-thehub`
(atenção: é `.media`, não `media`, e `intranet-thehub` com hífen — nomes fáceis de digitar errado)
**Stack:** React + Vite + TypeScript + Tailwind CSS
**Ambiente:** este host **não tem Node/npm no PATH**. Todo comando `npm`/`node` roda via
`docker run node:22-alpine` (ou `node:22` puro para pacotes com módulos nativos), montando
`/DATA:/DATA` e com `-e HOME=/tmp` (senão o npm tenta escrever cache em `/.npm` e falha com EACCES).

---

## 2026-09-06 (domingo)

### Contexto do dia
Localização do projeto (usuário tinha o caminho digitado errado), instalação de
dependências dos quatro subprojetos npm existentes dentro da pasta, e resolução
de vulnerabilidades reportadas pelo `npm audit`.

### Localização do projeto (CONCLUÍDA)
- Caminho informado pelo usuário (`/DATA/;media/auxiliar/sites/trabalho/federal/intranetthehub`)
  não existia. Caminho real encontrado: `/DATA/.media/auxiliar/sites/trabalho/federal/intranet-thehub`.

### `intranet-thehub` (app principal — CONCLUÍDO)
- `node_modules` existente estava corrompido (resquício de instalação anterior parcial,
  provavelmente rodada como root) — removido e reinstalado do zero.
- `npm install` inicial: 154 pacotes, 4 vulnerabilidades (3 moderadas, 1 alta) — `esbuild`/`vite`
  e `react-router`/`react-router-dom`.
- `npm audit fix --force` aplicado (decisão do usuário, após eu resumir os breaking changes de
  cada upgrade e cruzar com o uso real no código via grep):
  - `vite`: `5.4.8` → `^8.2.2` (motor de build trocado para Rolldown/Oxc)
  - `react-router-dom`: `^6.26.2` → `^7.18.3` (projeto só usa `BrowserRouter`/`Routes`/`Route`,
    sem loaders/data router — API básica compatível)
  - Resultado: **0 vulnerabilidades**.
- Após o fix, `@vitejs/plugin-react@4.7.0` ficou com peer dependency não oficial pro Vite 8
  (`ERESOLVE overriding peer dependency`) e o dev server acusava warning
  `Invalid key: Expected never but received "jsx"`.
  - Corrigido atualizando `@vitejs/plugin-react`: `^4.3.2` → `^6.1.1` (versão que já declara
    `peerDependencies: { vite: "^8.0.0" }` oficialmente — **não** migrei para
    `@vitejs/plugin-react-oxc`, que está **deprecated**).
  - `npm install` removeu 35 pacotes (dependências do Babel não mais necessárias).
  - `npm run build` e `npm run dev` testados e validados (HTTP 200, sem warnings de
    incompatibilidade).

### `onp-spec-driven-main/onp-spec-driven-main` (CONCLUÍDO)
- Pacote `@onovoprogramador/onp-spec` — zero dependências declaradas.
- `npm install` só validou o `node_modules` vazio. 0 vulnerabilidades.

### `unlazy-main` (CONCLUÍDO)
- Pacote `unlazy-skill` (testes de regressão) — zero dependências declaradas.
- `npm install` idem, 0 vulnerabilidades.

### `code-review-graph-main/code-review-graph-vscode` (CONCLUÍDO, com pendência aceita)
- Extensão VS Code com módulo nativo `better-sqlite3` — instalado com a imagem `node:22`
  (Debian, não Alpine) para evitar problema de compatibilidade musl/glibc na compilação/binário
  pré-compilado. Testado com `require('better-sqlite3')(':memory:')` — OK.
- `npm install` inicial: 288 pacotes, 12 vulnerabilidades (6 moderadas, 6 altas).
- `npm audit fix` (sem `--force`): resolveu 8 das 12 automaticamente.
- Restam 4 vulnerabilidades que exigiriam `--force`:
  - `esbuild` ≤0.24.2 → 0.28.2: risco real nulo aqui — o `esbuild.mjs` do projeto só faz
    bundling (`compile`/`watch`), não sobe servidor.
  - `linkify-it`/`markdown-it` via `@vscode/vsce` ≤3.0.0 → forçaria `@vscode/vsce` v2→v3
    (major grande): ReDoS só explorável se alguém injetar markdown malicioso no próprio
    README ao empacotar a extensão — risco baixo, projeto de uso local/não publicado.
  - **Decisão:** não forçar por ora. Revisitar se a extensão for publicada de fato na
    Marketplace.

### Este arquivo (CONCLUÍDO)
- Este diário e a memória de longo prazo do agente foram criados/atualizados nesta sessão.

### Mudança de local dos subprojetos avulsos (CONCLUÍDA)
- Confirmado por `grep` que `code-review-graph-main`, `onp-spec-driven-main` e
  `unlazy-main` não são referenciados em nenhum lugar do app (`src/`,
  `package.json`, `vite.config.ts`, `tsconfig*`, `README.md`, `.gitignore`) —
  eram só pastas avulsas soltas dentro do `intranet-thehub`, sem relação com o
  site.
- Movidas para `/DATA/AppData/programacao/` (via `claude@192.168.1.153` +
  `sudo`, porque `gestor` não tem escrita nesse diretório — dono `root:root`).
  `/DATA/.media/...` e `/DATA/AppData/...` são pontos de montagem diferentes,
  então o `mv` fez cópia arquivo-a-arquivo (não um rename instantâneo).
- Permissões preservadas (`777`, dono `root:root`, igual às demais pastas já
  existentes em `programacao/`).
- `intranet-thehub` agora contém só o app React/Vite propriamente dito.

### `CLAUDE.md` do projeto (CONCLUÍDO)
- Criado `CLAUDE.md` na raiz do `intranet-thehub` (não existia até então),
  documentando: caminho real, quirk de rodar `npm`/`node` via Docker, estado
  das dependências e o porquê de cada upgrade, e um aviso explícito de que as
  três pastas movidas não pertencem a este projeto (para não serem
  recriadas/confundidas numa sessão futura).

### Verificação pedida pelo usuário: install + build + dev server (CONCLUÍDA)
- `npm install`: nada a fazer, já estava tudo atualizado (124 pacotes, 0
  vulnerabilidades) — reflexo das mudanças já feitas nesta mesma sessão.
- `npm run build`: **compilou sem erros** (só o warning benigno de
  `__dirname` de sempre).
- Dev server subido em **background persistente** (não efêmero como os
  testes anteriores) via container Docker nomeado `intranet-thehub-dev`,
  publicando a porta `5173` pro host (`docker run -d --name
  intranet-thehub-dev ... -p 5173:5173 node:22-alpine npm run dev -- --host
  0.0.0.0 --port 5173`) — usado no lugar do `nohup npm run dev &` pedido
  literalmente, porque não há `npm`/`node` no host (ver nota do cabeçalho).
  Log redirecionado pra `/tmp/intranet-dev.log`.
- Confirmado com `curl` real: **HTTP 200**. Usuário confirmou visualmente
  que a página abriu em `http://192.168.1.153:5173`.
- **Servidor ficou rodando** ao fim da sessão (não foi parado) — ver
  pendências abaixo.

### Pendências / possíveis próximos passos
- **Container `intranet-thehub-dev` (porta 5173) ficou rodando em background**
  desde a verificação acima — parar com `docker stop intranet-thehub-dev`
  quando não precisar mais dele (não consome muito, mas fica exposto na rede
  local enquanto ativo).
- Migrar `@vscode/vsce` v2 → v3 no `code-review-graph-vscode` (agora em
  `/DATA/AppData/programacao/code-review-graph-main/code-review-graph-vscode/`),
  só se for publicar a extensão.
- Resolver o warning benigno de `__dirname` no `vite.config.ts` do `intranet-thehub`
  (trocar por `import.meta.dirname`), não urgente.

## 2026-09-09 (quarta-feira)

### Skill diagram-design instalada (CONCLUÍDA)

Usuário pediu para instalar skills encontradas em
`arquivos_comunitarios/SKILLS/diagram-design-main` (repo GitHub
`cathrynlavery/diagram-design`, MIT) neste projeto. O pacote só tem uma
skill (`diagram-design` — gera diagramas HTML/SVG auto-contidos:
arquitetura, flowchart, ER, gantt, etc., ~40 tipos) mais 6 slash commands
(`doctor`, `export-diagram`, `import-drawio`, `import-excalidraw`,
`import-mermaid`, `profile`).

Este projeto não tinha pasta `.claude/` nenhuma até então — criada do
zero: `.claude/skills/diagram-design/` (SKILL.md + assets/ + references/ +
scripts/, ~3.4M) e `.claude/commands/*.md` (os 6 comandos), mantendo
`skills/` e `commands/` como pastas irmãs dentro de `.claude/` porque os
comandos referenciam a skill por caminho relativo
(`../skills/diagram-design/references/...`) — preservar essa disposição
mantém os links funcionando sem editar nada. Sem uso de sudo, dono ficou
`gestor:samba` normal.

Testado via `claude -p` headless (`cd .../intranet-thehub && claude -p
"liste os skills disponíveis..."`) e confirmado carregando de fato dentro
desta própria sessão pouco depois — apareceu no system-reminder de
"New skills discovered" ao ler um arquivo deste diretório.

Na mesma sessão, a mesma skill também foi instalada em vários outros
projetos deste usuário (`spc-deploy`, `gerente-finna`, `supabase`,
`supabase-spc`, `organizador_tarefas`, `intranet-fguerra`, o global
`/DATA/.claude/`, e 29 pastas dentro da árvore `sites/`) — registrado com
detalhe na memória do agente (`project_diagram_design_skill_install.md`),
não repetido aqui por não ser específico deste projeto.

### Pendências / possíveis próximos passos
(sem novidade — nenhuma pendência nova gerada por essa instalação de skill,
ver lista acima)
