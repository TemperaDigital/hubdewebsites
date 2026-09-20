# Arquivos zerados — pode apagar esta pasta inteira

Todo arquivo aqui dentro tem **tamanho normal e conteúdo 100% de bytes
nulos**. Não é arquivo em branco: é arquivo cujo conteúdo foi perdido. Abrir
qualquer um deles não mostra nada.

São 3.199 arquivos, 142 MB de nada.

## Por que estão aqui e não foram apagados

Foram movidos, não excluídos, para você conferir contra um backup antes de
decidir. Quando não precisar mais:

```bash
rm -rf _arquivos-zerados
```

Ou apague a pasta pelo Windows ou pelo Nextcloud, como preferir.

## O nome começa com `_` de propósito

A regra `location ~ ^/_` do nginx recusa caminhos que comecem com underscore.
Ela **só funciona na raiz** — e esta pasta está na raiz, que é justamente o
caso em que a regra pega. Assim a quarentena não é servida na web.

## De onde vieram

| Pasta de origem | Arquivos |
|---|---|
| `trabalho/02_imersoes_cursos` | 2.543 |
| `trabalho/01_projetos` | 644 |
| `trabalho/site-cmcr` | 12 |

A estrutura de pastas original foi preservada aqui dentro, então dá para ver
exatamente de onde cada arquivo saiu.

Do site do condomínio saíram só o `pagina1.html`, que não era referenciado por
nenhuma página, e onze arquivos de "Fonts do Condominio" — fontes e um PDF de
licença que o site não usa: ele carrega Inter e Lora do Google Fonts.

## Não foi o git, e o git não recupera

Os arquivos **já entraram zerados no primeiro commit**. Conferido em
`git show 59a1f4c:<arquivo>`: o conteúdo versionado já era todo nulo. O dano
aconteceu antes de o repositório existir, no sistema de arquivos de origem.

Tamanho certo com conteúdo todo zero é a assinatura de falha entre o sistema
de arquivos e a sincronização: os metadados sobreviveram, os blocos de dados
não. Costuma vir de sincronização interrompida, de escrita por SMB/Samba que
falhou no meio, ou de desligamento sujo antes de a gravação chegar ao disco.

**A única recuperação possível é um backup anterior, ou a fonte original** —
a Alura, o fornecedor da fonte, quem enviou o documento.

## Antes de apagar

Nenhum arquivo íntegro aponta para nenhum destes: varri os 557 arquivos de
HTML, CSS, JS e Markdown do repositório procurando `src=` e `href=` que
resolvessem para cá, e não há nenhum. Apagar esta pasta não quebra página
alguma.
