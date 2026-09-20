# Passagem de bastão — 20/09/2026

Para a instância que roda dentro do ZimaOS, que assume os trabalhos deste
repositório a partir de hoje.

Escrito pela sessão remota que trabalhou no site do condomínio em 20/09/2026.
A decisão de centralizar tudo numa instância só é do dono do repositório, e
é acertada: **o incidente de hoje aconteceu porque duas sessões mexeram no
mesmo repositório ao mesmo tempo.** Este documento existe para você não
precisar reconstruir o contexto.

> Este arquivo começa com `_` e está na raiz — o único lugar onde a regra
> `location ~ ^/_` do nginx realmente bloqueia. Ver "Cuidados", item 6.

---

## 1. O que foi feito hoje

Seis pull requests, todos mesclados exceto o último.

| PR | O quê |
|---|---|
| #1 | A base de consulta às normas: Convenção, Regimento, Manual e legislação, com busca por tema e sinônimos |
| #2 | Página inicial do condomínio, paleta tirada da fachada, e a suíte de testes entrando no repositório |
| #3 | Logotipo em vinho, com sombra |
| #4 | Pasta de testes renomeada de `_testes` para `testes` |
| #5 | Nome "Normas e Informativos", nova ordem das abas, quarentena dos arquivos zerados |
| #6 | `CLAUDE.md` — **ainda aberto** |

O site vive em `trabalho/site-cmcr/`:

- `index.html` — apresentação do edifício
- `base-conhecimento/` — as Normas e Informativos (o caminho foi mantido ao
  renomear a página, para não quebrar link já compartilhado com morador)
- `testes/` — a suíte, 178 asserções

Os documentos foram transcritos de PDF escaneado por **dupla leitura**: dois
motores de OCR independentes, e nos pontos de divergência a decisão veio da
imagem da página. Isso recuperou o Art. 72º do Regimento, que a camada de
texto do PDF tinha perdido numa quebra de página.

## 2. Estado do repositório, agora

```
main                         8c3fac1   (revert do dd84fab; árvore idêntica ao 37991b9)
claude/monte-carlo-...vdu38a 5e6b54a   (PR #6, aberto — CLAUDE.md)
```

A suíte roda verde no `main`: **178 asserções, 0 falhas**.

Se o PR #6 já tiver sido mesclado quando você ler isto, ignore a linha da
branch.

## 3. Manutenções necessárias — o que ficou pendente de verdade

### 3.1. Os 3.199 arquivos zerados — sem fonte boa conhecida

Em `_arquivos-zerados/`, com a estrutura de origem preservada. São 57% dos
arquivos do repositório: tamanho normal, conteúdo **100% de bytes nulos**.

O que já foi descartado como fonte de recuperação:

- **o git** — os arquivos já entraram zerados no commit inicial (`git show`)
- **a pasta ao vivo `/media/auxiliar/sites`** — conferida byte a byte hoje,
  numa amostra de 50 arquivos: zerada também

**Não apague sem o dono confirmar.** E não presuma nova fonte sem conferir
conteúdo — foi presumir isso que causou o incidente de hoje.

Onde ainda vale procurar, e ninguém procurou: lixeira do Nextcloud, espelho no
Google Drive via rclone, snapshot antigo do ZimaOS.

### 3.2. A causa não foi diagnosticada — pode reincidir

142 MB declarados contra 17 MB ocupados em disco: são **arquivos esparsos**,
cujos blocos de dados nunca chegaram a ser gravados. Assinatura de falha entre
sistema de arquivos e sincronização — não de corrupção de conteúdo.

**Enquanto a causa não for encontrada, o problema volta a acontecer com arquivo
novo.** Vale uma varredura periódica (comando no item 5.1).

### 3.3. A regra do nginx, não confirmada

O `_LEIA-ME.md` da raiz se contradiz sobre o alcance do prefixo `_`. Um trecho
dá a regra como `location ~ ^/_`, que só casa na raiz; outro afirma que vale em
qualquer lugar. A fonte de verdade é
`/DATA/AppData/compose/sites-nginx.conf`, no servidor — **você tem acesso, eu
não tinha.** Vale conferir e corrigir o documento.

Se a regra for mesmo só da raiz, o conserto é trocar a âncora:

```nginx
location ~ (^|/)_ { deny all; }
```

Não pega falso positivo: `relatorio_final.pdf` continua servido, porque ali o
underscore vem depois de letra, não de barra.

### 3.4. As fontes do logotipo se perderam

A pasta "Fonts do Condominio" era uma das 122 que perderam 100% do conteúdo.
Eram AC Honey Bee (Sans e Serif, do designer Will Albin-Clark) e Sogate Script.
Pela aparência, o script "Monte Carlo" é provavelmente a Sogate e o "RESIDENCE"
uma serifada tipo AC Honey Bee — **inferência, não verificação**.

Não faz falta para o site, que usa imagem. Faria falta para compor texto novo
no mesmo estilo: uma placa, um cartaz de assembleia.

---

## 4. Cuidados — o que aprendemos errando, hoje

### 4.1. Tamanho não prova conteúdo

Esta é a lição central do dia, e ela pegou nós dois.

Um arquivo de 42.788 bytes inteiramente preenchido com zeros tem tamanho
"certo" no `ls`, no `stat`, no `[ -s ]` e no `git cat-file -s`. Uma verificação
que compara tamanhos entre origem e destino **passa mesmo quando nada foi
copiado** — foi exatamente o que aconteceu no `dd84fab`.

> Uma verificação que passa quando o defeito está presente não é verificação.

O que distingue: contar os bytes nulos, ou comparar o hash do blob. O git
endereça conteúdo por hash — hash igual significa bytes idênticos, sem margem
para interpretação.

### 4.2. O mesmo erro, em sete outras roupas

No meu dia, a mesma família de erro apareceu sete vezes na suíte de testes:

| a asserção dizia medir | media de fato |
|---|---|
| se as tabelas cabiam no celular | a rolagem da **página**, que era zero |
| uma condição | nada: era `… ? true : true` |
| se a suíte passou | a ausência de linhas de falha — e arquivos morriam antes delas |
| se um arquivo travou | a string `erros:`, enquanto o arquivo imprimia `erros runtime:` |
| se o logotipo tinha resolução de retina | a densidade da tela do teste |
| se a página abria na aba certa | o estado que o próprio teste tinha criado com um clique |
| se não havia texto técnico na página | só o que estava no DOM |

**Quando um teste passar, pergunte o que ele faria se o defeito estivesse
presente.** Se a resposta for "passaria igual", ele não é um teste.

### 4.3. Duas regras do dono que valem mais que preferência técnica

1. **Fidelidade ao texto, liberdade na apresentação.** O texto reproduz o
   documento registrado em cartório, *inclusive onde o próprio documento erra*.
   Não corrija o português do original — cinco "correções" minhas foram
   revertidas por isso. Os oito pontos de divergência estão listados numa nota
   discreta ao fim da página.
2. **Contato de terceiros não se publica.** O Manual traz telefones e e-mails
   de fornecedores; nada disso vai para a página. A referência técnica do
   material fica, porque serve para repor peça igual numa reforma.

### 4.4. A suíte de testes tem regras próprias

```bash
cd trabalho/site-cmcr/testes
node rodar.js              # tudo — 178 asserções
node rodar.js regimento    # só os casos que casam com o nome
node auditoria.js          # auditoria por mutação
```

Precisa de Node e Playwright com Chromium. O executor sobe o próprio servidor
numa porta livre; não é preciso deixar nada ligado. Sai com código 1 se algo
falhar **ou não completar**.

- **Todo caso termina com `FIM|executadas|falhas`.** Arquivo que morre no meio
  não imprime falha nenhuma, e silêncio é indistinguível de sucesso — foi assim
  que oito asserções sumiram enquanto o relatório dizia "zero falhas". Arquivo
  sem o marcador é contado como quebrado, nunca como aprovado.
- **Não deixe o caso morrer onde deveria reprovar.** Ler o texto de um elemento
  ausente estoura, e um caso que estoura avisa que algo quebrou sem dizer o quê.
- **Prove que toda asserção nova enxerga.** Plante o defeito correspondente em
  `mutacoes.js` e confirme que ela reprova. A auditoria hoje fecha em 16/16.
- **Nenhum caso deve depender da aba padrão.** Cada um escolhe a sua. A página
  abre no Manual; mudar isso já quebrou sete arquivos de uma vez.

### 4.5. Cor que muda com o tema

Existe `--accent-contraste` porque três regras usam `--accent` como fundo: no
tema escuro esse fundo fica claro, e `color: #fff` fixo dava **2,10:1**, contra
o mínimo de 4,5:1. **Nunca fixe `#fff` sobre uma cor que troca com o tema.**

A paleta saiu da fachada, medida em foto e corrigida pelo branco das pastilhas
— sem essa correção o céu azul puxava o vinho para o lilás. Nenhum dos tons
medidos alcança 4,5:1, então nenhum carrega texto: o texto usa `#7a3a3d`.

### 4.6. A pasta é pública, e isso é de propósito

Sem senha, sem login. É material que o dono prefere acessível. O que **nunca**
pode entrar é credencial: chave, token, `.env`, dump de banco. Em 05/09/2026
apareceram servidos com HTTP 200 uma chave SSH privada, credenciais OAuth do
Google e três tokens do GitHub.

`.js`, `.md`, `.json` e `.txt` **não** são bloqueados pelo nginx.

---

## 5. Comandos que vale ter à mão

### 5.1. Varredura de arquivos zerados

```bash
python3 -c "
import os
z=[]
for r,d,f in os.walk('.'):
    if '.git' in d: d.remove('.git')
    for a in f:
        p=os.path.join(r,a)
        try:
            n=os.path.getsize(p)
            if n==0: continue
            b=open(p,'rb').read()
        except Exception: continue
        if b.count(bytes([0]))==len(b): z.append(p)
print('100% nulos:', len(z))
for p in z[:20]: print(' ', p)"
```

### 5.2. Varredura de segredos, antes de publicar material novo

```bash
grep -rniE 'api[_-]?key|secret|token|AIza|sk-|ghp_' PASTA_NOVA \
  --include='*.js' --include='*.json' --include='*.md' --include='*.txt'
```

### 5.3. Conferir se dois arquivos são mesmo iguais

```bash
git rev-parse REF1:caminho/do/arquivo
git rev-parse REF2:caminho/do/arquivo
# hash igual = bytes idênticos. Tamanho igual não prova nada.
```

Cuidado: `git show REF:caminho` num caminho **inexistente** devolve saída vazia
sem erro visível — o que parece "0 bytes" e engana. Foi assim que a premissa do
`dd84fab` nasceu errada, e eu caí na mesma armadilha ao investigá-la.

---

## 6. Convenções da casa

- Tudo em português: nomes de arquivo, variáveis, mensagens de commit.
- Mensagem de commit explica **por que**, não só o quê — e registra o erro
  cometido no caminho, quando houve.
- Não há CI neste repositório. A verificação é a suíte, rodada localmente.
- O dono mantém um **Diário de Bordo** em artefato do Claude, com registro
  numerado por dia. A convenção: entrada nova no topo, item novo no índice,
  numeração em sequência, segredos nunca. O registro nº 004 é o dia 20/09.
- Detalhe operacional deste repositório vive no `CLAUDE.md` da raiz, lido
  automaticamente por qualquer sessão. Este documento é o contexto; aquele é
  a regra do dia a dia.

## 7. E o principal

O incidente de hoje não foi falta de competência de ninguém. Foi **duas
sessões trabalhando no mesmo repositório sem saber uma da outra** — uma
publicou uma mudança sobre a decisão que a outra tinha acabado de registrar.

A centralização numa instância só resolve isso na raiz. Se um dia outra
sessão precisar entrar, que seja com combinação explícita de quem mexe em quê.
