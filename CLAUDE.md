# hubdewebsites — o que uma sessão nova precisa saber

> **Está retomando os trabalhos?** Leia antes o `_PASSAGEM-DE-BASTAO.md` da
> raiz: ele tem o contexto do que foi feito, o que ficou pendente e por que.
> Este arquivo é a regra do dia a dia; aquele é a história.

Este repositório é a pasta `sites` servida em **https://sites.fguerra.ia.br**
pelo nginx do servidor pessoal (192.168.1.153, ZimaOS). Cada subpasta é um
site independente com seu próprio `index.html`.

## Antes de qualquer coisa: isto é público

Não há senha, não há login. Qualquer pessoa na internet lê o que estiver aqui.
**É deliberado** — é material de estudo e de trabalho que o dono prefere
acessível. O que nunca pode entrar é credencial: chave, token, `.env`, dump de
banco. Em 05/09/2026 apareceram servidos com HTTP 200 uma chave SSH privada,
credenciais OAuth do Google e três tokens do GitHub.

Antes de publicar material novo:

```bash
grep -rniE 'api[_-]?key|secret|token|AIza|sk-|ghp_' PASTA_NOVA \
  --include='*.js' --include='*.json' --include='*.md' --include='*.txt'
```

**O prefixo `_` só esconde na raiz.** O `_LEIA-ME.md` da raiz descreve a regra
do nginx como `location ~ ^/_`, e o `^` ancora no começo do endereço: `/_x.md`
é recusado, `/trabalho/qualquer/_x.md` não seria. Quem contar com o underscore
para proteger algo em subpasta conta com o que não existe. O conserto seria
trocar a âncora por `(^|/)_` — não aplicado, porque a fonte de verdade é
`/DATA/AppData/compose/sites-nginx.conf`, no servidor.

`.js`, `.md`, `.json`, `.txt` **não** são bloqueados. `.sh`, `.py` e extensões
de documento/dump são.

## `_arquivos-zerados/` — não é lixo comum

3.199 arquivos (57% do repositório, 142 MB declarados) têm tamanho normal e
conteúdo **100% de bytes nulos**. Não são arquivos em branco: são arquivos cujo
conteúdo se perdeu. Já entraram zerados no commit inicial — o git não recupera.
142 MB declarados contra 17 MB em disco identifica arquivos esparsos, cujos
blocos nunca foram gravados: falha entre sistema de arquivos e sincronização.

Foram **movidos, não excluídos**, para conferência contra backup.
**Não apagar sem o usuário confirmar.** Se a sincronização ainda estiver com
defeito, o problema volta a acontecer com arquivo novo.

**A pasta ao vivo `/media/auxiliar/sites` não é fonte boa.** Em 20/09/2026 uma
sessão irmã presumiu que fosse, restaurou os arquivos por cima (`dd84fab`) e
depois conferiu byte a byte: a pasta ao vivo está zerada também. Reverteu em
`8c3fac1`. Não verificado desta sessão — não tenho acesso a esse caminho —,
mas registrado porque é a hipótese que qualquer um tenta primeiro.

**Tamanho não prova conteúdo.** 42.788 bytes de zeros têm tamanho "certo" no
`ls`, no `stat` e no `git cat-file -s`; foi assim que a restauração acima
passou na própria verificação de quem a fez. O teste que distingue conta os
bytes nulos, ou compara o hash do blob:

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
print('100% nulos:', len(z))"
```

## `trabalho/site-cmcr/` — Condomínio Monte Carlo Residence

Dois sites que se ligam: a página de apresentação (`index.html`) e as
**Normas e Informativos** (`base-conhecimento/` — o caminho foi mantido ao
renomear a página, para não quebrar link já compartilhado com morador).

### Duas regras do usuário, que valem mais que qualquer preferência técnica

1. **Fidelidade do texto, liberdade na apresentação.** "A fidelidade do texto
   podemos manter. A estética, a apresentação podem ser melhoradas." O texto
   reproduz o documento registrado em cartório, **inclusive onde o próprio
   documento tem erro de digitação**. Não corrija português do original. Os
   oito pontos de divergência estão listados numa nota ao fim da página.
2. **Contato de terceiros não se publica.** O Manual do Proprietário traz
   telefones e e-mails de fornecedores; nada disso vai para a página. A
   referência técnica do material fica, porque serve para repor peça igual.

### Como os dados são organizados

`base-conhecimento/dados/*.js` — arquivos `.js` (não `.json`) de propósito,
para a página funcionar aberta por `file://`. A página inicial lê os **mesmos**
arquivos: horários saem de `regimento.js`, unidades e vagas são **contadas** no
quadro do Art. 6º em `convencao.js`. As duas páginas não têm como divergir.

Os campos `notaConferencia` e `confiabilidade` guardam a procedência do texto
mas **não são exibidos** — a página não é lugar de anotação de bastidor.
`REVISAO-OCR.md` descreve o método.

### A paleta vem da fachada, medida

Vinho `#7a3a3d` (texto, 8,40:1), tons medidos `#a77777`/`#835d5d` e bronze
`#8a7a6f` só em preenchimento — **nenhum dos medidos alcança 4,5:1**, então
nenhum pode carregar texto.

`--accent-contraste` existe porque três regras usam `--accent` como fundo: no
tema escuro o fundo fica claro, e `color: #fff` fixo dava 2,10:1. **Nunca fixe
`#fff` sobre uma cor que muda com o tema.**

## `trabalho/site-cmcr/testes/` — rodar antes de commitar

```bash
cd trabalho/site-cmcr/testes
node rodar.js              # tudo (178 asserções)
node rodar.js regimento    # só os casos que casam com o nome
node auditoria.js          # auditoria por mutação
```

Precisa de Node e Playwright com Chromium; o Playwright **não** é dependência
deste repositório. O executor sobe o próprio servidor numa porta livre. Sai com
código 1 se algo falhar ou não completar.

### Três regras que a suíte aprendeu do jeito difícil

1. **Todo caso termina com `FIM|executadas|falhas`.** Um arquivo que morre no
   meio não imprime falha nenhuma, e silêncio é indistinguível de sucesso — foi
   assim que oito asserções sumiram enquanto o relatório dizia "zero falhas".
   Arquivo sem o marcador é contado como quebrado, nunca como aprovado.
2. **Não deixe o caso morrer onde deveria reprovar.** Ler o texto de um elemento
   ausente estoura, e um caso que estoura avisa que algo quebrou sem dizer o
   quê. Confira a presença primeiro e reprove com nome.
3. **Prove que toda asserção nova enxerga.** Plante o defeito correspondente em
   `mutacoes.js` e confirme que ela reprova. Sem isso, já passaram por teste:
   um `… ? true : true`, uma asserção posicionada depois do clique que criava o
   estado que ela verificava, e uma que lia `aria-selected` do HTML em vez do
   conteúdo renderizado.

Um caso **nunca deve depender da aba padrão**: cada um escolhe sua aba. A
página abre no Manual; mudar isso já quebrou sete arquivos de uma vez.

Buraco conhecido na cobertura ganha a chave `descoberto` em `mutacoes.js`, com o
motivo. A auditoria só falha quando aparece um buraco **novo**.

## Convenções

- Tudo em português, inclusive nomes de arquivo, variáveis e mensagens de commit.
- Mensagem de commit explica **por que**, não só o quê — e registra o erro
  cometido no caminho, quando houve.
- Não há CI neste repositório: a verificação é a suíte, rodada localmente.
- O dono mantém um **Diário de Bordo** em artefato do Claude, com registro
  numerado por dia. A convenção é: entrada nova no topo, item novo no índice,
  numeração em sequência, segredos nunca.
