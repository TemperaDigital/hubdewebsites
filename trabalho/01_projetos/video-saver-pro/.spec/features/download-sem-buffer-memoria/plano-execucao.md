# Plano de execução — download-sem-buffer-memoria

> gerado por `onp-spec plano` em 2026-08-31 06:25 — NÃO edite à mão;
> mudou tasks.md ou a config? Regenere: `onp-spec plano download-sem-buffer-memoria`

## Resumo — o que vai acontecer

- **4 tarefa(s) pendente(s)**: 4 em 2 faixa(s) paralela(s) + 0 sequencial(is)
- **1 faixa = 1 worktree + 1 branch + 1 janela de contexto limpa** — faixas não compartilham nenhum arquivo entre si
- prefere outra seleção ou uma após a outra? Regenere com `onp-spec plano download-sem-buffer-memoria --paralelizar T-xxx,T-yyy` ou `--sequencial`
- tudo acontece na branch de trabalho `spec/download-sem-buffer-memoria`; levar para a main é decisão sua

## Faixas e ondas

### Onda 1 — faixa-1 ∥ faixa-2

#### faixa-1 — branch `spec/download-sem-buffer-memoria-faixa-1` — worktree `../onp-worktrees/video-saver-pro-download-sem-buffer-memoria-faixa-1`

| tarefa | título | modelo | esforço | arquivos |
|---|---|---|---|---|
| T-006 | Detectar se o navegador consegue gravar direto no disco | `claude-sonnet-5` | medium | `src/lib/file-sink.ts`, `src/lib/file-sink.test.ts` |

#### faixa-2 — branch `spec/download-sem-buffer-memoria-faixa-2` — worktree `../onp-worktrees/video-saver-pro-download-sem-buffer-memoria-faixa-2`

| tarefa | título | modelo | esforço | arquivos |
|---|---|---|---|---|
| T-007 | Separar a leitura do stream da forma de salvar | `claude-sonnet-5` | medium | `src/lib/downloader-client.ts`, `src/lib/downloader-client.test.ts` |
| T-008 | Implementar a gravação direta em disco | `claude-sonnet-5` | medium | `src/lib/downloader-client.ts` |
| T-009 | Avisar em português quando o arquivo não couber na memória | `claude-sonnet-5` | medium | `src/lib/downloader-client.ts`, `src/components/downloader/DownloadBar.tsx` |

## Gestão de branches e commits

1. branch de trabalho `spec/download-sem-buffer-memoria` criada do ponto atual (se ainda não existir)
2. cada faixa nasce dela como branch própria e roda no seu worktree — **1 tarefa = 1 commit** (`T-xxx feature: título`)
3. terminou a onda → merge `--no-ff` de cada faixa de volta, na ordem; conflito interrompe a faixa e pede resolução humana
4. faixa mesclada → worktree removido, branch apagada, tarefa marcada `[concluida]` no tasks.md
5. gate final na branch de trabalho: `onp-spec verify download-sem-buffer-memoria` + `onp-spec audit --ci` — **exit 0 ou não está pronto**

## Como executar

### ▶ Execução — Claude Code headless

```bash
bash .spec/features/download-sem-buffer-memoria/executar-tarefas.sh
```

Cada faixa roda `claude -p` com **janela de contexto limpa**, no seu worktree, com
`--model` e `--effort` já definidos por tarefa e permissões `acceptEdits`. Os prompts exatos estão
embutidos no script — quer rodar uma faixa na mão, é só copiá-los de lá.
Logs: `../onp-worktrees/video-saver-pro-download-sem-buffer-memoria-logs/`.

### 📣 Acompanhamento — tabela + resumo no chat (a cada 1 min)

O script roda em **background**: o agente AVISA o usuário antes de iniciar e,
enquanto roda, posta no chat a cada ~1 minuto a **tabela de andamento** (qual
tarefa está rodando, qual não está, o que concluiu/falhou) junto com o
**resumo geral de andamento** (escrito por IA; sem IA, o motor resume). Ao
final, o usuário recebe o resumo completo da execução. A qualquer momento:

```bash
onp-spec resumo download-sem-buffer-memoria --tabela   # a tabela de andamento
onp-spec resumo download-sem-buffer-memoria            # o resumo em texto
```

