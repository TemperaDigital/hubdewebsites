# Diário de atividades

Registro cronológico do que mudou, **por quê** e como foi verificado.
Entradas mais recentes no topo.

---

## 2026-09-13 — Auditoria, conexão do backend, deploy e correção de login GitHub

Sessão longa, em várias partes. Resumo por assunto.

### Auditoria inicial

O projeto é um blog Next.js 14 (App Router), mas o `docker-compose.yml` e o
`README.md` na raiz descreviam um **site estático puro** (nginx servindo a
pasta inteira) — resíduo de uma geração anterior do projeto, nunca limpo.
Ver [[feedback_sites_folder_collision_pattern]] na memória do agente: esse
padrão de colisão aconteceu de novo, no mesmo dia, no `temperadigital/`.

Outros problemas achados na auditoria:
- Prisma (`prisma/schema.prisma`) tinha `output` apontando pra um path
  absoluto de outra máquina (`/home/ubuntu/site-alexandre-guerra/...`) —
  quebrava `npm run build` na primeira etapa. Nunca era usado de verdade
  (`ContactSubmission` não tinha nenhum código chamando).
- `next-auth`/`@next-auth/prisma-adapter` nas deps, mas nunca importados —
  a auth real sempre foi Supabase (GitHub OAuth), não NextAuth.
- Domínio hardcoded errado em vários arquivos (`eu-alexandre.fguerra.ia.br`
  em vez de `devalexandre.fguerra.ia.br`) — `lib/constants.ts`,
  `app/robots.ts`, `app/sitemap.ts`, `app/feed.xml/route.ts`,
  `app/layout.tsx`.
- Sem `.env` nenhum no projeto.
- `@typescript-eslint/eslint-plugin@7.0.0` incompatível com
  `parser@7.0.0` e com `eslint@9.24.0` — `npm ci` nem rodava. Corrigido
  subindo pra `7.18.0`/`eslint@8.57.0`.

**Correções aplicadas:** removido Prisma inteiro (schema, `lib/prisma.ts`,
`lib/db.ts` duplicado, `scripts/safe-seed.ts`, deps do `package.json`),
domínio corrigido em todos os arquivos, `next.config.js` ganhou
`output: 'standalone'`.

### Backend: guerrabase, não Supabase cloud

O usuário quis usar o Supabase pessoal self-hosted
(`guerrabase.fguerra.ia.br`, ver [[project_guerrabase_estado]] na memória
do agente) como backend. Criada a tabela `notas` lá (RLS: leitura pública,
escrita só pra e-mails admin). `.env` criado com
`NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` apontando pra
lá.

### Deploy Docker

`Dockerfile` multi-stage (`deps` → `builder` → `runner` Alpine, usando o
`output: standalone`), `docker-compose.yml` novo substituindo o antigo de
nginx puro. Container `devalexandre`, porta **8304**. Build e deploy
testados de ponta a ponta (`docker compose build && up -d`, smoke test de
`/`, `/blog`, `/blog/[slug]`, `/notas`, `/admin/login`, `/sitemap.xml`,
`/robots.txt` — todos 200).

**Achado durante o build:** `app/notas/page.tsx` usava `<GiscusComments />`
sem importar o componente — erro de compilação real, corrigido.

### Login GitHub — dois bugs reais corrigidos

Primeira tentativa de login retornava erro. Diagnóstico:

1. **GitHub OAuth nunca tinha sido habilitado** no guerrabase (as 4 linhas
   `GOTRUE_EXTERNAL_GITHUB_*` vêm comentadas por padrão no template do
   Supabase self-host). Usuário criou uma **GitHub App** (não OAuth App
   clássico) chamada "blog devalexandre", org TemperaDigital, com
   callback `https://guerrabase.fguerra.ia.br/auth/v1/callback` (o
   callback do GoTrue — ponto de confusão comum, não é o callback do
   site). Habilitado no `.env` do guerrabase + `docker-compose.yml`
   descomentado, container `auth` recriado (`docker compose up -d
   --no-deps auth` — `docker restart` sozinho **não** relê `.env`).

2. **Bug de PKCE**: mesmo com GitHub habilitado, login retornava erro 500.
   `app/auth/callback/route.ts` (Route Handler, roda no servidor) tentava
   `exchangeCodeForSession(code)` usando um cliente Supabase novo, sem
   acesso ao `code_verifier` PKCE que o `@supabase/supabase-js` do browser
   tinha guardado em `localStorage`. Corrigido migrando `lib/supabase.ts`
   e o callback pra `@supabase/ssr` (`createBrowserClient`/
   `createServerClient` com cookies compartilhados entre browser e
   servidor).

3. **Bug de origin**: depois do fix de PKCE, o login completava mas
   redirecionava pra `https://<container-id>:3000/notas` — o
   `new URL(request.url).origin` dentro da Route Handler **standalone**
   do Next não reflete o `Host` público real, mesmo passando o header
   manualmente (testado com `curl -H "Host: devalexandre.fguerra.ia.br"`
   direto no container e o bug persistiu). Corrigido usando
   `process.env.NEXTAUTH_URL` como origem fixa em vez de derivar da
   request.

Login GitHub confirmado funcionando depois dos 3 fixes (`curl` mostrando
`Location: https://devalexandre.fguerra.ia.br/notas` correto).

### Identidade da conta logada — não é bug

O primeiro login completo foi feito com a conta/org GitHub **"Tempera
Digital"**, não a pessoal do usuário — confirmado direto no banco
(`auth.users`, `email: temperadigital@fguerra.ia.br`). Isso não é erro:
é só a conta que estava ativa no navegador no momento. Resolvido pedindo
pro usuário logar com a conta certa, e depois **ampliando a lista de
e-mails admin** (pedido do usuário) pra incluir as duas contas que ele
realmente usa.

### Badge de admin + múltiplos e-mails autorizados

Pedido do usuário: indicador visual de quem está logado + logout, e mais
e-mails autorizados como admin.

- `components/admin-badge.tsx`: badge verde pulsante no header (desktop e
  mobile), mostra o e-mail logado + botão de sair. Só aparece pra sessão
  autenticada com e-mail na lista de admin — invisível pra qualquer outro
  visitante.
- `lib/constants.ts` → `adminEmails`: `alexandre.guerra51@icloud.com`,
  `temperadigital@fguerra.ia.br`, `alexandre@fguerra.ia.br`. Usado tanto
  na UI (`app/notas/page.tsx`, `admin-badge.tsx`) quanto na **RLS do
  Postgres** da tabela `notas` — a RLS é o que realmente protege, a UI só
  esconde botão.

### Casualidade: reboot do host no meio da sessão

O host ZimaOS reiniciou sozinho durante um `docker compose build` (uptime
zerou, conexão da sessão remota caiu). Derrubou a stack `supabase-*`
inteira, o container `devalexandre`, e também o `sites`
(`sites.fguerra.ia.br`, não relacionado a este projeto). Todos trazidos de
volta com `docker compose up -d`/`docker start` em cada pasta — o restart
policy (`unless-stopped`) sozinho não bastou.

### Achado de segurança, não deste projeto

Durante a preparação pra mexer no `temperadigital/`, achei
`trabalho/temperadigital/temperadigital.md` — uma chave SSH privada em
texto puro, resíduo de um incidente de segurança de 2026-09-05 (ver
[[project_hubdewebsites_github_push]] na memória do agente). Confirmado
com o usuário que já tinha sido revogada; arquivo apagado.

## Pendente

- Giscus (`components/GiscusComments.tsx`) dá "giscus is not installed on
  this repository" — precisa habilitar Discussions + instalar o app
  giscus no repo `AlexandreGuerra-prod/devalexandre` (ou trocar pro repo
  certo se não for esse).
- Rota do Cloudflare Tunnel pra `devalexandre.fguerra.ia.br` →
  `http://localhost:8304` — dashboard Zero Trust, fora do meu alcance
  daqui.
- `next@14.2.28` tem vulnerabilidade de segurança conhecida (advisory
  dez/2025) — upgrade não feito, fora de escopo desta sessão.
- `package-lock.json` tinha pacotes órfãos das deps do Prisma removidas —
  some sozinho no próximo `npm install` completo (já rodei
  `--package-lock-only` durante a sessão, então o lockfile em si já está
  correto).
