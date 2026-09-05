# Plano — Blog Dinâmico com Supabase
## Site `devalexandre.fguerra.ia.br` — Área de Blog
**Versão 1.0**

---

## Visão geral

Migrar o Blog de arquivos MDX estáticos para o Supabase, permitindo criar, editar e deletar posts diretamente pelo painel admin do site, sem redeploy e sem mexer em código.

---

## Checklist completo

---

### FASE 1 — Banco de dados (Supabase)

- [ ] **1.1** Criar tabela `posts` no Supabase via SQL Editor
- [ ] **1.2** Habilitar RLS na tabela `posts`
- [ ] **1.3** Criar política de leitura pública (só posts `published`)
- [ ] **1.4** Criar política de escrita para admin (`alexandre.guerra51@icloud.com`)
- [ ] **1.5** Criar trigger `updated_at` automático na tabela `posts`
- [ ] **1.6** Migrar os 5 posts existentes (MDX → Supabase) via INSERT
- [ ] **1.7** Verificar no Table Editor que os 5 posts apareceram corretamente

---

### FASE 2 — Camada de dados (lib/)

- [ ] **2.1** Criar arquivo `lib/supabase-blog.ts` com as funções:
  - `getAllPosts()` — busca posts publicados ordenados por data
  - `getPostBySlug(slug)` — busca post individual por slug
  - `getAllTags()` — agrega tags dos posts publicados
  - `getPostsByTag(tag)` — filtra posts por tag
  - `createPost(data)` — cria novo post (admin)
  - `updatePost(id, data)` — atualiza post (admin)
  - `deletePost(id)` — deleta post (admin)
- [ ] **2.2** Testar funções no terminal com `npm run dev`

---

### FASE 3 — Páginas públicas do Blog

- [ ] **3.1** Atualizar `app/blog/page.tsx`
  - Substituir `getAllPosts()` de MDX por `getAllPosts()` do Supabase
  - Adicionar `export const dynamic = 'force-dynamic'` (SSR)
  - Manter visual idêntico ao atual
- [ ] **3.2** Atualizar `app/blog/[slug]/page.tsx`
  - Substituir `getPostBySlug()` de MDX por Supabase
  - Posts com status `draft` ou `archived` retornam 404
  - Manter renderização de Markdown (conteúdo em HTML)
  - Manter navegação anterior/próximo
  - Manter botões de compartilhar
  - **Adicionar Giscus no final** de cada post individual
- [ ] **3.3** Atualizar `app/blog/tag/[tag]/page.tsx`
  - Substituir fonte de dados MDX por Supabase
- [ ] **3.4** Atualizar `app/busca/page.tsx`
  - Busca passa a consultar Supabase em vez de índice MDX estático

---

### FASE 4 — Painel Admin do Blog

- [ ] **4.1** Criar página `app/admin/blog/page.tsx`
  - Listagem de todos os posts (incluindo drafts e archived)
  - Colunas: título, status, data, tags, ações
  - Botão "Novo post"
  - Ícones de editar ✏️ e apagar 🗑️ por post
  - Badge de status (published = verde, draft = amarelo, archived = cinza)
  - Protegida — só admin autenticado acessa
- [ ] **4.2** Criar componente `components/PostEditor.tsx`
  - Modal/drawer com formulário completo
  - Campos: título, slug (gerado automaticamente do título), excerpt, content (textarea Markdown), tags (input com chips), status (select), cover (URL opcional)
  - Preview do Markdown em tempo real (opcional)
  - Botões: Salvar como rascunho / Publicar / Cancelar
  - Usado tanto para criar quanto para editar
- [ ] **4.3** Adicionar link para `/admin/blog` na página `/admin/login` ou no header quando logado

---

### FASE 5 — Giscus no Blog

- [ ] **5.1** Adicionar `<GiscusComments />` no final de `app/blog/[slug]/page.tsx`
  - Cada post tem sua própria discussão no GitHub (mapeado por pathname)
  - Dark/light mode automático

---

### FASE 6 — Segurança

- [ ] **6.1** Confirmar que RLS bloqueia escrita de usuários não autenticados
- [ ] **6.2** Confirmar que posts `draft` e `archived` não aparecem publicamente
- [ ] **6.3** Confirmar que a página `/admin/blog` redireciona para login se não autenticado
- [ ] **6.4** Confirmar que variáveis de ambiente sensíveis não estão expostas ao cliente

---

### FASE 7 — Deploy e testes

- [ ] **7.1** Commit e push para GitHub
- [ ] **7.2** Verificar deploy automático na Vercel
- [ ] **7.3** Testar fluxo completo:
  - [ ] Acessar `/blog` e ver os 5 posts migrados
  - [ ] Clicar num post e ver o conteúdo + Giscus
  - [ ] Filtrar por tag e ver posts corretos
  - [ ] Buscar post pelo título
  - [ ] Fazer login como admin
  - [ ] Criar novo post como `draft` — não aparece em `/blog`
  - [ ] Publicar o post — aparece em `/blog` imediatamente
  - [ ] Editar título e conteúdo — mudança reflete em `/blog` imediatamente
  - [ ] Apagar post — some de `/blog` imediatamente
  - [ ] Mudar status para `archived` — some de `/blog`
  - [ ] Acessar URL de post arquivado — retorna 404

---

### FASE 8 — Limpeza (opcional, após tudo funcionando)

- [ ] **8.1** Mover arquivos MDX de `content/blog/` para pasta de backup (não apagar)
- [ ] **8.2** Remover funções MDX de `lib/mdx.ts` que não são mais usadas
- [ ] **8.3** Remover Prisma do projeto (`prisma/`, `lib/prisma.ts`, dependência no `package.json`)

---

## Modelo de dados — tabela `posts`

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | UUID | Chave primária gerada automaticamente |
| `slug` | TEXT UNIQUE | URL do post (ex: `configurando-homelab-zimaos`) |
| `title` | TEXT | Título do post |
| `excerpt` | TEXT | Resumo para o card da listagem |
| `content` | TEXT | Corpo do post em Markdown |
| `published_at` | TIMESTAMPTZ | Data de publicação |
| `updated_at` | TIMESTAMPTZ | Atualizado automaticamente pelo trigger |
| `tags` | TEXT[] | Array de tags (ex: `["zimaos", "docker"]`) |
| `status` | TEXT | `draft`, `published` ou `archived` |
| `cover` | TEXT | URL da imagem de capa (opcional) |

---

## Estratégia de renderização

**SSR com `force-dynamic`** — cada requisição busca os dados frescos do Supabase.

Vantagens:
- Posts publicados aparecem imediatamente, sem redeploy
- Posts arquivados somem imediatamente
- Sem complexidade de ISR ou revalidação

Desvantagem:
- Ligeiramente mais lento que SSG (milissegundos — imperceptível para o volume do blog)

---

## Fluxo completo após implementação

```
Admin cria/edita post no painel
        ↓
Supabase salva (RLS valida o email do admin)
        ↓
Visitante acessa /blog
        ↓
Next.js (SSR) consulta Supabase em tempo real
        ↓
Só posts com status = "published" aparecem
        ↓
Visitante clica no post → /blog/[slug]
        ↓
Next.js busca post por slug no Supabase
        ↓
Renderiza conteúdo Markdown + Giscus
```

---

## Arquivos que serão criados/alterados

| Arquivo | Ação |
|---|---|
| `lib/supabase-blog.ts` | Criar — funções de acesso ao blog |
| `app/blog/page.tsx` | Alterar — fonte de dados MDX → Supabase |
| `app/blog/[slug]/page.tsx` | Alterar — fonte de dados + Giscus |
| `app/blog/tag/[tag]/page.tsx` | Alterar — fonte de dados |
| `app/busca/page.tsx` | Alterar — busca no Supabase |
| `app/admin/blog/page.tsx` | Criar — painel admin do blog |
| `components/PostEditor.tsx` | Criar — editor de posts |
