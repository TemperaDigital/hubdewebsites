# Tasks: Download sem buffer de memória

> feature: download-sem-buffer-memoria

## T-006 — Detectar se o navegador consegue gravar direto no disco [pendente]

- Refs: US-003, AC-006
- Arquivos: src/lib/file-sink.ts, src/lib/file-sink.test.ts
- Notas: função pura que recebe um objeto parecido com `window` e responde se dá para usar a gravação direta (existe `showSaveFilePicker` E o contexto é seguro). É o que decide entre o caminho novo e o antigo — precisa ser testável sem navegador de verdade. Sozinha, não altera nenhum comportamento.

## T-007 — Separar a leitura do stream da forma de salvar [pendente]

- Refs: US-003, US-004, AC-005, AC-008
- Arquivos: src/lib/downloader-client.ts, src/lib/downloader-client.test.ts
- Notas: `downloadMedia` passa a receber um "destino" (grava pedaço / finaliza) em vez de montar o Blob por conta própria. Dois destinos: o antigo (acumula e clica no link) e o novo (grava direto). Refatoração sem mudança de comportamento — o teste garante que o progresso continua sendo reportado igual. Toca o mesmo arquivo de T-008, então roda antes.

## T-008 — Implementar a gravação direta em disco [pendente]

- Refs: US-003, US-004, AC-005, AC-008
- Arquivos: src/lib/downloader-client.ts
- Notas: destino usando File System Access API — pede o lugar de salvar antes de começar a baixar e vai escrevendo. BLOQUEADA pela pergunta Q-004: se a suposição ASM-005 se confirmar, esta tarefa muda de forma ou some. Depende de T-006 e T-007.

## T-009 — Avisar em português quando o arquivo não couber na memória [pendente]

- Refs: US-003, AC-007
- Arquivos: src/lib/downloader-client.ts, src/components/downloader/DownloadBar.tsx
- Notas: no caminho antigo, comparar o tamanho estimado com o teto de Q-005 e avisar antes de começar; e tratar a falha de alocação durante a montagem do Blob. Mensagem por toast (sonner), nunca `alert()`. Depende de T-007.
