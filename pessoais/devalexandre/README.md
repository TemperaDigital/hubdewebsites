# Eu, Alexandre — site estático

Site pessoal de Alexandre Guerra. HTML + CSS puros, sem build.

## Estrutura

```
eu-alexandre-site/
├── index.html          página única (entrada)
├── src/
│   ├── css/styles.css  estilos
│   └── js/script.js    interações simples
├── public/
│   └── favicon.svg     favicon
├── assets/             imagens (portrait, news)
├── docker-compose.yml  para subir com Nginx
└── README.md
```

## Rodar localmente

```bash
python3 -m http.server 8080
# ou
npx serve .
```

Abra `http://localhost:8080`.

## Rodar no ZimaOS (Docker)

1. Copie a pasta para o NAS (ex.: `/DATA/AppData/eu-alexandre-site/`).
2. Dentro dela:

```bash
docker compose up -d
```

3. Acesse `http://<ip-do-zimaos>:8080`.

Para usar `eualexandre.fguerra.ia.br`, aponte um registro no Cloudflare
para o IP/host público do seu ZimaOS (ou use Cloudflare Tunnel).

## GitHub Pages

1. Crie um repositório (ex.: `eu-alexandre`).
2. Faça upload de todos os arquivos desta pasta.
3. **Settings → Pages**: branch `main`, pasta `/ (root)`.
4. Domínio próprio: adicione um arquivo `CNAME` com
   `eualexandre.fguerra.ia.br` e crie o CNAME no Cloudflare apontando
   para `<usuario>.github.io`.
