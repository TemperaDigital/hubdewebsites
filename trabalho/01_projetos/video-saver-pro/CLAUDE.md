# video-saver-pro — contexto do projeto

Baixador de vídeos (YouTube, Instagram, Facebook, TikTok, Pinterest, X, Reddit)
self-hosted, rodando no ZimaOS via Docker. Sucessor de um app desktop antigo
(Tkinter + yt-dlp embutido) que quebrou no YouTube por lib desatualizada.

## Arquitetura

Três containers atrás de um proxy Caddy, tudo na porta 3005:
- `web` — TanStack Start (React), interface em pt-BR, tema escuro.
- `extractor` — Node puro (sem deps), spawna o binário `yt-dlp` diretamente
  (baixado fresco do GitHub Releases no build da imagem, com tentativa de
  `yt-dlp -U` a cada start do container — isso resolve o problema estrutural
  do app antigo, que tinha a lib congelada dentro do .exe).
- `proxy` — Caddy, unifica tudo numa origem só (evita mixed content).

Ver `README-docker.md` para deploy e `roadmap.md` para o estado atual.
Lógica pura fica em `src/lib/` (plataforma, formatos, sanitização de nome)
— os `.tsx` só renderizam.

## Riscos conhecidos, ainda não validados na prática

1. **[PRIORIDADE] Merge de vídeo+áudio direto pro stdout.** Em
   `extractor/server.js`, `handleFetch` usa `-o -` + `--merge-output-format`
   quando o formato pedido tem "+" (vídeo e áudio separados — comum em
   qualquer resolução do YouTube acima de 360p). Isso é tecnicamente delicado
   pra MP4 sem gravar em disco. **Precisa ser testado com um vídeo real em
   1080p antes de qualquer outra coisa** — é o motivo original de todo esse
   projeto existir.
2. O client (`src/lib/downloader-client.ts`) acumula o arquivo inteiro em
   memória (array de chunks → Blob) antes de disparar o download — pode ser
   pesado pra vídeos grandes/4K. Trade-off consciente (progresso visual vs.
   memória); considerar File System Access API como alternativa (só Chromium).
3. Sem autenticação em `/api/dl/*`. OK para uso só na LAN; se algum dia expor
   pra fora, precisa de uma camada de senha antes.
4. Auto-update do `yt-dlp` roda sem versionamento nem rollback. Considerar
   logar a versão ativa e/ou expor um jeito manual de forçar update.

## Spec-Driven Development

Este projeto usa a skill `onp-spec-driven` (instalada em
`.claude/skills/onp-spec-driven/`). Antes de implementar uma feature nova,
use o fluxo `onp-spec new <feature>` para especificar, planejar e depois
auditar contra `.spec/constituicao.md`. Testes rodam com Vitest
(`bun run test`); o `onpspec.config.json` já está configurado com reporter
`vitest-json` para granularidade por teste.

## Convenções

- Interface e mensagens sempre em pt-BR.
- Nunca usar `alert()`/`confirm()` — só toasts (sonner) e diálogos shadcn.
- Gerenciador de pacotes é **Bun** (`bun.lock` é a fonte de verdade — não
  gerar `package-lock.json`).
- Antes de qualquer ação irreversível (deploy, alteração de infraestrutura
  do ZimaOS, rotação de credenciais), confirmar com o usuário antes de agir.
