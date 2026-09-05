# Relatório de inspeção — video-saver-pro

> Data: 2026-08-31
> Escopo: inspeção completa, validação do risco #1 do CLAUDE.md e especificação
> das quatro correções pelo fluxo `onp-spec-driven`.
> Estado: **nada foi executado, deployado ou editado no código** — só inspeção,
> testes e especificação.

---

## 1. Avaliação do CLAUDE.md

**Concordo com os 4 riscos.** Discordo da gravidade de três deles:

| Risco | CLAUDE.md diz | O que foi medido |
|---|---|---|
| #1 merge | "acima de 360p" | **Todas** as 8 qualidades (2160p→144p) passam pelo caminho quebrado. O YouTube não serve mais formato progressivo nessa fonte |
| #1 merge | "precisa ser testado" | Testado. **Falha**, e falha em silêncio com exit 0 |
| #3 auth | "OK para uso só na LAN" | `CORS_ORIGIN: "*"` faz qualquer site visitado na LAN usar o servidor como intermediário. Não é só "se um dia expor" |
| #4 auto-update | "considerar logar a versão" | Há degradação **acontecendo agora** — ver achado novo abaixo |

### Achado novo, fora do CLAUDE.md

O yt-dlp avisa:

    WARNING: [youtube] No supported JavaScript runtime could be found. Only deno
    is enabled by default; to use another runtime add --js-runtimes RUNTIME[:PATH]
    ... YouTube extraction without a JS runtime has been deprecated, and some
    formats may be missing.

A imagem é `node:22-alpine` (tem Node), mas o yt-dlp só usa Deno por padrão. E
como `extractor/server.js:104` passa `--no-warnings`, esse aviso **nunca chega
ao registro do servidor**. Virou a tarefa T-019 da feature
`versionamento-yt-dlp`.

### O que está bom

- `assertPublicUrl` (anti-SSRF com resolução de DNS, não só regex de hostname) é
  sólido.
- `cleanupError` traduz erro do yt-dlp sem vazar stderr cru.
- `flush_interval -1` no Caddy está correto para streaming.
- A separação de lógica pura em `src/lib/` é real, não decorativa.

---

## 2. `bun install` + `bun run test` — passa, mas não pelo compartilhamento de rede

    bun install          → EINVAL: Failed to replace old lockfile with new lockfile on disk
    bun run test         → error: could not open bin metadata file
    node vitest.mjs run  → Failed to resolve entry for package "vite"   (pacote existe e está íntegro)

O bloqueio é o caminho UNC (`\\192.168.1.153\...`): o bun não consegue o rename
atômico do lockfile nem remapear os bins, e o resolvedor nativo do vite/rolldown
não resolve pacotes por UNC. **Não é problema do projeto.**

Verificação em disco local, com `media-format.ts` + `media-format.test.ts` e um
vitest limpo:

    Test Files  1 passed (1)
          Tests  7 passed (7)

**O teste passa.** Para rodar na máquina de origem: mapear o share para uma
letra de unidade, ou trabalhar em disco local.

---

## 3. Auditoria do onp-spec-driven — configuração coerente

`audit` saiu limpo (exit 0), mas era vazio: 0 features. Estado da configuração:

- A constituição está correta — P-001 é gate intrínseco, P-002 tem regex + glob
  que casa arquivos reais. **Nenhum princípio sem verificação.**
- Os globs de teste em `onpspec.config.json` funcionam: `src/**/*.test.*` acha o
  arquivo de teste existente.
- `test/**`, `tests/**` e `__tests__/**` não casam nada — inofensivos, mas
  inúteis hoje.
- `testCommand` usa `npx`, e o projeto é Bun. Funciona, mas destoa da convenção
  do CLAUDE.md.

---

## 4. RISCO #1 — CONFIRMADO QUEBRADO

Docker não existe na máquina de inspeção (`docker: command not found`; há um WSL
Ubuntu parado). **O stack não foi subido** — está fora da pasta do projeto e
requer confirmação. Foi testado o caminho de código real: mesmo yt-dlp
(2026.08.19), mesmo ffmpeg (8.1), mesmos argumentos que
`extractor/server.js:250-251` monta.

    yt-dlp --no-playlist --no-warnings --no-progress \
           -f "312+bestaudio/best" -o - --merge-output-format mp4 <1080p>

| Medição | Resultado |
|---|---|
| Código de saída | **0 — sucesso aparente** |
| Bytes na saída | 280.834.212 |
| Primeiros bytes | `47 40 11 10` ← sync byte de **MPEG-TS**, não `ftyp` |
| `ffprobe` format_name | `mpegts` |
| Faixas | h264 1920x1080 + **opus** (as duas presentes) |
| Aviso da substituição | **nenhum**, mesmo rodando sem `--no-warnings` |

O merge funciona; o **container** não. O ffmpeg não escreve MP4 em saída não
pesquisável e o yt-dlp troca por MPEG-TS caladamente. O servidor então manda
`Content-Type: video/mp4` e `filename.mp4` para um transport stream com áudio
Opus — combinação que o VLC toca e que Safari, iOS, Windows Media Player e a tag
`<video>` recusam.

Duas saídas testadas:

- `--merge-output-format mkv` → `1A 45 DF A3`, **Matroska de verdade**. Funciona.
- `--downloader-args ffmpeg_o:-movflags +frag_keyframe+empty_moov` → **continua
  mpegts**. Não adianta.

Nada foi editado. A correção foi especificada em
`.spec/features/corrigir-merge-video-audio/` — 2 histórias, 4 critérios de
aceite, 5 tarefas em 3 faixas.

---

## 5. As quatro features especificadas e planejadas — nenhuma executada

| Feature | Histórias / Critérios / Tarefas | Faixas |
|---|---|---|
| `corrigir-merge-video-audio` | 2 / 4 / 5 | 3 |
| `download-sem-buffer-memoria` | 2 / 4 / 4 | 2 |
| `autenticacao-api-download` | 3 / 5 / 6 | 3 |
| `versionamento-yt-dlp` | 3 / 6 / 6 | 2 |

Cada uma tem `spec.md`, `tasks.md`, `plano-execucao.md`, `plano-execucao.html` e
`executar-tarefas.sh` em `.spec/features/<nome>/`.

`audit` agora sai com exit 1 acusando 19 critérios de aceite sem teste — **é o
esperado**: especificar sem implementar é exatamente esse estado.

### Duas ressalvas sobre os planos gerados

1. O motor agrupa faixas só por arquivos disjuntos, então declara "5 tarefas
   podem rodar em paralelo" ignorando as dependências anotadas nas notas
   (T-003 depende de T-002 estar vermelho; T-003 está bloqueada por decisão do
   dono do produto).
2. **T-020 (`versionamento-yt-dlp`) e T-005 (`corrigir-merge-video-audio`) mexem
   no mesmo `--no-warnings`** — essas duas features não podem rodar em paralelo
   entre si.

---

## 6. Decisões que travam a execução

1. **Ordem de prioridade** das quatro features.

2. **Q-001 — o container do merge**, que bloqueia T-003 e é a decisão central:
   - **(A) MKV** — uma linha, funciona hoje, mas `.mkv` não toca em Safari/iOS
     nativamente.
   - **(B) MP4 real via arquivo temporário** — compatível com tudo, ainda devolve
     `Content-Length` (barra de progresso de verdade), custa disco e espera antes
     do primeiro byte.
   - **(C) MP4 fragmentado com ffmpeg próprio para stdout** — MP4 real sem
     espera, maior esforço.

3. **Docker** — ligar o WSL para subir o stack e reproduzir dentro do container
   (confirma a suposição ASM-001)?

4. **ASM-005** é preocupante na feature de memória: a File System Access API
   exige contexto seguro, e `http://<ip>:3005` não é. Sem HTTPS no Caddy, a
   solução principal daquela feature não existe. Vale verificar antes de
   priorizá-la.

---

## 7. Comandos de verificação usados

    # auditoria da spec
    node .claude/skills/onp-spec-driven/scripts/onp-spec.mjs audit

    # teste (fora do compartilhamento de rede)
    node node_modules/vitest/vitest.mjs run

    # reprodução do risco #1
    yt-dlp --no-playlist --no-warnings --no-progress \
           -f "<id>+bestaudio/best" -o - --merge-output-format mp4 <url> > saida.mp4
    ffprobe -v error -show_entries format=format_name -show_entries stream=codec_type,codec_name saida.mp4
    head -c 12 saida.mp4 | xxd
