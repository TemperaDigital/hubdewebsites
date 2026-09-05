# Guerra Financeiro

Agente financeiro conversacional (TanStack Start + React 19 + Supabase + IA).
100% self-hosted, sem dependência de Cloudflare Workers ou Lovable.

## Stack

- TanStack Start (SSR Node.js, porta 3000)
- React 19 + Tailwind v4 + shadcn/ui
- Supabase (auth + Postgres + RLS)
- IA via gateway compatível OpenAI (chave em `LOVABLE_API_KEY`)

## Desenvolvimento local

```bash
cp .env.example .env   # preencha as chaves
npm install
npm run dev            # http://localhost:3000
```

## Build de produção (sem Docker)

```bash
npm run build
node .output/server/index.mjs
```

## Docker / docker-compose

```bash
cp .env.example .env   # preencha as chaves
docker compose up -d --build
```

A app fica em `http://SERVIDOR:3000`.

## Deploy em ZimaOS + Cloudflare Tunnel

1. Suba `docker compose up -d --build` no ZimaOS.
2. Crie um Cloudflare Tunnel (`cloudflared`) apontando
   `guerrafinanceiro.fguerra.ia.br` → `http://localhost:3000`
   (ou para o nome do serviço `app:3000` se rodar o tunnel no mesmo compose).
3. Não exponha a porta 3000 na internet — deixe só o tunnel acessível.

### Exemplo de config do tunnel (`config.yml`)

```yaml
tunnel: <TUNNEL-ID>
credentials-file: /etc/cloudflared/<TUNNEL-ID>.json
ingress:
  - hostname: guerrafinanceiro.fguerra.ia.br
    service: http://app:3000
  - service: http_status:404
```

## Variáveis de ambiente

Ver `.env.example`. Resumo:

| Variável | Onde é usada |
| --- | --- |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` | Cliente (navegador) |
| `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` | Server functions autenticadas |
| `SUPABASE_SERVICE_ROLE_KEY` | Server admin (bypass RLS) |
| `LOVABLE_API_KEY` | Chamadas ao modelo de IA (chat + parser de extratos) |

> As `VITE_*` são gravadas no bundle no momento do `npm run build`.
> Em Docker, são passadas como `--build-arg` (já configurado no `docker-compose.yml`).

## Migrações do banco

```bash
supabase db push   # aplica supabase/migrations/*
```
