# Plano de execução — corrigir-merge-video-audio

> gerado por `onp-spec plano` em 2026-08-31 06:25 — NÃO edite à mão;
> mudou tasks.md ou a config? Regenere: `onp-spec plano corrigir-merge-video-audio`

## Resumo — o que vai acontecer

- **5 tarefa(s) pendente(s)**: 5 em 3 faixa(s) paralela(s) + 0 sequencial(is)
- **1 faixa = 1 worktree + 1 branch + 1 janela de contexto limpa** — faixas não compartilham nenhum arquivo entre si
- prefere outra seleção ou uma após a outra? Regenere com `onp-spec plano corrigir-merge-video-audio --paralelizar T-xxx,T-yyy` ou `--sequencial`
- tudo acontece na branch de trabalho `spec/corrigir-merge-video-audio`; levar para a main é decisão sua

## Faixas e ondas

### Onda 1 — faixa-1 ∥ faixa-2 ∥ faixa-3

#### faixa-1 — branch `spec/corrigir-merge-video-audio-faixa-1` — worktree `../onp-worktrees/video-saver-pro-corrigir-merge-video-audio-faixa-1`

| tarefa | título | modelo | esforço | arquivos |
|---|---|---|---|---|
| T-001 | Detectar o container real de um arquivo pelos bytes de assinatura | `claude-sonnet-5` | medium | `src/lib/container-signature.ts`, `src/lib/container-signature.test.ts` |

#### faixa-2 — branch `spec/corrigir-merge-video-audio-faixa-2` — worktree `../onp-worktrees/video-saver-pro-corrigir-merge-video-audio-faixa-2`

| tarefa | título | modelo | esforço | arquivos |
|---|---|---|---|---|
| T-002 | Provar o defeito com teste de regressão sobre saída real do yt-dlp | `claude-sonnet-5` | medium | `extractor/fetch-args.js`, `extractor/fetch-args.test.js` |

#### faixa-3 — branch `spec/corrigir-merge-video-audio-faixa-3` — worktree `../onp-worktrees/video-saver-pro-corrigir-merge-video-audio-faixa-3`

| tarefa | título | modelo | esforço | arquivos |
|---|---|---|---|---|
| T-003 | Implementar a estratégia de container escolhida | `claude-sonnet-5` | medium | `extractor/server.js` |
| T-004 | Alinhar extensão e Content-Type ao container que sai de fato | `claude-sonnet-5` | medium | `extractor/server.js`, `src/lib/media-format.ts` |
| T-005 | Transformar divergência de container em erro visível | `claude-sonnet-5` | medium | `extractor/server.js` |

## Gestão de branches e commits

1. branch de trabalho `spec/corrigir-merge-video-audio` criada do ponto atual (se ainda não existir)
2. cada faixa nasce dela como branch própria e roda no seu worktree — **1 tarefa = 1 commit** (`T-xxx feature: título`)
3. terminou a onda → merge `--no-ff` de cada faixa de volta, na ordem; conflito interrompe a faixa e pede resolução humana
4. faixa mesclada → worktree removido, branch apagada, tarefa marcada `[concluida]` no tasks.md
5. gate final na branch de trabalho: `onp-spec verify corrigir-merge-video-audio` + `onp-spec audit --ci` — **exit 0 ou não está pronto**

## Como executar

### ▶ Execução — Claude Code headless

```bash
bash .spec/features/corrigir-merge-video-audio/executar-tarefas.sh
```

Cada faixa roda `claude -p` com **janela de contexto limpa**, no seu worktree, com
`--model` e `--effort` já definidos por tarefa e permissões `acceptEdits`. Os prompts exatos estão
embutidos no script — quer rodar uma faixa na mão, é só copiá-los de lá.
Logs: `../onp-worktrees/video-saver-pro-corrigir-merge-video-audio-logs/`.

### 📣 Acompanhamento — tabela + resumo no chat (a cada 1 min)

O script roda em **background**: o agente AVISA o usuário antes de iniciar e,
enquanto roda, posta no chat a cada ~1 minuto a **tabela de andamento** (qual
tarefa está rodando, qual não está, o que concluiu/falhou) junto com o
**resumo geral de andamento** (escrito por IA; sem IA, o motor resume). Ao
final, o usuário recebe o resumo completo da execução. A qualquer momento:

```bash
onp-spec resumo corrigir-merge-video-audio --tabela   # a tabela de andamento
onp-spec resumo corrigir-merge-video-audio            # o resumo em texto
```

