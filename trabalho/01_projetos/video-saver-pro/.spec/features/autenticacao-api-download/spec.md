# Spec: Autenticação da rota de download

> feature: autenticacao-api-download
> status: rascunho

## Contexto

As rotas `/api/dl/probe` e `/api/dl/fetch` não pedem nada de quem chama. Quem
alcançar a porta 3005 manda o motor baixar qualquer URL e devolver o conteúdo.
Isso é o risco #3 do CLAUDE.md, que o classifica como "OK para uso só na LAN".

Duas coisas encontradas na leitura do código sobem a gravidade acima de
"cuidado se um dia expor":

1. `CORS_ORIGIN: "*"` no `docker-compose.yml` faz o motor responder a qualquer
   origem. Basta a pessoa visitar um site qualquer enquanto está na mesma rede
   para aquele site conseguir usar o baixador da casa dela como intermediário.
2. Não há limite de quantos downloads simultâneos podem ser disparados. Cada
   pedido `/fetch` cria um processo `yt-dlp` mais um `ffmpeg`. Poucas
   requisições em paralelo já consomem a banda e a CPU do ZimaOS inteiro.

A proteção anti-SSRF de `assertPublicUrl` é boa (bloqueia faixas privadas,
`localhost` e `.local`), mas ela protege a rede interna de ser alvo — não
protege o motor de ser usado por terceiros.

## Histórias

### US-005 — Só quem é de casa usa o baixador

Como dono do servidor, quero que o baixador exija uma senha, para que ninguém
que alcance a porta consiga usá-lo no meu lugar.

#### AC-009 — Pedido sem credencial é recusado

- **Dado** que a proteção por senha está ligada
- **Quando** chega um pedido de análise de link ou de download sem credencial,
  ou com credencial errada
- **Então** o motor recusa com "não autorizado" e não chega a iniciar nenhum
  processo de extração

#### AC-010 — Pedido com a credencial certa funciona igual

- **Dado** que a proteção por senha está ligada e eu entrei com a senha certa
- **Quando** eu analiso um link e baixo um vídeo
- **Então** tudo funciona exatamente como antes

#### AC-011 — Sem senha configurada, o comportamento de hoje é preservado

- **Dado** um servidor sem senha configurada (instalação existente na LAN)
- **Quando** eu uso o baixador
- **Então** ele continua funcionando sem pedir nada, e o registro do servidor
  avisa, no start, que está rodando sem proteção

### US-006 — Não deixar o servidor ser usado por outro site

Como dono do servidor, quero que só a interface do próprio baixador consiga
falar com o motor, para que uma página aberta em outra aba não use meu servidor
por trás.

#### AC-012 — Origem desconhecida não é aceita

- **Dado** um pedido vindo de uma origem que não é a do próprio baixador
- **Quando** o motor responde
- **Então** ele não autoriza aquela origem (o `*` deixa de ser o padrão)

### US-007 — Não deixar o servidor ser afogado

Como dono do servidor, quero um limite de downloads ao mesmo tempo, para que o
ZimaOS não pare por causa de uma enxurrada de pedidos.

#### AC-013 — Passou do limite, entra na fila em vez de derrubar a máquina

- **Dado** que já existe o número máximo de downloads em andamento
- **Quando** chega mais um pedido
- **Então** ele espera a vez ou recebe uma resposta clara em pt-BR de "servidor
  ocupado, tente daqui a pouco" — e o número de processos de extração vivos
  nunca passa do limite

## Fora de escopo

- Múltiplos usuários, cadastro, perfis. É uma senha única de instalação.
- Expor o baixador na internet, HTTPS público, certificados. Esta feature deixa
  o motor pronto para isso, mas não faz a exposição.
- Registro de quem baixou o quê (auditoria).

## Suposições

| ID | Suposição | Status | Resolução |
|---|---|---|---|
| ASM-007 | Uma senha única compartilhada basta — não há necessidade de contas separadas por pessoa da casa | aberta | confirmar com o dono do produto |
| ASM-008 | A verificação pode ficar no Caddy (que já é o único ponto de entrada) em vez de dentro do `server.js`, o que evita mexer no motor | aberta | decidir junto com a pergunta Q-006 |
| ASM-009 | `/health` deve continuar aberto, sem senha, para o Docker conseguir checar o container | aberta | confirmar se algum orquestrador do ZimaOS usa esse endpoint |

## Perguntas em aberto

| ID | Pergunta | Status | Resposta |
|---|---|---|---|
| Q-006 | Onde a senha é conferida: no Caddy (`basic_auth`, resolve em poucas linhas e não toca no motor, mas a janelinha do navegador é feia e não dá para traduzir) ou no `server.js` mais uma tela de entrada em pt-BR na interface (mais trabalho, experiência melhor)? | aberta | — |
| Q-007 | Qual o número máximo de downloads simultâneos que o ZimaOS aguenta? Depende do hardware — precisa de um número do dono do produto ou de uma medição | aberta | — |
| Q-008 | A proteção deve vir ligada por padrão em instalação nova (com senha obrigatória no primeiro start), ou desligada com aviso, para não quebrar quem já usa? | aberta | — |
