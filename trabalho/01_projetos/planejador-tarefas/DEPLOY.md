# Deploy — Planejador de Tarefas Diárias

App SPA estática construída com Vite + React. Pronta para deploy na **Vercel**,
com DNS gerenciado na **Cloudflare** e domínio próprio.

## 1. Pré-requisitos

### 1.1 Supabase (autenticação)  - Foi removido do projeto original

1. Crie um projeto em <https://supabase.com>.
2. Em **Settings → API**, copie:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public key` → `VITE_SUPABASE_ANON_KEY`
3. Em **Authentication → URL Configuration**:
   - **Site URL**: `https://seudominio.com`
   - **Redirect URLs**: adicione `https://seudominio.com/**` e `http://localhost:8080/**`
4. (Opcional) Configure SMTP próprio em **Project Settings → Auth → SMTP Settings**
   para evitar o limite de e-mails do plano free.

### 1.2 Google Calendar (opcional)

1. Vá em <https://console.cloud.google.com> → APIs & Services.
2. Habilite **Google Calendar API**.
3. Crie credencial **OAuth client ID** → tipo **Web application**.
4. Em **Authorized JavaScript origins** adicione:
   - `http://localhost:5173`
   - URL da Vercel (ex.: `https://meu-app.vercel.app`)
   - Seu domínio final (ex.: `https://seudominio.com`)
5. Copie o **Client ID** → `VITE_GOOGLE_CLIENT_ID`.
    5.1 424904670493-11lbj572af6c395ict5ithah0ncrvpm8.apps.5.2 googleusercontent.com
    5.2 Chave Google cliente para o gemini: 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

## 2. Deploy na Vercel

1. Faça push do repositório no GitHub.
2. Em <https://vercel.com> → **Add New… → Project** → importe o repo.
3. Framework Preset: **Vite**. Build: `bun run build` (ou `npm run build`). Output: `dist`.
4. Em **Environment Variables**, cole as 3 variáveis do `.env.example`.
5. Deploy. A Vercel já entrega como Static Site com fallback SPA via `vercel.json`.

## 3. Domínio próprio na Cloudflare

1. Em Vercel → **Project → Settings → Domains**, adicione seu domínio.
2. A Vercel mostrará um registro CNAME (ex.: `cname.vercel-dns.com`).
3. No painel da Cloudflare, em **DNS → Records**:
   - Para subdomínio (ex.: `app.seudominio.com`): adicione **CNAME** apontando para `cname.vercel-dns.com`.
   - Para apex (`seudominio.com`): use **CNAME flattening** com o mesmo destino.
4. **Desative o proxy** (nuvem cinza) até a Vercel emitir o certificado SSL.
   Depois pode reativar (nuvem laranja).
5. Aguarde a propagação (1 min–24 h).
6. **Atualize** Site URL/Redirect URLs no Supabase e Authorized origins no Google
   para o domínio final.

## 4. Limitações conhecidas

- Tarefas e anexos ficam no **IndexedDB do navegador**. Não há sincronia entre
  dispositivos. Para trocar de celular, exporte/importe manualmente.
- A integração com Google Calendar é **one-way** (app → Calendar) e o token
  expira ao fechar a aba (fluxo client-side OAuth para SPA não suporta refresh).
- Tamanho máximo de anexo: 5 MB cada.
