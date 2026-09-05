# Plano de execução — versionamento-yt-dlp

> gerado por `onp-spec plano` em 2026-08-31 06:25 — NÃO edite à mão;
> mudou tasks.md ou a config? Regenere: `onp-spec plano versionamento-yt-dlp`

## Resumo — o que vai acontecer

- **6 tarefa(s) pendente(s)**: 6 em 2 faixa(s) paralela(s) + 0 sequencial(is)
- **1 faixa = 1 worktree + 1 branch + 1 janela de contexto limpa** — faixas não compartilham nenhum arquivo entre si
- prefere outra seleção ou uma após a outra? Regenere com `onp-spec plano versionamento-yt-dlp --paralelizar T-xxx,T-yyy` ou `--sequencial`
- tudo acontece na branch de trabalho `spec/versionamento-yt-dlp`; levar para a main é decisão sua

## Faixas e ondas

### Onda 1 — faixa-1 ∥ faixa-2

#### faixa-1 — branch `spec/versionamento-yt-dlp-faixa-1` — worktree `../onp-worktrees/video-saver-pro-versionamento-yt-dlp-faixa-1`

| tarefa | título | modelo | esforço | arquivos |
|---|---|---|---|---|
| T-016 | Ler versão e estado da atualização do yt-dlp | `claude-sonnet-5` | medium | `extractor/ytdlp-info.js`, `extractor/ytdlp-info.test.js` |

#### faixa-2 — branch `spec/versionamento-yt-dlp-faixa-2` — worktree `../onp-worktrees/video-saver-pro-versionamento-yt-dlp-faixa-2`

| tarefa | título | modelo | esforço | arquivos |
|---|---|---|---|---|
| T-017 | Mostrar versão e estado na saúde do serviço | `claude-sonnet-5` | medium | `extractor/server.js` |
| T-018 | Registrar a tentativa de atualização em vez de engolir a falha | `claude-sonnet-5` | medium | `docker/Dockerfile.extractor` |
| T-019 | Ativar um runtime de JavaScript para a extração do YouTube | `claude-sonnet-5` | medium | `docker/Dockerfile.extractor`, `extractor/server.js` |
| T-020 | Fazer os avisos do yt-dlp chegarem ao registro do servidor | `claude-sonnet-5` | medium | `extractor/server.js` |
| T-021 | Permitir fixar e voltar a versão do yt-dlp | `claude-sonnet-5` | medium | `docker/Dockerfile.extractor`, `docker-compose.yml`, `README-docker.md` |

## Gestão de branches e commits

1. branch de trabalho `spec/versionamento-yt-dlp` criada do ponto atual (se ainda não existir)
2. cada faixa nasce dela como branch própria e roda no seu worktree — **1 tarefa = 1 commit** (`T-xxx feature: título`)
3. terminou a onda → merge `--no-ff` de cada faixa de volta, na ordem; conflito interrompe a faixa e pede resolução humana
4. faixa mesclada → worktree removido, branch apagada, tarefa marcada `[concluida]` no tasks.md
5. gate final na branch de trabalho: `onp-spec verify versionamento-yt-dlp` + `onp-spec audit --ci` — **exit 0 ou não está pronto**

## Como executar

### ▶ Execução — Claude Code headless

```bash
bash .spec/features/versionamento-yt-dlp/executar-tarefas.sh
```

Cada faixa roda `claude -p` com **janela de contexto limpa**, no seu worktree, com
`--model` e `--effort` já definidos por tarefa e permissões `acceptEdits`. Os prompts exatos estão
embutidos no script — quer rodar uma faixa na mão, é só copiá-los de lá.
Logs: `../onp-worktrees/video-saver-pro-versionamento-yt-dlp-logs/`.

### 📣 Acompanhamento — tabela + resumo no chat (a cada 1 min)

O script roda em **background**: o agente AVISA o usuário antes de iniciar e,
enquanto roda, posta no chat a cada ~1 minuto a **tabela de andamento** (qual
tarefa está rodando, qual não está, o que concluiu/falhou) junto com o
**resumo geral de andamento** (escrito por IA; sem IA, o motor resume). Ao
final, o usuário recebe o resumo completo da execução. A qualquer momento:

```bash
onp-spec resumo versionamento-yt-dlp --tabela   # a tabela de andamento
onp-spec resumo versionamento-yt-dlp            # o resumo em texto
```

