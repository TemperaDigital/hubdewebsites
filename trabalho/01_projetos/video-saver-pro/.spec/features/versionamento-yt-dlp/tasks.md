# Tasks: Versionamento e saúde do yt-dlp

> feature: versionamento-yt-dlp

## T-016 — Ler versão e estado da atualização do yt-dlp [pendente]

- Refs: US-008, AC-014, AC-015
- Arquivos: extractor/ytdlp-info.js, extractor/ytdlp-info.test.js
- Notas: módulo que interpreta a saída de `yt-dlp --version` e o resultado da tentativa de atualização, devolvendo versão, data e se a última tentativa deu certo. Interpretação pura (recebe texto, devolve objeto) para poder ser testada sem executar nada.

## T-017 — Mostrar versão e estado na saúde do serviço [pendente]

- Refs: US-008, AC-014, AC-015
- Arquivos: extractor/server.js
- Notas: `/health` passa a devolver a versão ativa, a data da última atualização bem-sucedida, o estado da última tentativa e o runtime de JavaScript em uso. Depende de T-016 e de T-019 (para o campo do runtime). A pergunta Q-010 decide se fica atrás de senha.

## T-018 — Registrar a tentativa de atualização em vez de engolir a falha [pendente]

- Refs: US-008, AC-015
- Arquivos: docker/Dockerfile.extractor
- Notas: o `yt-dlp -U >/dev/null 2>&1 || true` do CMD passa a gravar saída e código em um arquivo de estado que T-016 lê. O `|| true` continua (o serviço não pode deixar de subir por causa disso), mas a falha para de ser invisível.

## T-019 — Ativar um runtime de JavaScript para a extração do YouTube [pendente]

- Refs: US-010, AC-018
- Arquivos: docker/Dockerfile.extractor, extractor/server.js
- Notas: resolve o achado da inspeção — hoje o yt-dlp avisa que não achou runtime de JavaScript e que formatos podem estar faltando. BLOQUEADA pela pergunta Q-011 (Deno na imagem contra `--js-runtimes node`). Medir a lista de formatos antes e depois, para responder a suposição ASM-011. **É o item de maior valor desta feature.**

## T-020 — Fazer os avisos do yt-dlp chegarem ao registro do servidor [pendente]

- Refs: US-010, AC-019
- Arquivos: extractor/server.js
- Notas: tirar `--no-warnings` de `baseArgs()` e passar a registrar as linhas de WARNING do stderr, sem misturá-las com as mensagens de erro que a pessoa vê. **Coordenar com a tarefa T-005 da feature `corrigir-merge-video-audio`, que mexe no mesmo ponto** — as duas não podem rodar em paralelo.

## T-021 — Permitir fixar e voltar a versão do yt-dlp [pendente]

- Refs: US-009, AC-016, AC-017
- Arquivos: docker/Dockerfile.extractor, docker-compose.yml, README-docker.md
- Notas: variável de ambiente com a versão desejada; quando definida, o container baixa exatamente ela e pula o `-U`. Guardar o binário anterior ao lado do novo para o retorno, e documentar o procedimento. Depende da decisão de Q-009.
