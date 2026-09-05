# Plano de execução — autenticacao-api-download

> gerado por `onp-spec plano` em 2026-08-31 06:25 — NÃO edite à mão;
> mudou tasks.md ou a config? Regenere: `onp-spec plano autenticacao-api-download`

## Resumo — o que vai acontecer

- **6 tarefa(s) pendente(s)**: 6 em 3 faixa(s) paralela(s) + 0 sequencial(is)
- **1 faixa = 1 worktree + 1 branch + 1 janela de contexto limpa** — faixas não compartilham nenhum arquivo entre si
- prefere outra seleção ou uma após a outra? Regenere com `onp-spec plano autenticacao-api-download --paralelizar T-xxx,T-yyy` ou `--sequencial`
- tudo acontece na branch de trabalho `spec/autenticacao-api-download`; levar para a main é decisão sua

## Faixas e ondas

### Onda 1 — faixa-1 ∥ faixa-2 ∥ faixa-3

#### faixa-1 — branch `spec/autenticacao-api-download-faixa-1` — worktree `../onp-worktrees/video-saver-pro-autenticacao-api-download-faixa-1`

| tarefa | título | modelo | esforço | arquivos |
|---|---|---|---|---|
| T-010 | Conferir credencial em tempo constante | `claude-sonnet-5` | medium | `extractor/auth.js`, `extractor/auth.test.js` |

#### faixa-2 — branch `spec/autenticacao-api-download-faixa-2` — worktree `../onp-worktrees/video-saver-pro-autenticacao-api-download-faixa-2`

| tarefa | título | modelo | esforço | arquivos |
|---|---|---|---|---|
| T-011 | Ligar a verificação nas rotas do motor | `claude-sonnet-5` | medium | `extractor/server.js` |
| T-012 | Fechar o CORS aberto | `claude-sonnet-5` | medium | `extractor/server.js`, `docker-compose.yml` |
| T-014 | Aplicar o limite na rota de download | `claude-sonnet-5` | medium | `extractor/server.js` |
| T-015 | Atualizar a documentação de instalação | `claude-sonnet-5` | medium | `README-docker.md`, `docker-compose.yml` |

#### faixa-3 — branch `spec/autenticacao-api-download-faixa-3` — worktree `../onp-worktrees/video-saver-pro-autenticacao-api-download-faixa-3`

| tarefa | título | modelo | esforço | arquivos |
|---|---|---|---|---|
| T-013 | Limitar downloads simultâneos | `claude-sonnet-5` | medium | `extractor/concurrency.js`, `extractor/concurrency.test.js` |

## Gestão de branches e commits

1. branch de trabalho `spec/autenticacao-api-download` criada do ponto atual (se ainda não existir)
2. cada faixa nasce dela como branch própria e roda no seu worktree — **1 tarefa = 1 commit** (`T-xxx feature: título`)
3. terminou a onda → merge `--no-ff` de cada faixa de volta, na ordem; conflito interrompe a faixa e pede resolução humana
4. faixa mesclada → worktree removido, branch apagada, tarefa marcada `[concluida]` no tasks.md
5. gate final na branch de trabalho: `onp-spec verify autenticacao-api-download` + `onp-spec audit --ci` — **exit 0 ou não está pronto**

## Como executar

### ▶ Execução — Claude Code headless

```bash
bash .spec/features/autenticacao-api-download/executar-tarefas.sh
```

Cada faixa roda `claude -p` com **janela de contexto limpa**, no seu worktree, com
`--model` e `--effort` já definidos por tarefa e permissões `acceptEdits`. Os prompts exatos estão
embutidos no script — quer rodar uma faixa na mão, é só copiá-los de lá.
Logs: `../onp-worktrees/video-saver-pro-autenticacao-api-download-logs/`.

### 📣 Acompanhamento — tabela + resumo no chat (a cada 1 min)

O script roda em **background**: o agente AVISA o usuário antes de iniciar e,
enquanto roda, posta no chat a cada ~1 minuto a **tabela de andamento** (qual
tarefa está rodando, qual não está, o que concluiu/falhou) junto com o
**resumo geral de andamento** (escrito por IA; sem IA, o motor resume). Ao
final, o usuário recebe o resumo completo da execução. A qualquer momento:

```bash
onp-spec resumo autenticacao-api-download --tabela   # a tabela de andamento
onp-spec resumo autenticacao-api-download            # o resumo em texto
```

