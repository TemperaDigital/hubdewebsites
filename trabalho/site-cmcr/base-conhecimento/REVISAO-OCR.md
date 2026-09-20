# Conferência do Regimento Interno

**Situação: concluída.** Os 88 artigos estão publicados e conferidos.

O texto foi extraído do PDF escaneado `Regimento_Interno_-_Pesquisável.pdf` (25 páginas,
registro de 12/11/2018) por **dois motores de OCR independentes**:

1. a camada de texto já embutida no PDF;
2. uma segunda leitura feita com `tesseract` em português, sobre as páginas rasterizadas
   a 300 dpi com `pdftoppm`.

Onde as duas leituras concordaram, o texto foi aceito. Onde discordaram, a passagem foi
**conferida na imagem da página**. É o mesmo princípio de conferir um valor lançado duas
vezes por pessoas diferentes: o que importa não é cada leitura isolada, mas o ponto em que
elas divergem.

---

## 1. Pendências encerradas

| # | Item | Como foi resolvido |
|---|---|---|
| 1 | **Art. 72º ausente** | Recuperado pela segunda leitura. A camada de OCR original perdera o artigo na quebra entre as páginas 18 e 19. Texto: *"Os últimos usuários que utilizarem a Academia em horário noturno deverão desligar as lâmpadas ao sair."* |
| 2 | **Tabela de horários (Art. 2º, XVI)** | Lida diretamente na imagem da página 5. Itens **1 a 6** confirmados (1 Salão de Festas, 2 Espaço Gourmet, 3 Brinquedoteca, 4 Piscina, 5 Academia, 6 Mudanças e Reformas). O horário de sábado para mudanças é **09h às 12h** — a reconstrução anterior supunha 08h. |
| 3 | **Numeração do Capítulo XII** | A segunda leitura traz **XII – Disposições Finais**, igual ao sumário. O "XI" repetido era erro da primeira leitura, não do documento. |
| 4 | **Art. 15º** | Confirmado pela segunda leitura. O "Art. 18º" lido antes era erro de OCR; o Art. 18º verdadeiro trata do uso moderado dos elevadores. |
| 5 | **Art. 58º** | Confirmado pela segunda leitura, entre o 57º e o 59º. |
| 6 | **Art. 9º** | Conferido na imagem. Os dois motores leram o "9" em negrito como "$". |
| 7 | **Apêndice A** | Marcadores confirmados como **B1 a B6**. As leituras "Ba" e "Bs" correspondem a B4 e B5. |
| 8 | **Alíneas fora de sequência** | Conferido na imagem do Art. 51º: é **"c)"**. Os dois motores leem o "c" em negrito como "e". A mesma correção vale para o Art. 7º §3º, o Art. 12º XIV, o Art. 59º §5º e o Art. 77º §7º. No Art. 77º §1º, a alínea lida como "£)" é **"f)"**. |
| 9 | **"cães guias"** | A segunda leitura confirma a grafia do original, sem hífen. A forma "cães-guia" havia sido introduzida por engano e foi revertida. |

---

## 2. Divergências do próprio documento — preservadas

Durante a conferência, cinco trechos revelaram-se **erros do documento registrado**, e não
de leitura. Eles foram restaurados à redação original: numa base de consulta jurídica, o
texto tem de reproduzir o que está escrito, não o que deveria estar.

A página lista essas passagens em "Ver os pontos em que o original diverge da norma culta",
no topo do Regimento.

| Onde | Como está no original | Leitura provável |
|---|---|---|
| Art. 7º, §2º | "deverão aguardar na **inclusa**" | eclusa |
| Art. 7º, §4º | "o apartamento ou **pares** relativas a ele" | partes |
| Art. 12º, XIV, "c" | "nas áreas **da no** mezanino" | no mezanino |
| Art. 50º, §2º | "poderá **sofre** penalidade" | sofrer |
| Art. 77º, §7º, "b" | "que receber o **artefato**" | o recurso |
| Art. 77º, §10º | "A infração não **vencerá**" | não decairá |
| Art. 2º, XVI (tabela) | "a partir das 22h, o som ambiente (Sudema)" | frase sem verbo |

Um caso quase virou o sexto: no preâmbulo, as duas leituras registraram *"fém por
finalidade"*. Na imagem, vê-se que o "t" de **"tem"** está encoberto por uma **anotação a
caneta** feita sobre o documento escaneado. A grafia correta foi mantida.

---

## 3. Correções de OCR aplicadas

Todas verificadas contra a segunda leitura antes de entrar na base:

- **Símbolo de parágrafo.** O `§` era lido como `8`, `$`, `&` ou `B`. Restaurado.
- **Carimbo do cartório.** O selo do Serviço Notarial aparecia em quase toda página em
  dezenas de leituras deformadas. A remoção é feita por proporção de lixo na linha, e não
  por lista de palavras — uma primeira tentativa baseada em tokens havia apagado o Art. 30º
  inteiro, porque `particul`**`ares d`**`os` casava com o token `ARES `.
- **Numerais romanos dos incisos.** `H-` → `II -`, `HI -` → `III -`, `INI` → `III`, `AX:` → `IX`.
  A numeração dos incisos do Art. 2º e do Art. 12º foi confirmada pela segunda leitura
  (XXI e XXII estavam trocados).
- **Palavras.** 25 substituições confirmadas pelas duas leituras, entre elas
  `pessozs`→`pessoas`, `balls`→`halls`, `mammitas`→`marmitas`, `Intemo`→`Interno`,
  `colstado`→`coletado`, `corresivas`→`corrosivas`, `tranguilidade`→`tranquilidade`,
  `raíeio`→`rateio`, `confitmando`→`confirmando`, `Testas`→`festas`.
- **Fração.** `*4 (três quartos)` no Art. 78º foi normalizado para `3/4 (três quartos)`;
  o original traz o glifo `¾`, que ambos os motores desmontam.

---

## 4. Convenção de Condomínio

**Situação: publicada, com duas lacunas de escaneamento.**

O documento recebido é a *Escritura Particular de Convenção do Condomínio Monte Carlo
Residence*, de junho de 2018, num PDF de 27 páginas (a Convenção começa na página 7; as
seis primeiras trazem a capa e a rerratificação da declaração de garagem).

O arquivo tinha camada de OCR, mas fraca — perdia artigos inteiros e só reconhecia 3 dos 13
capítulos. Foi feita a mesma segunda leitura com `tesseract` a 300 dpi, e é ela que
sustenta o texto publicado. Resultado: **60 artigos em 13 capítulos, sem falhas na
sequência**.

O resumo em Word recebido antes estava errado em dois pontos que agora se pode corrigir:

- A numeração dos capítulos estava deslocada a partir do IV. O que o resumo chamava de
  Capítulo V (Da Administração) é o **IV**; a Assembleia Geral é o **V**, e não o VI.
- O capítulo ausente no resumo é o **IX — Rateio das Contribuições para Despesas**
  (Arts. 42º a 46º), agora publicado.

Em compensação, dois palpites meus se revelaram errados: os Capítulos **XI — Das
Finalidades** e **XII — Dos Recursos** têm mesmo esses títulos no original, embora tratem
de multas e de seguros. Ficam como estão.

### O que falta

| Lacuna | Detalhe |
|---|---|
| **Arts. 61º a 67º** | O PDF termina no Art. 60º. Faltam os sete artigos finais e a página de assinaturas e data. Pelo resumo, tratam de alienação e locação (61º), exercício financeiro (62º), modificação da convenção por 2/3 (63º), responsabilidade do condomínio e fiscalização pelo porteiro (64º), foro (65º), casos omissos pela Lei 4.591/1964 (66º) e registro em cartório (67º). **É preciso digitalizar as folhas finais.** |
| **Tabelas dos Arts. 4º e 6º** | Trazem as áreas das 76 unidades autônomas e a distribuição das 79 vagas de garagem. São quadros, e o OCR não preservou linhas e colunas. O texto corrido desses artigos está legível; os quadros, não. A página avisa isso no próprio artigo. |

### Limpeza aplicada

Além da estruturação em capítulos, artigos, parágrafos e alíneas, foram removidas **13
rubricas do tabelião** que o OCR capturou no meio de frases (`AÓ`, `Mú`, `Ri)`, `Dri`, `&`
e semelhantes). São marcas de margem do documento físico, não texto normativo.

A Convenção continua marcada como **em revisão**: ao contrário do Regimento, ainda não
houve a conferência página a página na imagem.

---

## 5. Manual do Proprietário

**Situação: publicado, em revisão.**

O *Manual de Uso e Manutenção* entregue pela B&C Construções, em PDF de 22 páginas sem
camada de texto. Lido com `tesseract` a 300 dpi. Resultado: **35 seções em 10 partes**.

O Manual **não é norma do condomínio** — a página avisa isso no topo. Quem estabelece regras
de convivência e penalidades são a Convenção e o Regimento. O Manual vale pelos prazos de
garantia, pelos cuidados de manutenção de cada sistema e pelo caminho da assistência técnica.

### Cabeçalhos que o OCR destruiu

Três títulos de seção saíram irreconhecíveis e foram restaurados pela posição e pelo
sumário da página 2:

| Como o OCR leu | O que é |
|---|---|
| `5.7.VIDROS` (sem espaço) | 5.7. Vidros |
| `74 INFORMAÇÕES AO SÍNDICO` | 7.1. Informações ao Síndico |
| `Tola PISCINA` | 7.7. Piscina |

Também foi preciso separar os **passos numerados da Seção 6.2** ("1. Preencha a ficha…",
"2. No recebimento do seu pedido…"), que o parser lia como se fossem seções de primeiro
nível. A regra passou a exigir numeração estritamente crescente para seções de topo.

### Quadro de garantias

A tabela da Seção 6.1 é o item mais consultado do Manual e saiu destruída pelo OCR: restaram
só os prazos, sem os itens a que se referem. Foi **conferida nas imagens das páginas 14 e 15**
e reconstruída com os 18 itens, de 3 anos (impermeabilizações e revestimentos de fachada) a
"defeito aparente" (vistorias de entrega). O texto embaralhado foi removido, já que a tabela
o substitui integralmente.

### Seções 8, 9 e 10

São tabelas de contatos — autores dos projetos, fornecedores e serviços, e a relação de
materiais. O OCR não preservou as colunas, então as três foram **conferidas diretamente nas
imagens das páginas 20, 21 e 22** e transcritas: 7 projetos, 8 serviços e 16 materiais.

O quadro de materiais é o mais útil no dia a dia: a coluna de modelo e referência permite
repor peça igual numa reforma — o porcelanato, a fechadura, a tinta — mesmo que o
fornecedor tenha mudado de mãos.

As três carregam aviso de que **os dados são de 2018**; confirme antes de acionar qualquer
fornecedor. Como envolvem nomes, telefones e e-mails de terceiros, podem ser removidas a
qualquer momento se o condomínio preferir não publicá-las.
