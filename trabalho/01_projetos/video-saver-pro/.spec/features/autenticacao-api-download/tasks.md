# Tasks: Autenticação da rota de download

> feature: autenticacao-api-download

## T-010 — Conferir credencial em tempo constante [pendente]

- Refs: US-005, AC-009, AC-010, AC-011
- Arquivos: extractor/auth.js, extractor/auth.test.js
- Notas: função pura que recebe o cabeçalho da requisição e a senha configurada e devolve autorizado / não autorizado / proteção desligada. Comparação em tempo constante (`timingSafeEqual`), sem vazar a senha na mensagem de erro. Sem senha configurada, devolve "desligada" — é o que preserva o comportamento de hoje (AC-011).

## T-011 — Ligar a verificação nas rotas do motor [pendente]

- Refs: US-005, AC-009, AC-010, AC-011
- Arquivos: extractor/server.js
- Notas: aplicar a função de T-010 em `/probe` e `/fetch` antes de qualquer `spawn` — a recusa tem que acontecer antes de nascer processo. `/health` fica aberto (suposição ASM-009). Aviso no log do start quando estiver sem senha. Depende de T-010 e da pergunta Q-006 (se a resposta for "no Caddy", esta tarefa vira configuração do proxy).

## T-012 — Fechar o CORS aberto [pendente]

- Refs: US-006, AC-012
- Arquivos: extractor/server.js, docker-compose.yml
- Notas: `CORS_ORIGIN` deixa de ter `*` como padrão; passa a valer a origem do próprio baixador, com lista explícita para quem precisar de mais. Combina com T-011 no mesmo arquivo, então rodam na mesma faixa.

## T-013 — Limitar downloads simultâneos [pendente]

- Refs: US-007, AC-013
- Arquivos: extractor/concurrency.js, extractor/concurrency.test.js
- Notas: contador com fila, testável sem rede: N em andamento, o de número N+1 espera ou recebe recusa. BLOQUEADA pela pergunta Q-007 (qual é o N). Arquivo novo, não conflita com T-011 nem T-012.

## T-014 — Aplicar o limite na rota de download [pendente]

- Refs: US-007, AC-013
- Arquivos: extractor/server.js
- Notas: usar o controle de T-013 em `handleFetch`, liberando a vaga tanto no fim normal quanto quando a pessoa cancela (o `req.on("close")` que já existe). Mensagem de servidor ocupado em pt-BR. Depende de T-013; mesmo arquivo de T-011 e T-012.

## T-015 — Atualizar a documentação de instalação [pendente]

- Refs: US-005, AC-011
- Arquivos: README-docker.md, docker-compose.yml
- Notas: como definir a senha, o que acontece sem ela, e o novo limite de simultâneos. Depende da decisão de Q-008.
