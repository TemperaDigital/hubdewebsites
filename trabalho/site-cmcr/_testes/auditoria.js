// Auditoria por mutação:  node auditoria.js
//
// Quebra o site de propósito, uma vez para cada defeito da lista, e vê se a
// suíte reclama. Responde a pergunta que "127 asserções, 0 falhas" não
// responde: os casos medem alguma coisa, ou só passam?
//
// Duas precauções que custaram caro para aprender:
//
//  1. Crash conta como detecção. Um arquivo que morre no meio não imprime
//     falha nenhuma. Contar só as linhas reprovadas faria um defeito grave
//     demais aparecer como "não detectado".
//  2. Existe uma rodada de controle antes de tudo. Se a suíte não estiver
//     verde no estado íntegro, nada do que vier depois significa nada, e a
//     auditoria aborta em vez de imprimir números bonitos.
//
// O site é copiado para uma pasta temporária e mutado lá. A árvore de
// trabalho nunca é tocada, então uma interrupção no meio não deixa defeito
// plantado no repositório.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { subir } = require('./servidor');
const { rodar } = require('./suite');

const SITE = path.resolve(__dirname, '..');
const MUTACOES = require('./mutacoes');

(async function () {
  const copia = fs.mkdtempSync(path.join(os.tmpdir(), 'cmcr-mutacao-'));
  fs.cpSync(SITE, copia, {
    recursive: true,
    filter: function (origem) { return path.basename(origem) !== '_testes'; }
  });

  const { servidor, url } = await subir(copia);
  console.log('cópia do site em ' + copia);
  console.log('servida em ' + url + '\n');

  const controle = await rodar(url);
  console.log('controle, sem mutação: ' + controle.executadas + ' asserções, ' +
              controle.falhas + ' falhas, ' + controle.quebrados.length + ' arquivos quebrados');
  if (controle.falhas || controle.quebrados.length) {
    console.log('\nABORTADO: a suíte não está verde no estado íntegro.');
    console.log('Conserte isso antes; enquanto não estiver, a auditoria não mede nada.');
    servidor.close();
    fs.rmSync(copia, { recursive: true, force: true });
    process.exit(1);
  }
  console.log('');

  const linhas = [];
  for (let i = 0; i < MUTACOES.length; i++) {
    const m = MUTACOES[i];
    const alvo = path.join(copia, m.arquivo);
    const original = fs.readFileSync(alvo, 'utf-8');
    const mutado = m.aplicar(original);

    if (mutado === original) {
      // O alvo mudou de forma e a mutação virou letra morta. Isso é defeito
      // desta lista, não da suíte, e não pode ser contado como aprovação.
      linhas.push({ nome: m.nome, veredito: 'NÃO SE APLICA', detalhe: 'a mutação não encontrou seu alvo' });
      console.log('[' + (i + 1) + '/' + MUTACOES.length + '] ' + m.nome + ' -> NÃO SE APLICA');
      continue;
    }

    fs.writeFileSync(alvo, mutado);
    let r;
    try {
      r = await rodar(url);
    } finally {
      fs.writeFileSync(alvo, original);
    }

    const detectada = r.falhas > 0 || r.quebrados.length > 0;
    linhas.push({
      nome: m.nome,
      veredito: detectada ? 'detectada' : 'PASSOU DESPERCEBIDA',
      detalhe: r.falhas + ' falhas, ' + r.quebrados.length + ' quebrados',
      esperadoDescoberto: !!m.descoberto,
      motivo: m.descoberto || ''
    });
    console.log('[' + (i + 1) + '/' + MUTACOES.length + '] ' + m.nome + ' -> ' +
                (detectada ? 'detectada' : 'PASSOU DESPERCEBIDA'));
  }

  servidor.close();
  fs.rmSync(copia, { recursive: true, force: true });

  const aplicaveis = linhas.filter(function (l) { return l.veredito !== 'NÃO SE APLICA'; });
  const pegas = aplicaveis.filter(function (l) { return l.veredito === 'detectada'; });
  const escapadas = aplicaveis.filter(function (l) { return l.veredito !== 'detectada'; });
  const inuteis = linhas.filter(function (l) { return l.veredito === 'NÃO SE APLICA'; });

  console.log('\n' + '-'.repeat(58));
  console.log('detectadas: ' + pegas.length + ' de ' + aplicaveis.length +
              '  (' + Math.round(100 * pegas.length / aplicaveis.length) + '%)');

  if (escapadas.length) {
    console.log('\nBuracos na cobertura — defeitos que a suíte deixou passar:');
    escapadas.forEach(function (l) {
      console.log('  · ' + l.nome + (l.motivo ? '\n      ' + l.motivo : ''));
    });
  }
  if (inuteis.length) {
    console.log('\nMutações que perderam o alvo (conserte a lista, não a suíte):');
    inuteis.forEach(function (l) { console.log('  · ' + l.nome); });
  }

  // Um buraco conhecido não derruba a auditoria: ele já está documentado.
  // Um buraco NOVO, sim — é sinal de que algo deixou de ser coberto.
  const novos = escapadas.filter(function (l) { return !l.esperadoDescoberto; });
  if (novos.length || inuteis.length) {
    console.log('\nBuraco novo (não estava documentado): ' + novos.length);
    process.exit(1);
  }
})();
