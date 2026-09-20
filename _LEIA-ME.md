# Pasta de sites publicados

Esta pasta é servida em **https://sites.fguerra.ia.br** pelo container
`sites` (nginx, porta 8301). A configuração é
`/DATA/AppData/compose/sites-nginx.conf` — é ela a fonte de verdade, não
este arquivo; aqui fica só a explicação de como ela se comporta.

Última revisão: 06/09/2026

> Este arquivo começa com `_` de propósito. A pasta inteira é pública na
> internet e `.md` é servido normalmente pelo nginx. A regra `location ~ ^/_`
> nega qualquer caminho iniciado por underscore, então o nome mantém o texto
> legível pelo Samba e pelo Nextcloud e invisível para a web.

---

## Antes de tudo: isto é público

Não há senha, não há login, não há proxy autenticado. Qualquer pessoa na
internet lê o que estiver aqui e for permitido pelo nginx.

Uma pasta sem `index.html` devolve 403 na listagem, **mas os arquivos dentro
dela continuam acessíveis por caminho direto**. Não trate a ausência de
index como esconderijo. Em 05/09/2026 foram encontrados expostos com 200 uma
chave SSH privada, credenciais OAuth do Google e três tokens do GitHub, todos
em pastas sem index.

Nunca coloque aqui `.env`, chave, token, dump de banco ou documento interno.

## Regras básicas de publicação

- Uma subpasta = um site independente, com seu próprio `index.html`.
- Sem `index.html`, a pasta devolve 403 (listagem de diretório é desligada).
- Pastas e arquivos iniciados por `_` são recusados: use o prefixo para
  rascunho, modelo e material que não deve sair no ar.
- HTML é servido com `no-cache`; CSS, JS e imagens com cache de 1 hora.
- Só `GET` e `HEAD`; qualquer outro método devolve 405.
- Dono e permissão que funcionam: `gestor:samba`, diretórios 755,
  arquivos 644. Arquivo criado por container costuma nascer `root:root` — daí
  o site funciona na web mas você não consegue editar pelo Windows.

## `trabalho/02_imersoes_cursos/` — área de exercícios, aberta

Até 06/09/2026 esta pasta era **negada em bloco**: cada site precisava de uma
exceção nominal no conf, e copiar os arquivos não bastava — o nginx devolvia
403 mesmo com `index.html` presente e permissão correta. O sintoma enganava,
porque parecia problema de permissão.

**Esse bloqueio foi removido.** É área de estudo: HTML novo aparece toda
semana e precisa ser visto no navegador na hora. Hoje a pasta é servida por
inteiro, como qualquer outra, e publicar um exercício é só copiar a subpasta
com seu `index.html` dentro.

Seguem negados ali dentro, por motivo específico:

| Caminho | Por quê |
|---|---|
| `Alura_18Nov2025/Projetooriginal/` | `.env` com chave de API do Google real |
| `Alura_18Nov2025/.git/` | histórico do repositório |

E as regras globais da seção seguinte continuam valendo em toda a pasta:
`node_modules/`, dotfiles, documentos e scripts nunca são servidos.

### O preço de ter aberto

A pasta virou pública de verdade. Antes o `deny` funcionava como rede de
proteção contra um arquivo sensível deixado ali por descuido; agora essa rede
não existe mais. Ao jogar material novo aqui, confira que não vai junto:

- `.json`, `.md`, `.txt`, `.ipynb`, `.ts`, `.tsx`, `.yml` — **nenhum é
  bloqueado** e todos costumam guardar chave de API.
- PDF também é servido de propósito, então documento interno não entra.
- Arquivo chamado `algo.env` **não** é bloqueado: a regra de dotfiles só pega
  nomes que começam com ponto, como `.env`. Em 06/09/2026 existiam dois
  `Google_API.env` na árvore — por sorte, ambos vazios.

Varredura rápida antes de publicar material novo:

```bash
grep -rniE 'api[_-]?key|secret|token|AIza|sk-|ghp_' PASTA_NOVA \
  --include='*.js' --include='*.json' --include='*.md' --include='*.txt'
```

### Decisão de 06/09/2026: acesso direto a arquivo é intencional

Pasta sem `index.html` devolve 403 na listagem, mas **os arquivos dentro dela
continuam acessíveis por caminho direto** — e isso aqui é de propósito, não
descuido. Vale para prints de tela, PDFs de curso, certificado e o que mais
estiver na árvore: é área de estudo e o acesso direto ao arquivo é útil.

Foi escolha explícita do dono da pasta, feita com o efeito colateral à vista.
Não mova esse material para pasta `_alguma-coisa` "para proteger" sem
perguntar antes.

## O que o nginx bloqueia em toda a árvore

- `modelos/` — cópias de sites de terceiros, guardadas como inspiração.
- `onp-spec-driven-main/`, `code-review-graph-main/` — código-fonte de
  ferramenta, não site.
- `node_modules/` e `supabase/migrations/` em qualquer nível.
- Extensões de documento e dump: `.sql .sqlite .bak .csv .doc(x) .xls(x)
  .ppt(x) .odt .ods .zip .rar .7z .tar .gz`. **PDF ficou de fora de
  propósito**, porque `guia-pdp-afastamento/downloads/` serve PDFs como parte
  do site.
- Scripts: `.php .py .pl .sh .rb .lua .cgi` — não há interpretador na imagem,
  mas negar evita servir código como texto.
- Arquivos ocultos (`.git`, `.env`, `.htaccess`) e resíduos do Windows e do
  cliente Nextcloud (`Thumbs.db`, `desktop.ini`, `.log`, `.db`).
- Caminhos específicos bloqueados por incidente de exposição de credencial,
  em 05/09/2026 — ver comentários marcados `URGENTE` no conf.

**Não bloqueados, e isso é deliberado ou apenas não revisado:** `.md`, `.ts`,
`.tsx`, `.json`, `.txt`. Se um desses guardar algo sensível, ele sai no ar.

## Diagnóstico rápido de 403

O log diz qual dos dois casos é:

```bash
ssh -t gestor@192.168.1.153 "sudo docker logs --tail=40 sites"
```

- `access forbidden by rule` → é regra do nginx. Permissão de arquivo não
  tem nada a ver; procure o `deny` que casa com o caminho.
- `directory index of ... is forbidden` → falta `index.html` na pasta.
