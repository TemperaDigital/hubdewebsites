// O Playwright não é dependência deste repositório — não há package.json aqui,
// e o site é estático de propósito. Mas os testes precisam de um navegador.
//
// Antes, cada arquivo trazia o caminho absoluto da máquina onde foram
// escritos. Isso funcionava lá e em nenhum outro lugar. Aqui procuramos nos
// lugares prováveis e, se não houver, a mensagem diz o que fazer em vez de
// estourar um "Cannot find module" sem contexto.
const CAMINHOS = [
  process.env.PLAYWRIGHT_MODULE,            // escape manual, se nada abaixo servir
  'playwright',                             // instalado no projeto ou global
  '/opt/node22/lib/node_modules/playwright',
  '/usr/lib/node_modules/playwright',
  '/usr/local/lib/node_modules/playwright'
].filter(Boolean);

let achado = null;
const tentados = [];
for (const caminho of CAMINHOS) {
  try {
    achado = require(caminho);
    break;
  } catch (e) {
    tentados.push(caminho);
  }
}

if (!achado) {
  console.error(
    'Playwright não encontrado. Procurei em:\n  ' + tentados.join('\n  ') +
    '\n\nInstale com:  npm install -g playwright && npx playwright install chromium' +
    '\nOu aponte o caminho:  PLAYWRIGHT_MODULE=/caminho/para/playwright node rodar.js\n'
  );
  process.exit(2);
}

module.exports = achado;
