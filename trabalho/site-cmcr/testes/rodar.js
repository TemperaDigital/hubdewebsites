// Executor da suíte. Uso:  node rodar.js  [nome-parcial-do-caso ...]
//
// Sobe o site numa porta escolhida pelo sistema, roda cada caso num processo
// separado e junta o resultado. Sai com código 1 se algo falhou ou se algum
// arquivo não completou — é esse número que um automatismo futuro vai olhar.
const path = require('path');
const { subir } = require('./servidor');
const { rodar, listar } = require('./suite');

(async function () {
  const filtros = process.argv.slice(2);
  if (!listar(filtros).length) {
    console.error('nenhum caso encontrado' + (filtros.length ? ' para: ' + filtros.join(', ') : ''));
    process.exit(2);
  }

  const { servidor, url } = await subir(path.resolve(__dirname, '..'));
  console.log('site servido em ' + url + '\n');

  const r = await rodar(url, filtros, function (caso) {
    if (!caso.completou) {
      console.log('✗✗ ' + caso.arquivo + ' NÃO COMPLETOU (código ' + caso.codigo + ')');
      console.log(caso.saida.split('\n').filter(Boolean).slice(-10)
        .map(function (l) { return '      ' + l; }).join('\n'));
      return;
    }
    console.log((caso.falhas ? '✗' : '✓') + ' ' +
      caso.arquivo.replace(/\.js$/, '').padEnd(34) +
      caso.executadas + ' asserções, ' + caso.falhas + ' falhas');
    caso.saida.split('\n').filter(function (l) { return l.startsWith('✗'); })
      .forEach(function (l) { console.log('      ' + l); });
  });

  servidor.close();

  console.log('\n' + '-'.repeat(58));
  console.log('asserções executadas: ' + r.executadas + ' | falhas: ' + r.falhas);
  if (r.quebrados.length) {
    console.log('ARQUIVOS QUEBRADOS: ' + r.quebrados.join(' '));
    process.exit(1);
  }
  if (r.falhas) process.exit(1);
  console.log('todos os arquivos completaram');
})();
