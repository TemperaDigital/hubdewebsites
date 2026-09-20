# Base de Conhecimento — Condomínio Monte Carlo Residence

Página de consulta às normas do condomínio: **Regimento Interno**, **Convenção**,
**Manual do Proprietário** e **legislação condominial**, com busca por tema.

## O que ela faz

- **Busca por tema.** O morador digita uma palavra e recebe os artigos que tratam do
  assunto, cada um identificado pelo capítulo a que pertence. A busca ignora acentos e
  maiúsculas e entende sinônimos: *cachorro* encontra *animais*, *barulho* encontra
  *ruído* e *sossego*, *festa* encontra *salão* e *churrasqueira*.
- **Resultados separados em dois grupos**: os artigos que citam o termo digitado e os que
  aparecem apenas por termo próximo. Assim ninguém confunde uma menção direta com uma
  aproximação da busca.
- **Busca cruzada entre os documentos.** A aba escolhe onde procurar, como pedido, mas se o
  outro documento normativo também tratar do assunto, aparece um aviso com a contagem e um
  atalho que troca de documento mantendo o termo digitado.
- **Índice por capítulo**, em blocos que abrem e fecham.
- **Temas frequentes** em atalhos (garagem, piscina, multas, obras, animais…),
  atribuídos automaticamente a partir do vocabulário de cada artigo.
- **Legislação** com links para os textos oficiais no portal do Planalto, começando pelo
  Código Civil, Arts. 1.331 a 1.358 (Do Condomínio Edilício).
- Funciona em celular, tem tema claro e escuro, e imprime em formato legível.

## Como rodar

Não há build nem dependências. É HTML, CSS e JavaScript sem framework.

```bash
# a partir desta pasta
python3 -m http.server 8000
# abra http://localhost:8000
```

Os dados são arquivos `.js` (e não `.json`) justamente para que a página também funcione
ao ser aberta direto do disco, sem servidor.

## Estrutura

```
base-conhecimento/
├── index.html
├── assets/
│   ├── estilo.css
│   └── app.js            # busca, sinônimos, índice e renderização
├── dados/
│   ├── regimento.js      # 88 artigos, 12 capítulos, 2 apêndices, tabela de horários
│   ├── convencao.js      # 67 artigos, 13 capítulos
│   ├── manual.js         # 35 seções, 10 partes, quadros de garantias e materiais
│   ├── legislacao.js     # links oficiais comentados
│   └── temas.js          # temas e dicionário de sinônimos
├── REVISAO-OCR.md        # como o texto foi conferido e o que diverge no original
└── README.md
```

## Estado do conteúdo

| Documento | Situação |
|---|---|
| Regimento Interno | **Completo e conferido.** Os 88 artigos foram lidos por dois motores de OCR independentes e conferidos na imagem nos pontos divergentes — ver `REVISAO-OCR.md`. |
| Convenção | **Completa: 67 artigos em 13 capítulos**, conferidos por dois motores de OCR. Os quadros dos Arts. 4º e 6º foram lidos na imagem. |
| Manual do Proprietário | **35 seções em 10 partes.** Não é norma: é o manual de uso e manutenção da Construtora. Os quadros de garantias e de especificações de materiais foram conferidos nas imagens. As listas de contato de terceiros não são publicadas. |
| Legislação | 17 links oficiais, conferidos. |

O Regimento reproduz o documento registrado **inclusive onde o próprio original tem erro de
digitação**. Esses pontos ficam listados na página, no aviso do topo, para que ninguém os
confunda com falha de leitura.

## Como atualizar

- **Corrigir um artigo:** edite `dados/regimento.js`, no campo `blocos` do artigo.
- **Novo sinônimo de busca:** acrescente a entrada em `DADOS_SINONIMOS`, em `dados/temas.js`.
  A chave deve estar em minúsculas e sem acentos; os valores podem ter acento.
- **Novo tema:** acrescente em `DADOS_TEMAS` e inclua o `id` nas `tags` dos artigos pertinentes.
- **Nova lei:** acrescente em `dados/legislacao.js`.

## Dados de terceiros

A base não publica nomes, telefones nem e-mails de pessoas de fora do condomínio. As listas
de contato das Seções 8, 9 e 10 do Manual ficaram de fora por decisão do condomínio; o que
permaneceu da Seção 10 é a especificação dos materiais, que diz respeito ao imóvel.

Ao acrescentar conteúdo novo, vale a mesma régua. Para conferir:

```bash
grep -ohE '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}' dados/*.js   # deve sair vazio
grep -ohE '\(?[0-9]{2}\)? ?[0-9]{4,5}-[0-9]{4}' dados/*.js             # deve sair vazio
```

## Aviso

Material de consulta. Em caso de divergência prevalecem os textos registrados em cartório e
a legislação vigente.
