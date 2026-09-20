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

## 4. Situação da Convenção

Continua **pendente**. O arquivo recebido em Word (`Convenção em Word - Resumo.docx`) é um
resumo com análises e comentários, não a norma, e omite os Arts. 42º a 46º.

O PDF da Convenção registrada está no Google Drive (`Convenção Monte Carlo.pdf`, 23 páginas).
Ele é uma digitalização **sem camada de texto**, então precisa do mesmo tratamento de OCR
aplicado ao Regimento. O que falta é o arquivo chegar ao ambiente de trabalho — o conector
do Drive lê o conteúdo já interpretado, e nesse caso não há nada para interpretar.

Enquanto isso, a aba **Convenção** traz apenas o índice dos capítulos, com aviso explícito.
