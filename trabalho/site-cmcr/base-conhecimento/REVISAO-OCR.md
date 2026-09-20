# Lista de conferência do Regimento Interno

O texto publicado nesta base foi extraído por **reconhecimento óptico de caracteres (OCR)**
do PDF escaneado `Regimento_Interno_-_Pesquisável.pdf` (25 páginas, registro de 12/11/2018).

O OCR acertou a maior parte do texto, mas erra de forma previsível — como uma fotocópia
velha em que certas letras sempre borram do mesmo jeito. Este arquivo lista **o que foi
corrigido automaticamente** e, principalmente, **o que ainda precisa de olho humano**
sobre o documento registrado em cartório.

> Enquanto esta lista não for fechada, o aviso de "texto em revisão" deve permanecer na página.

---

## 1. Pendências — exigem conferência no documento original

| # | Onde | O que verificar |
|---|---|---|
| 1 | **Art. 72º** | **Não foi recuperado.** O texto se perdeu na quebra entre as páginas 18 e 19 do PDF. O único fragmento legível é *"…desligar as lâmpadas ao sair."*, no topo da página 19. Pelo contexto, encerra o Capítulo IX (Da Academia). **É preciso transcrever o artigo inteiro do original.** |
| 2 | **Art. 2º, inciso XVI** — tabela de horários | O original é uma tabela escaneada; o OCR achatou linhas e colunas numa única sequência. A tabela foi reconstruída em `dados/regimento.js` (campo `tabelas`). Os **horários** foram lidos com clareza. Falta confirmar: a **numeração dos itens** (o OCR mostra "3" antes do Espaço Gourmet e nenhum número na Brinquedoteca) e o **horário de sábado** para mudanças e reformas, lido como "08h (?) às 12h". |
| 3 | **Numeração do Capítulo XII** | O corpo do documento traz "CAPÍTULO XI – DISPOSIÇÕES FINAIS", repetindo o número do capítulo anterior (Das Penalidades). O sumário da página 2 diz **XII**. A base adota **XII**. Confirmar se o erro está no documento original ou na leitura. |
| 4 | **Art. 15º** | O OCR leu "Art. 18º", número que já pertence a outro artigo do mesmo capítulo. Foi renumerado para **15º** pela posição na sequência. Confirmar. |
| 5 | **Art. 58º** | O OCR leu "Art. 88º", número que já pertence às Disposições Finais. Foi renumerado para **58º** pela posição (entre o 57º e o 59º). Confirmar. |
| 6 | **Art. 9º** | O OCR leu "Art. $º". Corrigido para **9º** pela posição. Confirmar. |
| 7 | **Apêndice A** | Os marcadores dos itens saíram como "Bi.", "Ba.", "Ba.", "Bs." — dois itens diferentes foram lidos como "Ba.". A numeração **B1 a B6** precisa ser conferida item a item. |
| 8 | **Alíneas fora de sequência** | O OCR leu `c)` como `e)` e `f)` como `£)` em várias listas. Foram corrigidas por posição no Art. 7º §3º, no Art. 12º inciso XIV, no Art. 51º, no Art. 59º §5º e no Art. 77º (§1º e §7º). Conferir a sequência completa das alíneas nesses artigos. |
| 9 | **Art. 12º, inciso XIV, alínea "c"** | Lido como *"salvo cães guies"*, normalizado para **"cães-guia"**. Conferir a grafia do original. |

---

## 2. Correções automáticas já aplicadas

Foram tratadas por regra, sem julgamento caso a caso:

- **Símbolo de parágrafo.** O `§` foi lido como `8`, `$`, `&` ou `B`. Todas as ocorrências no
  padrão `8Nº:` foram restauradas para `§Nº:`.
- **Carimbo do cartório.** O selo do Serviço Notarial (`"RTDIPS TEL. 3241-7177 JOÃO PESSOA
  PARAÍBA"` e suas dezenas de leituras deformadas) aparecia em quase toda página e foi
  removido por proporção de lixo na linha, e não por lista de palavras — justamente para não
  apagar texto real como *"de serviço"* ou *"particulares dos"*.
- **Numerais romanos dos incisos.** `H-` → `II -`, `HI -` → `III -`, `INI` → `III`, `AX:` → `IX`.
- **Referências a artigos.** `Art,` → `Art.`; espaçamento normalizado.
- **Palavras trocadas** (lista completa): `fém por fin lidade`→`tem por finalidade`,
  `pessozs`→`pessoas`, `balls`→`halls`, `mammitas`→`marmitas`, `Intemo`→`Interno`,
  `extemos`→`externos`, `coniratos`→`contratos`, `colstado`→`coletado`, `corresivas`→`corrosivas`,
  `rmúsica`→`música`, `tranguilidade`→`tranquilidade`, `raíeio`→`rateio`, `reguisitante`→`requisitante`,
  `confitmando`→`confirmando`, `mêsmo`→`mesmo`, `seús`→`seus`, `Testas`→`festas`,
  `livro ds protocolo`→`livro de protocolo`, `vu nome`→`o nome`, `na inclusa`→`na eclusa`,
  `por paríie do`→`por parte do`, `subordinados apenas 20 Síndico`→`ao Síndico`,
  `2 Comissão julgue`→`a Comissão julgue`, `*4 (três quartos)`→`3/4 (três quartos)`,
  `que receber o artefato`→`que receber o recurso`, `A infração não vencerá`→`A infração não decairá`,
  e acentuação de `edifício`, `Condomínio`, `veículos`, `dívida`, `índice`, `líquido`, `civil`.
- **Caractere `€` e `<`** usados no lugar de `e` foram substituídos.

---

## 3. Como conferir

1. Abra o PDF original lado a lado com a página da base de conhecimento.
2. Trabalhe capítulo por capítulo, usando o índice da página.
3. Ao encontrar uma divergência, corrija em `dados/regimento.js` — o texto de cada artigo
   fica no campo `blocos` (`caput`, `rotulo` do parágrafo e `itens` dos incisos).
4. Risque o item correspondente nesta lista.
5. Quando as 9 pendências estiverem fechadas, troque em `dados/regimento.js`
   o campo `"confiabilidade": "revisao_pendente"` por `"conferido"` e remova o bloco de
   aviso em `assets/app.js` (função `viewRegimento`).

---

## 4. Situação da Convenção

O arquivo recebido (`Convenção em Word - Resumo.docx`) **não é a Convenção**: é um resumo
com análises e comentários misturados ao texto normativo, e com trechos ausentes
(os Arts. 42º a 46º e o título do respectivo capítulo não aparecem).

Publicar um resumo como se fosse a norma criaria um risco real: um morador poderia
contestar uma multa citando esta página, e a página estaria errada. Por isso a aba
**Convenção** traz por ora **apenas o índice**, com aviso explícito.

**O que falta:** o PDF ou digitalização da **Convenção registrada em cartório**
(assinada e registrada, conforme o Art. 67º). Com ela em mãos, o texto entra na base
pelo mesmo processo usado no Regimento.
