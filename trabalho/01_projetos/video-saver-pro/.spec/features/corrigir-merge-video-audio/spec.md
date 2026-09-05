# Spec: Corrigir merge de vídeo+áudio

> feature: corrigir-merge-video-audio
> status: em-implementacao
> código pronto e validado para YouTube (2026-09-01) — status fica em
> em-implementacao, não implementada, porque ASM-003 (outras fontes) segue
> aberta de propósito: fora do escopo desta rodada. Resultado completo da
> validação em Suposições e Perguntas em aberto, mais adiante nesta spec.

## Contexto

Quem baixa um vídeo do YouTube em qualquer qualidade recebe hoje um arquivo com
extensão `.mp4` e cabeçalho `Content-Type: video/mp4` que **não é um MP4**: é um
MPEG-TS (transport stream). O motor pede `--merge-output-format mp4` com saída
em `-o -` (stdout), o ffmpeg não consegue escrever MP4 em saída não pesquisável,
e o yt-dlp troca o container por MPEG-TS **em silêncio** — sem aviso nenhum, com
código de saída 0. O arquivo entregue tem áudio Opus dentro de MPEG-TS,
combinação que o VLC toca mas que Safari, iOS, Windows Media Player e a tag
`<video>` do navegador recusam.

Este é o risco #1 do CLAUDE.md e o motivo original do projeto existir.

### Evidência medida (2026-08-31 · yt-dlp 2026.08.19 · ffmpeg 8.1)

Comando idêntico ao que `handleFetch` monta, sobre um vídeo real em 1080p:

    yt-dlp --no-playlist --no-warnings --no-progress \
           -f "312+bestaudio/best" -o - --merge-output-format mp4 <url>

| Medição | Resultado |
|---|---|
| Código de saída | 0 (sucesso aparente) |
| Bytes na saída | 280.834.212 |
| Primeiros bytes | `47 40 11 10` — sync byte de MPEG-TS, **não** `ftyp` |
| `ffprobe` format_name | `mpegts` |
| Faixas | h264 1920x1080 + opus (as duas presentes) |
| Aviso da substituição | **nenhum**, mesmo rodando sem `--no-warnings` |
| Mesmo teste com `--merge-output-format mkv` | `1A 45 DF A3` — Matroska de verdade |
| Mesmo teste com `--downloader-args ffmpeg_o:-movflags +frag_keyframe+empty_moov` | continua `mpegts` |

Ou seja: o merge acontece e as duas faixas chegam. O que quebra é o
**container**. E MKV para stdout funciona; MP4 para stdout, não — e a bandeira
`--merge-output-format mp4` é ignorada sem reclamar.

### Achado adicional que amplia o risco

Rodando a lógica de `buildOptions` sobre o probe real, as oito qualidades
ofertadas — 2160p, 1440p, 1080p, 720p, 480p, 360p, 240p e 144p — voltaram todas
com `merged: true`, isto é, todas passam pelo caminho com `+`. O YouTube não
devolve mais formato progressivo nesta fonte, então o caminho defeituoso é o
único caminho. O CLAUDE.md subestima o risco ao dizer "acima de 360p".

## Histórias

### US-001 — Receber um arquivo que realmente abre

Como pessoa usando o baixador, quero que o arquivo salvo abra no player e no
celular, para que o download sirva para alguma coisa.

#### AC-001 — O arquivo entregue é do formato que a extensão promete

- **Dado** um vídeo do YouTube em 1080p, qualidade que só existe com vídeo e
  áudio separados
- **Quando** eu escolho essa qualidade e baixo
- **Então** o arquivo salvo é de verdade do formato que o nome dele anuncia — os
  bytes de assinatura do arquivo batem com a extensão e com o `Content-Type`
  enviado —, nunca um MPEG-TS disfarçado de `.mp4`

#### AC-002 — O vídeo baixado tem imagem e som

- **Dado** o mesmo download em 1080p
- **Quando** o arquivo termina de baixar
- **Então** ele contém uma faixa de vídeo de 1920x1080 e uma faixa de áudio, e a
  duração bate com a do vídeo original

#### AC-003 — A qualidade escolhida na tela é a qualidade entregue

- **Dado** que escolhi 1080p na lista de formatos
- **Quando** o arquivo chega
- **Então** a altura do vídeo é 1080 — o motor não cai silenciosamente para uma
  qualidade menor nem entrega só a faixa de vídeo, sem áudio

### US-002 — Falhar alto em vez de entregar lixo

Como pessoa mantendo o baixador, quero que uma troca silenciosa de container
vire erro visível, para que nunca mais um arquivo quebrado passe por bom.

#### AC-004 — Container trocado vira falha, não sucesso

- **Dado** um pedido de download cujo container final não pode ser produzido
  como foi solicitado
- **Quando** o motor percebe a divergência
- **Então** a pessoa vê uma mensagem de erro em pt-BR explicando o que houve, em
  vez de baixar um arquivo que não abre — e o registro do servidor guarda o
  container pedido e o container real

## Fora de escopo

- Trocar o buffer em memória do client por gravação em disco — é a feature
  `download-sem-buffer-memoria`.
- Autenticação da rota `/api/dl/*` — é a feature `autenticacao-api-download`.
- Reencodar vídeo. Toda solução aqui é remux (cópia de faixa), nunca reencode:
  reencodar 4K no ZimaOS é inviável.

## Suposições

| ID | Suposição | Status | Resolução |
|---|---|---|---|
| ASM-001 | O comportamento medido no Windows com ffmpeg 8.1 é o mesmo dentro do container `node:22-alpine` — a troca para MPEG-TS vem do yt-dlp/ffmpeg, não do sistema operacional | confirmada | reproduzido dentro do container `extractor` real (`docker compose up -d --build`) em 1080p e 480p — ver relatório de validação da rodada corrigir-merge-video-audio (2026-09-01) |
| ASM-002 | O ZimaOS tem espaço livre suficiente para gravar o arquivo temporário de um vídeo 4K (1–3 GB por download) caso a solução escolhida grave em disco | confirmada | `/DATA` tinha 770G livres em 1.8T no momento da implementação — folga muito maior que o pior caso (poucos GB por download simultâneo) |
| ASM-003 | As outras fontes (Instagram, TikTok, X, Reddit, Facebook, Pinterest) não sofrem com a mesma gravidade, porque costumam servir arquivo progressivo | aberta | fora desta rodada — só o YouTube foi validado; não foi rodado o probe nas demais fontes |

## Perguntas em aberto

| ID | Pergunta | Status | Resposta |
|---|---|---|---|
| Q-001 | Qual container o baixador deve entregar quando o merge for necessário? (A) MKV — muda uma linha, funciona hoje, mas `.mkv` não toca em Safari/iOS nativamente; (B) MP4 de verdade, gravando arquivo temporário no container antes de fazer o stream — compatível com tudo e ainda devolve `Content-Length` (barra de progresso real), ao custo de disco e de espera antes do primeiro byte; (C) MP4 fragmentado montado por um ffmpeg próprio direto para stdout — MP4 real e sem espera, porém o de maior esforço | respondida | (B), decisão do dono do produto. Implementada em `extractor/server.js` (`handleFetchMerged`): grava em arquivo temporário sob `os.tmpdir()/video-saver-fetch`, confere o container real pelos bytes de assinatura (T-001) antes de mandar qualquer byte, e só então transmite com `Content-Length` real. Aplicada só ao caminho de merge (`format.includes("+")`) — o caminho sem merge continua streaming direto, sem o defeito. |
| Q-002 | Se a resposta for (B), o arquivo temporário pode ficar em volume nomeado do Docker, ou precisa ser `tmpfs`/memória por causa do desgaste do disco do ZimaOS? | respondida | Disco comum (`os.tmpdir()` dentro do container, não `tmpfs`) — ASM-002 confirmou 770G livres, folga suficiente. Arquivo é apagado assim que a resposta HTTP fecha (sucesso, erro ou cancelamento do cliente — via `res.on("close")`); uma varredura na subida do servidor (`sweepTempFetchDir`) cobre o caso de o processo ser morto à força (SIGKILL/crash) no meio de um download. |
| Q-003 | O `--no-warnings` deve sair de `baseArgs()`, para que os avisos do yt-dlp cheguem ao registro do servidor? Foi ele que ajudou a esconder este defeito | respondida | Sim, removido. `cleanupError()` só filtra linhas `ERROR:`, então tirar `--no-warnings` não muda o tratamento de erro existente; avisos (`WARNING:`) do yt-dlp num download com merge agora são logados no servidor. Atenção: a task T-020 da feature `versionamento-yt-dlp` mexe na mesma função (`baseArgs()`) depois — comentário no código já avisa para não reintroduzir `--no-warnings` ali. |

## Nota de validação — o que o audit automático não vê

`AC-002` e `AC-003` foram validados de verdade (download real 1080p e 480p,
com `ffprobe` conferindo faixas de vídeo+áudio, duração e altura — ver
relatório da rodada), mas o teste que prova isso mora em
`extractor/fetch-args.test.js` (`node --test`, roda dentro do container
`extractor`) porque precisa de yt-dlp/ffmpeg reais e rede — algo que o
`vitest` deste projeto não tem. O `onpspec.config.json` deste projeto só
aponta `testGlobs` para `src/**` (não para `extractor/**`), então
`onp-spec audit` não enxerga esse teste e continua acusando AC-002/AC-003
como sem prova (`AC_SEM_TESTE`) mesmo depois desta rodada — é uma limitação
conhecida da configuração atual, não um retrocesso da feature.
