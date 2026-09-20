# Testes do site do Monte Carlo Residence

Esta pasta não é parte do site. Ela existe para que uma mudança futura não
quebre a página sem ninguém perceber.

## Por que o nome começa com `_`

A pasta `sites` inteira é pública na internet, e o nginx **não** bloqueia
`.js` nem `.md` — os dois estão listados como "não bloqueados, e isso é
deliberado ou apenas não revisado" no `_LEIA-ME.md` da raiz. Uma pasta
`testes/` aqui dentro iria ao ar junto com o site.

O prefixo `_` é a convenção que a própria raiz documenta para material que
não deve sair no ar.

> **Confira isto antes de confiar:** o `_LEIA-ME.md` da raiz descreve a regra
> como `location ~ ^/_`, que casa apenas com caminhos que começam com `/_` —
> ou seja, só na raiz do site. Se for esse o texto exato do conf, o caminho
> `/trabalho/site-cmcr/_testes/` **não** seria bloqueado. O mesmo documento
> também afirma, em outro trecho, que pastas iniciadas por `_` são recusadas
> em qualquer lugar. Os dois trechos não podem estar certos ao mesmo tempo.
> A fonte de verdade é `/DATA/AppData/compose/sites-nginx.conf`, que não dá
> para ler daqui. Vale conferir com:
>
> ```bash
> curl -s -o /dev/null -w '%{http_code}\n' \
>   https://sites.fguerra.ia.br/trabalho/site-cmcr/_testes/LEIA-ME.md
> ```
>
> `403` ou `404` está certo. `200` significa que a regra é só da raiz e que
> esta pasta está pública — nada aqui é sigiloso, mas também não precisa
> estar no ar.

## Como rodar

Precisa de Node e do Playwright com o Chromium. O Playwright **não** é
dependência deste repositório — o site é estático de propósito e não tem
`package.json`.

```bash
npm install -g playwright && npx playwright install chromium
cd trabalho/site-cmcr/_testes
node rodar.js
```

A suíte sobe o próprio servidor numa porta escolhida pelo sistema e o derruba
no fim. Não é preciso deixar nada ligado antes.

Para rodar só uma parte, passe um pedaço do nome:

```bash
node rodar.js regimento          # só os casos do Regimento
node rodar.js convencao tabelas  # os que casarem com qualquer um dos dois
```

Sai com código **1** se alguma asserção falhar **ou** se algum arquivo não
completar. É esse número que serve para um hook ou uma ação do GitHub.

## Os casos

| Arquivo | O que trava |
|---|---|
| `regimento.js` | aviso de texto conferido, a lista dos 8 erros do próprio original, o Art. 72º que o OCR tinha perdido na quebra de página, o horário de sábado |
| `convencao-e-troca-de-aba.js` | cabeçalho e 13 capítulos da Convenção, o aviso cruzado entre documentos e a troca de aba preservando o termo buscado |
| `manual-e-abas.js` | as 4 abas, o aviso de que o Manual não é norma, o quadro de garantias e a busca dentro dele |
| `convencao-tabelas.js` | os quadros de áreas e de vagas, a rolagem do quadro longo, a busca por número de unidade |
| `manual-materiais-e-privacidade.js` | o quadro de materiais **sem telefone e sem e-mail** — é o caso que guarda a decisão de não publicar contato de terceiros |
| `convencao-artigos-finais.js` | os Arts. 61º a 67º e o fecho com assinatura, recuperados das imagens das páginas finais |
| `tabelas-apresentacao-e-filtro.js` | a coluna ITEM, o zebrado por grupo, o filtro, e o empilhamento em cartões no celular |
| `busca-em-apendices.js` | os apêndices aparecem na busca — antes ficavam de fora do índice |
| `pagina-inicial.js` | a página de apresentação, incluindo o contraste do cartão da Base calculado na hora |

## O marcador `FIM|executadas|falhas`

Todo caso termina imprimindo essa linha, e o executor trata um arquivo sem
ela como **quebrado**, nunca como aprovado.

A regra existe por um motivo concreto: três arquivos estavam morrendo no meio
da execução e, como um arquivo morto não imprime nenhuma falha, o relatório
dizia "0 falhas". Oito asserções deixaram de rodar e ninguém viu.

**Ao escrever um caso novo, termine sempre com essa linha.** Sem ela, o caso
é contado como quebrado — de propósito.

## A auditoria por mutação

"127 asserções, 0 falhas" não diz se os casos medem alguma coisa. Um teste
pode passar porque o site está certo, ou porque ele não olha para nada.

```bash
node auditoria.js
```

Isso copia o site para uma pasta temporária, planta um defeito de cada vez
(a lista está em `mutacoes.js`) e roda a suíte contra a cópia. Se a suíte
continuar verde, aquele defeito passa despercebido — e está descoberto.

A árvore de trabalho nunca é mutada, então uma interrupção no meio não deixa
defeito plantado no repositório.

Duas regras que a auditoria carrega:

- **Crash conta como detecção.** Um arquivo que morre não imprime falha
  nenhuma; contar só as linhas reprovadas faria um defeito grave demais
  aparecer como "não detectado".
- **Há uma rodada de controle antes de tudo.** Se a suíte não estiver verde
  no estado íntegro, a auditoria aborta em vez de imprimir números que não
  significam nada.

### Buracos conhecidos

As mutações marcadas com `descoberto` em `mutacoes.js` são defeitos que a
suíte **não** pega hoje. Elas ficam na lista de propósito, como lista de
trabalho pendente. A auditoria só falha quando aparece um buraco **novo** —
um que não estava documentado.

O mais incômodo deles: desligar a regra de limite de palavra na busca, que
faz "pet" voltar a encontrar "peteca". Esse bug já existiu e foi consertado;
nada impede que volte.
