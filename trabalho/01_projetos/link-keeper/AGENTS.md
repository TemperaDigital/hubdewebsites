<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Estado atual do projeto (Linkoteca) — LEIA ANTES DE EDITAR

Este projeto foi alterado fora do Lovable (via Claude Code, direto no Git) e
agora roda **self-hosted** no servidor do usuário (ZimaOS, via Coolify), não
mais em Cloudflare Workers. O que você (Lovable) deve fazer é **apenas manter
atualizados os seus arquivos internos** (por exemplo `.lovable/`, contexto e
conhecimento do projeto) para refletir o que está descrito aqui. **Não
reescreva nem "corrija" o que já foi feito.**

## Regra principal

**Qualquer alteração na estrutura do projeto exige perguntar ao usuário antes.**
Isso inclui: trocar de framework/preset de build, mexer em `Dockerfile`,
`vite.config.ts`, `package.json` (dependências), estrutura de pastas, schema do
banco (`supabase-setup.sql`), variáveis de ambiente, e a forma como o backend
acessa o Supabase. Mudanças de interface e de texto dentro dos componentes
existentes podem ser feitas normalmente, mas siga as convenções abaixo.

## Como está hoje

- **O que é:** biblioteca pessoal de links ("linkoteca"), app de um único
  usuário, sem login. O usuário cola o endereço de uma página e um card é
  criado e classificado automaticamente (assunto, tema, hashtags). Cards são
  editáveis, com anotações, exclusão e busca.
- **Stack:** TanStack Start (React 19), Tailwind v4, shadcn/ui, zod 4,
  `@supabase/supabase-js`.
- **Backend / banco:** Supabase externo, projeto `exiigociciqdgghdemvu`,
  tabela `public.links` (definida em `supabase-setup.sql`, já aplicada). RLS
  aberto para `anon`, por ser um app monousuário sem login.
- **Acesso ao banco só no servidor:** `src/lib/links.functions.ts` (server
  functions) lê `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY` de `process.env`.
  O navegador nunca fala direto com o Supabase. Não mova isso para o cliente.
- **Análise automática de página** (`src/lib/page-analysis.server.ts`, server
  only): o servidor baixa a página e classifica em camadas: (1) Claude Haiku
  via API, se existir `ANTHROPIC_API_KEY`; (2) regras por palavras usando
  título/descrição/keywords da página; (3) regras só pelo endereço, se a página
  não puder ser lida. Há proteção contra SSRF (hosts/IPs internos bloqueados,
  redirects manuais, limite de tamanho e timeout). **Não enfraqueça essa
  proteção** e não adicione `fetch` de URLs arbitrárias fora desse arquivo.
- **Detecção de duplicados:** `sameUrl()` em `src/lib/link-utils.ts`.
- **Bookmarklet e `/?add=URL`:** o botão "+ Linkoteca" (arrastável para a barra
  de favoritos) abre `/?add=<url>` em uma janela; a página salva o link e
  fecha sozinha se `window.name === "linkoteca"`. O `href` do bookmarklet é
  definido por ref porque o React 19 bloqueia `javascript:` em JSX.
- **Deploy:** `Dockerfile` na raiz. O build usa `NITRO_PRESET=node-server`
  (variável de ambiente no Dockerfile; o `vite.config.ts` **não foi alterado**
  e continua com o padrão Cloudflare para o ambiente do Lovable). A imagem
  final roda `node .output/server/index.mjs` na porta 3000.
- **Auto-deploy:** push na `main` dispara o deploy no Coolify (app 8) por
  webhook do GitHub; o secret fica só no Coolify e no GitHub.
- **Variáveis de ambiente** (ver `.env.example`; segredos nunca vão para o
  repositório, ficam no Coolify): `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`,
  opcional `ANTHROPIC_API_KEY`.

## Convenções

- Interface em português do Brasil.
- Com `exactOptionalPropertyTypes` ligado, use `prop?: T | undefined`.
- Não reescreva o histórico do Git (já vale o aviso do bloco acima).
