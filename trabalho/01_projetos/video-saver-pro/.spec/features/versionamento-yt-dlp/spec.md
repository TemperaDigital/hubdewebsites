# Spec: Versionamento e saúde do yt-dlp

> feature: versionamento-yt-dlp
> status: rascunho

## Contexto

O `Dockerfile.extractor` baixa o yt-dlp mais recente no build e roda
`yt-dlp -U || true` a cada start do container. Isso resolveu o problema
estrutural do app antigo (biblioteca congelada dentro do `.exe`), mas trocou por
outro: ninguém sabe qual versão está rodando, o `|| true` engole qualquer falha
da atualização, e não existe caminho de volta quando uma versão nova quebra uma
fonte. Este é o risco #4 do CLAUDE.md.

### Achado novo durante a inspeção

Rodando o yt-dlp com os mesmos argumentos do motor, ele avisou:

    WARNING: [youtube] No supported JavaScript runtime could be found. Only deno
    is enabled by default; to use another runtime add --js-runtimes RUNTIME[:PATH]
    ... YouTube extraction without a JS runtime has been deprecated, and some
    formats may be missing.

A imagem do extrator é `node:22-alpine`, ou seja, tem Node — mas o yt-dlp só usa
o Deno por padrão e precisa de `--js-runtimes node` para aproveitar o que já
está lá. Como o motor roda com `--no-warnings`, esse aviso **nunca aparece nos
registros do servidor**. O risco é concreto e já está em curso: formatos podem
estar faltando na lista que a pessoa vê, e a extração do YouTube sem runtime de
JavaScript está marcada como descontinuada.

Este achado tem prioridade dentro desta feature: não é "um dia pode quebrar", é
funcionalidade degradando agora, em silêncio.

## Histórias

### US-008 — Saber o que está rodando

Como dono do servidor, quero enxergar a versão do yt-dlp em uso, para que eu
consiga relacionar "parou de funcionar" com "atualizou ontem".

#### AC-014 — A versão em uso é visível

- **Dado** o motor de extração no ar
- **Quando** eu consulto a saúde do serviço
- **Então** vejo a versão do yt-dlp ativa, a data da última atualização
  bem-sucedida e se a última tentativa deu certo ou falhou

#### AC-015 — Falha de atualização aparece, em vez de sumir

- **Dado** que a atualização do yt-dlp falhou no start (sem rede, por exemplo)
- **Quando** o container sobe assim mesmo
- **Então** a falha fica registrada no log e visível na saúde do serviço — o
  serviço continua no ar com a versão antiga, mas ninguém é enganado

### US-009 — Poder voltar atrás

Como dono do servidor, quero poder fixar ou voltar para uma versão específica do
yt-dlp, para que uma atualização ruim não me deixe sem baixador.

#### AC-016 — Dá para fixar uma versão

- **Dado** que eu indiquei uma versão específica do yt-dlp na configuração
- **Quando** o container sobe
- **Então** ele usa exatamente aquela versão e não tenta atualizar sozinho

#### AC-017 — A versão anterior fica guardada para o retorno

- **Dado** que uma atualização automática aconteceu
- **Quando** eu percebo que a versão nova quebrou uma fonte
- **Então** existe um caminho documentado para voltar à versão anterior sem
  reconstruir a imagem

### US-010 — Não perder formatos em silêncio

Como pessoa usando o baixador, quero a lista completa de qualidades disponíveis,
para que eu não seja limitada por um aviso que ninguém viu.

#### AC-018 — O motor roda com runtime de JavaScript disponível

- **Dado** o motor de extração no ar
- **Quando** ele analisa um link do YouTube
- **Então** a extração acontece com um runtime de JavaScript ativo, e a saúde do
  serviço mostra qual é — sem o aviso de runtime ausente

#### AC-019 — Avisos do motor chegam ao registro do servidor

- **Dado** que o yt-dlp emitiu um aviso durante uma análise ou download
- **Quando** a operação termina
- **Então** o aviso aparece no registro do servidor, em vez de ser descartado

## Fora de escopo

- Atualização automática do ffmpeg ou da imagem base.
- Interface gráfica para gerenciar versões; basta configuração e a saúde do
  serviço.
- Corrigir o container de saída do merge — é a feature
  `corrigir-merge-video-audio` (mas as duas mexem no mesmo `--no-warnings`,
  então precisam ser combinadas).

## Suposições

| ID | Suposição | Status | Resolução |
|---|---|---|---|
| ASM-010 | `--js-runtimes node` funciona com o Node 22 da imagem e resolve o aviso — a alternativa seria instalar o Deno, que engorda a imagem | aberta | testar dentro do container e comparar a lista de formatos com e sem a bandeira |
| ASM-011 | Algumas das oito qualidades ofertadas hoje podem estar faltando por causa do runtime ausente; a lista pode ficar maior depois da correção | aberta | comparar o probe do mesmo vídeo antes e depois |
| ASM-012 | O `yt-dlp -U` no start é aceitável do ponto de vista de tempo de subida; fixar versão é opção, não o padrão | aberta | confirmar com o dono do produto |

## Perguntas em aberto

| ID | Pergunta | Status | Resposta |
|---|---|---|---|
| Q-009 | A atualização automática no start continua sendo o padrão, ou o padrão passa a ser versão fixa com atualização manual? | aberta | — |
| Q-010 | A saúde do serviço com versão e estado da atualização pode ficar aberta sem senha, ou entra atrás da proteção da feature `autenticacao-api-download`? | aberta | — |
| Q-011 | Instalar o Deno na imagem (mais peso, caminho oficial do yt-dlp) ou apontar para o Node que já existe com `--js-runtimes node` (leve, menos testado)? | aberta | — |
