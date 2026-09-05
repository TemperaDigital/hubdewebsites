# Tasks: Corrigir merge de vídeo+áudio

> feature: corrigir-merge-video-audio

## T-001 — Detectar o container real de um arquivo pelos bytes de assinatura [concluida]

- Refs: US-001, AC-001
- Arquivos: src/lib/container-signature.ts, src/lib/container-signature.test.ts
- Notas: função pura `sniffContainer(bytes)` devolvendo "mp4" | "mkv" | "webm" | "mpegts" | "desconhecido" — `ftyp` no deslocamento 4 para MP4, `1A 45 DF A3` para Matroska/WebM (com checagem do DocType "webm" no início do cabeçalho para diferenciar de MKV), `0x47` de 188 em 188 bytes para MPEG-TS. É a régua que os testes dos critérios AC-001 e AC-004 usam.
- **Extra não previsto no plano original**: o extractor não compila TypeScript nem tem dependências (ver cabeçalho de `server.js`), então não pode importar este arquivo `.ts` diretamente. Foi criada uma porta em JS puro, `extractor/container-signature.js`, com o mesmo algoritmo (comentário no topo dos dois arquivos aponta a duplicação), usada por `handleFetchMerged` para a checagem em produção (T-005).

## T-002 — Provar o defeito com teste de regressão sobre saída real do yt-dlp [concluida]

- Refs: US-001, AC-001, AC-002, AC-003
- Arquivos: extractor/fetch-args.js, extractor/fetch-args.test.js
- Notas: `handleFetch` foi dividido — a montagem de argumentos agora é a função pura `buildFetchArgs()`, usada tanto pelo caminho direto quanto pelo caminho de merge. Testes unitários cobrem a seleção de `--merge-output-format` (nenhum fora do merge, mp4 ou mkv conforme a extensão pedida). O teste de integração sob demanda (gated por `TEST_VIDEO_URL`, roda com `node --test` dentro do container `extractor` — sem vitest, sem dependências) baixa um trecho real e confere `sniffContainer(...) === "mp4"`. Rodado manualmente na validação desta rodada (ver relatório) contra 1080p e 480p reais — ficou VERMELHO antes de T-003 (confirmou `mpegts`) e VERDE depois.

## T-003 — Implementar a estratégia de container escolhida [concluida]

- Refs: US-001, AC-001, AC-002, AC-003
- Arquivos: extractor/server.js
- Notas: Q-001 = opção B. `handleFetch` agora despacha para `handleFetchMerged` (formatos com "+") ou `handleFetchDirect` (formato único, comportamento antigo inalterado — não sofre do defeito). `handleFetchMerged` grava em arquivo temporário (`os.tmpdir()/video-saver-fetch/<uuid>.tmp`), aguarda o yt-dlp terminar, e só então segue para T-004/T-005.

## T-004 — Alinhar extensão e Content-Type ao container que sai de fato [concluida]

- Refs: US-001, US-002, AC-001, AC-004
- Arquivos: extractor/server.js
- Notas: como Q-001 = MP4 real (não MKV), a promessa que `buildOptions` já fazia (`ext: "mp4"` para opções `merged: true`) continuou correta — não foi necessário mudar `src/lib/media-format.ts` (o arquivo listado no plano original, gerado antes da decisão B). `Content-Type`, `Content-Disposition` e o `ext` da resposta de `/probe` descrevem o mesmo container em todos os casos verificados.

## T-005 — Transformar divergência de container em erro visível [concluida]

- Refs: US-002, AC-004
- Arquivos: extractor/server.js
- Notas: `handleFetchMerged` sniffa os primeiros 4096 bytes do arquivo temporário com `sniffContainer` antes de mandar qualquer cabeçalho; se o container real não bater com o pedido, o arquivo é apagado e o cliente recebe erro 500 em pt-BR (nunca um download de 200 com lixo dentro), com o container pedido e o entregue registrados via `console.error` no servidor. Q-003 respondida (sim, removido `--no-warnings`) — comentário em `baseArgs()` (`extractor/server.js`) explica a mudança e avisa sobre a T-020 da feature `versionamento-yt-dlp`, que mexe na mesma linha depois.
