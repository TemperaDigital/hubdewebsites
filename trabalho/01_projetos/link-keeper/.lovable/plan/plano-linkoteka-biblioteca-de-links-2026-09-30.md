# Plano — Linkoteka (biblioteca de links)

## Objetivo
Aplicação web em pt-BR para catalogar links: colar uma URL cria um card automaticamente (título, assunto e tema sugeridos), com opção de editar/classificar, adicionar hashtags e um campo de anotações. Dados persistidos no Supabase externo já conectado ao projeto, sem tela de login (uso pessoal, monousuário).

## O que será construído

### 1. Banco de dados (Supabase externo conectado)
- Migração SQL limpa criando a tabela `links` (id, url, title, subject, theme, tags, notes, created_at, updated_at).
- Como não há autenticação: políticas RLS abertas para a chave pública (anon) — acesso direto de leitura/escrita, adequado a um app pessoal sem login.

### 2. Lógica de negócio isolada (`src/lib/`)
- `link-utils.ts`: normalização de URL, sugestão automática de título/assunto/tema a partir do endereço (portado do arquivo enviado).
- `links.functions.ts`: server functions (createServerFn) para listar, criar, atualizar e excluir links — toda regra de negócio e acesso ao banco fora dos componentes.
- Valação com Zod em todas as entradas.

### 3. Interface (port do `library.tsx` enviado)
- Página única em `/` com o visual de referência: fundo claro `#f7f9fc`, sidebar branca com marca "Linkoteka", filtro por assuntos com ícones coloridos, busca, filtro por tema e mês, ordenação.
- Campo de entrada no topo: colar a URL cria o card com sugestões automáticas.
- Cards com título, URL, assunto, tema, hashtags, data e anotações; ações de abrir, editar e excluir.
- Edição e exclusão via Dialog/AlertDialog estilizados (proibido `confirm()`/`alert()` nativos), mostrando o nome do item.
- Estados de carregamento (skeletons) e estado vazio elegantes via TanStack Query.
- Toasts em pt-BR (sonner) para feedback de ações.

### 4. Ajustes de plataforma
- O código enviado é Next.js; será adaptado para TanStack Start (rotas em `src/routes/`, server functions em vez de API routes).
- Removida a camada `chatgpt-auth.ts` (sem autenticação, conforme pedido).
- Metadados da página em pt-BR: título "Linkoteka · sua biblioteca de links", descrição e tags og.

## Detalhes técnicos
- Stack: TanStack Start + Tailwind v4 + shadcn/ui + TanStack Query.
- Banco: Supabase externo (Org mwtyioujdmbzlpldmriw) via cliente publishable; migração documentada em arquivo `.sql`.
- Sem autenticação: RLS com políticas públicas na tabela `links`.
- UI estritamente em pt-BR.

## Verificação
- Conferir build sem erros e testar no preview: criar link, editar, adicionar hashtags/notas, filtrar, excluir.
