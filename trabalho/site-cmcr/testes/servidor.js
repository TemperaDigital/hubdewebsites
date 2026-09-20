// Servidor estático mínimo, sem nenhuma dependência.
//
// A suíte já exige Node por causa do Playwright. Exigir também Python só para
// servir arquivos durante o teste seria mais uma coisa para dar errado na
// máquina de quem for rodar isto depois.
const http = require('http');
const fs = require('fs');
const path = require('path');

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

// Sobe um servidor na raiz indicada e devolve a URL base já com a porta que o
// sistema escolheu. Porta 0 evita o conflito de rodar a suíte duas vezes ao
// mesmo tempo, ou de esbarrar em algo que já ocupava uma porta fixa.
function subir(raiz) {
  const base = path.resolve(raiz);
  const servidor = http.createServer(function (req, res) {
    let caminho;
    try {
      caminho = decodeURIComponent(req.url.split('?')[0]);
    } catch (e) {
      res.writeHead(400);
      return res.end('url inválida');
    }
    let alvo = path.resolve(path.join(base, caminho));
    // sem isto, "GET /../../etc/passwd" sairia da raiz
    if (alvo !== base && !alvo.startsWith(base + path.sep)) {
      res.writeHead(403);
      return res.end('fora da raiz');
    }
    fs.stat(alvo, function (erroStat, st) {
      if (!erroStat && st.isDirectory()) alvo = path.join(alvo, 'index.html');
      fs.readFile(alvo, function (erro, conteudo) {
        if (erro) {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          return res.end('não encontrado: ' + caminho);
        }
        res.writeHead(200, {
          'Content-Type': TIPOS[path.extname(alvo).toLowerCase()] || 'application/octet-stream',
          'Cache-Control': 'no-store'
        });
        res.end(conteudo);
      });
    });
  });

  return new Promise(function (resolve) {
    servidor.listen(0, '127.0.0.1', function () {
      const porta = servidor.address().port;
      resolve({ servidor: servidor, url: 'http://127.0.0.1:' + porta + '/' });
    });
  });
}

module.exports = { subir: subir };
