// Roda os casos contra um endereço qualquer e devolve o resultado somado.
// Fica separado do rodar.js porque a auditoria por mutação precisa rodar a
// mesma suíte contra uma cópia do site — e duas implementações que deveriam
// ser iguais acabam divergindo justo quando importa.
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CASOS = path.join(__dirname, 'casos');

// Um arquivo que morre no meio não imprime nenhuma falha, e silêncio é
// indistinguível de sucesso. Todo caso termina com FIM|executadas|falhas;
// sem o marcador, o caso é quebrado — nunca aprovado.
const MARCADOR = /^FIM\|(\d+)\|(\d+)$/m;

function listar(filtros) {
  let casos = fs.readdirSync(CASOS).filter(function (f) { return f.endsWith('.js'); }).sort();
  if (filtros && filtros.length) {
    casos = casos.filter(function (f) {
      return filtros.some(function (t) { return f.includes(t); });
    });
  }
  return casos;
}

function rodarCaso(arquivo, ambiente) {
  return new Promise(function (resolve) {
    const p = spawn(process.execPath, [path.join(CASOS, arquivo)], {
      env: Object.assign({}, process.env, ambiente),
      cwd: CASOS
    });
    let saida = '';
    p.stdout.on('data', function (d) { saida += d; });
    p.stderr.on('data', function (d) { saida += d; });
    p.on('close', function (codigo) {
      const m = saida.match(MARCADOR);
      resolve({
        arquivo: arquivo, saida: saida, codigo: codigo, completou: !!m,
        executadas: m ? +m[1] : 0, falhas: m ? +m[2] : 0
      });
    });
  });
}

// url: endereço onde o site está servido, com barra no fim.
async function rodar(url, filtros, aoTerminarCaso) {
  const ambiente = { BASE_URL: url + 'base-conhecimento/', HOME_URL: url };
  const resultado = { executadas: 0, falhas: 0, quebrados: [], casos: [] };
  for (const caso of listar(filtros)) {
    const r = await rodarCaso(caso, ambiente);
    resultado.casos.push(r);
    if (r.completou) {
      resultado.executadas += r.executadas;
      resultado.falhas += r.falhas;
    } else {
      resultado.quebrados.push(caso);
    }
    if (aoTerminarCaso) aoTerminarCaso(r);
  }
  return resultado;
}

module.exports = { rodar: rodar, listar: listar };
