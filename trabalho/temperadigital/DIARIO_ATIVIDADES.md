# Diário de atividades

Registro cronológico do que mudou, **por quê** e como foi verificado.
Entradas mais recentes no topo.

**⚠ Esta pasta serve `estudos.fguerra.ia.br`, não `temperadigital.fguerra.ia.br`**
apesar do nome — ver a entrada de 2026-09-13 pra entender por quê. O site
institucional real da Têmpera Digital está em `../TD-site/`.

---

## 2026-09-13 — Descoberta de dois sites sobrepostos, migração de schema, deploy

### O que motivou a sessão

O usuário pediu pra "resolver o acesso" de `temperadigital.fguerra.ia.br`,
apontando esta pasta como fonte do site.

### Descoberta: dois projetos na mesma pasta

Essa pasta tinha um `index.html` (+`script.js`+`styles.css`+`assets/`) que
era o site institucional **real** da Têmpera Digital (Sobre/Serviços/
Notícias/Contato, e-mail `temperadigital_IA@gmail.com`, redes sociais
reais) — **sobrescrevendo** o `index.html` que um app **Vite + React**
(`src/`, `package.json`, `supabase/`) também presente na pasta precisava
pra funcionar. O build do Vite saía "bem-sucedido" mas vazio — só
`index.html`+CSS+um PNG, **zero JS bundle** — porque bundlava o
`index.html` estático errado, não `src/main.tsx`.

Investigando o app React: as rotas reais (`src/App.tsx`) são `/trilhas`,
`/plataformas`, `/blog`, `/blog/:slug`, `/noticias`, `/admin/*` — bate com
`estudos.fguerra.ia.br` (já referenciado assim em
`devalexandre/lib/constants.ts`), não com um CRM. Existe também código de
CRM (`src/components/companies`, `contacts`, `pipeline`, `deals`, `tasks`)
mas **não está registrado em nenhuma rota do `App.tsx`** — código morto,
sobra de uma versão anterior do projeto no Lovable (o app parece ter
começado como CRM e pivotado pra plataforma de trilhas/blog).

Confirmado com o usuário: (1) o conteúdo de trilhas/blog é pra
`estudos.fguerra.ia.br` mesmo, (2) ignorar o código de CRM morto, (3) o
site estático vai pra uma pasta nova, `TD-site` (criada pelo usuário,
irmã desta), (4) o app React fica **nesta pasta mesmo**, sem renomear.

### Separação executada

```
mv temperadigital/{index.html,script.js,styles.css,assets} TD-site/
```

Removida a pasta `TD-site` aninhada (duplicata vazia criada por engano
dentro de `temperadigital/`).

Criado um `index.html` novo, padrão Vite (`<div id="root">` +
`<script type="module" src="/src/main.tsx">`), substituindo o que tinha
sido apagado. Rebuild confirmou: 1791 módulos transformados, bundle JS de
654KB (antes: 0 módulos reais, só HTML estático).

### Schema no banco (guerrabase)

As 15 migrations em `supabase/migrations/` eram de **dois produtos
diferentes**: 14 delas são do CRM morto (profiles/user_roles/teams/
companies/contacts/deals/pipeline — não aplicadas, por decisão do
usuário). A última (`20260603131226_...`) é a que realmente importa:
`learning_tracks`, `posts`, `platforms` — aplicada no guerrabase junto com
a função `update_updated_at_column()` (dependência da migration, não
existia lá ainda). Ver [[project_guerrabase_estado]] na memória do agente
pro estado completo do banco compartilhado.

### Auth e proteção do admin

O app usa `supabase.auth.signInWithPassword`/`signUp` (e-mail/senha
direto) — **não** GitHub OAuth, apesar de existir código
`@lovable.dev/cloud-auth-js` (`src/integrations/lovable/index.ts`) no
projeto. Esse broker nunca é chamado pela página de login real
(`src/pages/Auth.tsx`).

Dois problemas de acesso achados e corrigidos:

1. `ENABLE_EMAIL_AUTOCONFIRM=false` no guerrabase + SMTP fake
   (`supabase-mail`/`fake_mail_user`) = sign-up nunca confirmava e-mail,
   login sempre falhava. Corrigido ligando autoconfirm (afeta só esse
   fluxo; GitHub OAuth de outros projetos não passa por confirmação de
   e-mail).
2. `src/components/AdminLayout.tsx` só checava se existia `session` —
   **qualquer cadastro virava admin do painel**, sem restrição nenhuma.
   Corrigido: `src/lib/constants.ts` (novo) com `adminEmails` (mesma
   lista do devalexandre — `alexandre.guerra51@icloud.com`,
   `temperadigital@fguerra.ia.br`, `alexandre@fguerra.ia.br`), checado no
   `AdminLayout.tsx` **e** reforçado nas políticas RLS das 3 tabelas (a
   UI só esconde, a RLS é o que protege de verdade).

### Deploy

Lockfile (`package-lock.json`) estava fora de sincronia — o projeto tinha
sido instalado com Bun antes (`bun.lock`/`bun.lockb` também presentes).
Regenerado via `npm install --package-lock-only` num container Node
descartável.

`Dockerfile` multi-stage: build com Node 20, runtime nginx Alpine servindo
o `dist/` estático. `nginx.conf` com `try_files ... /index.html` pra
funcionar o roteamento client-side do `react-router-dom`
(`BrowserRouter`). Container `estudos`, porta **8305**. Build e deploy
testados (`docker compose build && up -d`, smoke test de `/`, `/trilhas`,
`/plataformas`, `/blog`, `/noticias`, `/admin`, `/auth` — todos 200).

**Bug cosmético corrigido de passagem:** `src/index.css` tinha `@import`
da fonte do Google **depois** de `@tailwind` — Vite avisava (CSS `@import`
tem que vir primeiro). Reordenado.

## Pendente

- Usuário precisa criar a própria conta em `/auth` com um dos 3 e-mails
  admin — sem isso, ninguém tem acesso ao painel ainda.
- Rota do Cloudflare Tunnel pra `estudos.fguerra.ia.br` →
  `http://localhost:8305` — dashboard Zero Trust, fora do meu alcance
  daqui. O domínio já resolve pro Cloudflare, mas não confirmei se a rota
  já existe ou aponta pra outro lugar.
- Código do CRM morto (`src/components/companies` etc.) continua na
  árvore, sem uso — decisão do usuário foi ignorar, não apagar.
