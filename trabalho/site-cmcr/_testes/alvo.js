// Os casos não sobem servidor: quem faz isso é o rodar.js, que passa o
// endereço pelo ambiente. Rodar um caso solto deixaria a URL vazia, e o erro
// do Playwright não diria por quê. Esta função diz.
function exigir(nome) {
  const valor = process.env[nome];
  if (!valor) {
    console.error(
      'Falta a variável ' + nome + '.\n' +
      'Os casos não são executados soltos — rode a suíte pelo executor:\n' +
      '    node rodar.js\n' +
      'Para um caso só:\n' +
      '    node rodar.js ' + require('path').basename(process.argv[1], '.js') + '\n'
    );
    process.exit(2);
  }
  return valor;
}
module.exports = { exigir: exigir };
