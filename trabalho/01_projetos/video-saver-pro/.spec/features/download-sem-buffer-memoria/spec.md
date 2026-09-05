# Spec: Download sem buffer de memória

> feature: download-sem-buffer-memoria
> status: rascunho

## Contexto

`downloadMedia` em `src/lib/downloader-client.ts` lê a resposta inteira num
array de pedaços e só depois monta um `Blob` e dispara o clique no link. Isso
significa que o vídeo inteiro fica na memória da aba antes de qualquer byte
chegar ao disco. Foi uma troca consciente (barra de progresso em troca de
memória), mas o teto é baixo: um 4K de dez minutos passa de 1 GB, e a aba morre
de "Out of Memory" — sem mensagem útil e depois de a pessoa já ter esperado o
download inteiro.

Este é o risco #2 do CLAUDE.md. O agravante medido na feature
`corrigir-merge-video-audio` é que o remux para MPEG-TS inflou o arquivo de
1080p em cerca de 5% (280 MB contra 257 MB de origem), então o volume que passa
pela memória é maior do que o tamanho anunciado na lista de formatos.

## Histórias

### US-003 — Baixar arquivo grande sem derrubar a aba

Como pessoa baixando um vídeo em 4K, quero que o download vá direto para o
disco, para que o navegador não trave nem perca o trabalho no fim.

#### AC-005 — Vídeo grande vai para o disco sem acumular na memória

- **Dado** um download cujo tamanho anunciado passa de um limite considerado
  seguro para a memória da aba
- **Quando** eu confirmo o download
- **Então** os bytes vão sendo gravados enquanto chegam, e o consumo de memória
  da aba não cresce junto com o tamanho do arquivo

#### AC-006 — Navegador sem suporte continua funcionando

- **Dado** um navegador que não oferece a gravação direta em disco (Firefox,
  Safari)
- **Quando** eu baixo um arquivo
- **Então** o download acontece do mesmo jeito pelo caminho antigo, sem erro e
  sem eu precisar fazer nada diferente

#### AC-007 — Estouro de memória vira aviso em português, não tela branca

- **Dado** um download que falha por falta de memória no caminho antigo
- **Quando** a falha acontece
- **Então** eu vejo um aviso em pt-BR dizendo que o arquivo é grande demais para
  este navegador e sugerindo o que fazer, em vez de a aba simplesmente morrer

### US-004 — Continuar enxergando o progresso

Como pessoa baixando um vídeo longo, quero continuar vendo quanto já baixou,
para que eu saiba se vale a pena esperar.

#### AC-008 — A barra de progresso continua funcionando no caminho novo

- **Dado** um download em andamento gravando direto no disco
- **Quando** os bytes vão chegando
- **Então** a barra de progresso continua avançando com os bytes já recebidos,
  como no caminho antigo

## Fora de escopo

- Retomar download interrompido (continuar de onde parou).
- Baixar vários arquivos ao mesmo tempo.
- Mudar o container ou o merge — é a feature `corrigir-merge-video-audio`.

## Suposições

| ID | Suposição | Status | Resolução |
|---|---|---|---|
| ASM-004 | A File System Access API resolve o caso, e o fato de ela só existir em navegadores Chromium é aceitável porque o uso é doméstico na LAN | aberta | confirmar com o dono do produto quais navegadores realmente usam o baixador |
| ASM-005 | A File System Access API exige contexto seguro (HTTPS ou localhost); o acesso por `http://<ip-do-zima>:3005` **não** é contexto seguro, então o caminho novo simplesmente não vai existir na prática hoje | aberta | verificar em navegador real no endereço de uso; se confirmado, a feature depende de resolver o HTTPS antes |
| ASM-006 | Sem `Content-Length` na resposta (o motor faz stream, não sabe o tamanho final), o limite para decidir entre um caminho e outro terá de sair do `filesize` estimado no probe, que hoje só conta a faixa de vídeo nas opções com `+` | aberta | medir a diferença entre o estimado e o real em alguns vídeos |

## Perguntas em aberto

| ID | Pergunta | Status | Resposta |
|---|---|---|---|
| Q-004 | Se a suposição ASM-005 se confirmar (sem HTTPS não há gravação direta em disco), qual o caminho? Colocar HTTPS no Caddy com certificado interno, aceitar o limite de memória, ou fazer o motor gravar em disco e servir um link comum de download? | aberta | — |
| Q-005 | Qual é o teto de memória aceitável antes de o baixador avisar que o arquivo é grande demais — 1 GB, 2 GB, ou proporcional à memória que o navegador informa? | aberta | — |
