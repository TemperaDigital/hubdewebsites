# Testes do site do Monte Carlo Residence

Esta pasta não é parte do site. Ela existe para que uma mudança futura não
quebre a página sem ninguém perceber.

## Esta pasta é pública, e tudo bem

A pasta `sites` inteira é servida na internet sem senha, e isto aqui vai
junto. É deliberado: não há segredo nenhum nos testes, e o dono da pasta
prefere o material acessível a escondido — a mesma decisão registrada no
`_LEIA-ME.md` da raiz para a área de cursos.

O que **não** pode entrar aqui é credencial. Chave, token, `.env`, dump de
banco. Em 05/09/2026 apareceram servidos com 200 uma chave SSH privada,
credenciais OAuth do Google e três tokens do GitHub, todos por descuido.
A varredura que a raiz recomenda também vale para cá:

```bash
grep -rniE 'api[_-]?key|secret|token|AIza|sk-|ghp_' . \
  --include='*.js' --include='*.json' --include='*.md'
```

Um detalhe do servidor que vale saber, ainda que não afete esta pasta: o
prefixo `_` que a raiz usa para esconder arquivos **só funciona na raiz**.
A regra é `location ~ ^/_`, e o `^` ancora no começo do endereço — então
`/_LEIA-ME.md` é recusado, mas `/trabalho/qualquer/_coisa` não seria. Se um
dia alguém contar com o underscore para proteger algo em subpasta, vai contar
com o que não existe. O conserto seria trocar a âncora por `(^|/)_`.

## Como rodar

Precisa de Node e do Playwright com o Chromium. O Playwright **não** é
dependência deste repositório — o site é estático de propósito e não tem
`package.json`.

```bash
npm install -g playwright && npx playwright install chromium
cd trabalho/site-cmcr/testes
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
| `busca-sinonimos-e-limites.js` | a tabela de sinônimos e a regra de limite de palavra da busca |
| `tema-preambulo-e-links.js` | o preâmbulo de cada documento, a memória do tema escuro e o `rel` dos links de legislação |

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

Nenhum, hoje: **16 de 16**.

Não foi sempre assim. A primeira auditoria fechou em 11 de 16, e os cinco
defeitos que escapavam eram estes:

| Defeito que passava | Fechado por |
|---|---|
| a tabela de sinônimos quebrada — "cachorro" deixava de achar os artigos sobre animais | `busca-sinonimos-e-limites.js` |
| o limite de palavra removido — "pet" voltava a encontrar "peteca" | `busca-sinonimos-e-limites.js` |
| os links de legislação sem `rel="noopener"` | `tema-preambulo-e-links.js` |
| o tema escuro deixando de ser lembrado entre visitas | `tema-preambulo-e-links.js` |
| o preâmbulo do documento sumindo da página | `tema-preambulo-e-links.js` |

O da busca era o mais incômodo: esse bug já existiu, foi consertado, e nada
impedia que voltasse sem ninguém notar.

**Se aparecer um buraco novo**, marque a mutação com a chave `descoberto` e o
motivo, em `mutacoes.js`. A auditoria trata buraco documentado como dívida
conhecida e não falha por causa dele — mas falha, com código 1, quando
aparece um que ninguém registrou.

### Escrevendo um caso novo

Três coisas que a suíte aprendeu do jeito difícil:

- **Termine com `FIM|executadas|falhas`.** Sem ela o caso é contado como
  quebrado.
- **Não deixe o caso morrer onde deveria reprovar.** Ler o texto de um
  elemento ausente estoura, e um caso que estoura avisa que algo quebrou sem
  dizer o quê. Confira a presença primeiro e reprove com nome.
- **Prove que a asserção enxerga.** Uma asserção que nasce verde pode estar
  medindo a coisa errada. Plante o defeito correspondente em `mutacoes.js` e
  confirme que ela reprova — foi assim que se descobriu uma asserção
  `... ? true : true`, verde desde o dia em que foi escrita.
