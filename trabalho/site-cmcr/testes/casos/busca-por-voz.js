// Não dá para testar microfone de verdade em CI. O que este caso verifica é
// a fiação: se a API existe, o clique aciona ela, e o resultado enche o
// campo e dispara a busca. Uma implementação falsa de SpeechRecognition é
// injetada antes da página carregar — os eventos que ela dispara são os
// mesmos que o navegador real dispararia.
//
// A falsa API é atribuída aos DOIS nomes, com e sem prefixo. O Chromium do
// Playwright expõe `window.SpeechRecognition` nativamente — se só
// `webkitSpeechRecognition` fosse trocado, o app.js pegaria o nativo pelo
// `||`, e o clique acionaria reconhecimento de verdade (que falha sem
// microfone, sem avisar por quê).
const { chromium } = require('../playwright-local');
(async () => {
  const b = await chromium.launch();

  // --- 1) COM suporte: a fiação funciona de ponta a ponta ---------------
  const ctxCom = await b.newContext({ viewport: { width: 1000, height: 1000 } });
  const pCom = await ctxCom.newPage();
  await pCom.addInitScript(() => {
    function FalsoReconhecimento() {
      this.lang = ''; this.interimResults = null; this.maxAlternatives = null;
      this._ouvintes = {};
    }
    FalsoReconhecimento.prototype.addEventListener = function (tipo, fn) {
      (this._ouvintes[tipo] = this._ouvintes[tipo] || []).push(fn);
    };
    FalsoReconhecimento.prototype.start = function () {
      window.__vozIniciada = true;
      var self = this;
      setTimeout(function () {
        var evento = { results: [[{ transcript: 'síndico' }]] };
        (self._ouvintes.result || []).forEach(function (fn) { fn(evento); });
        (self._ouvintes.end || []).forEach(function (fn) { fn(); });
      }, 60);
    };
    FalsoReconhecimento.prototype.stop = function () {
      (this._ouvintes.end || []).forEach(function (fn) { fn(); });
    };
    window.SpeechRecognition = FalsoReconhecimento;
    window.webkitSpeechRecognition = FalsoReconhecimento;
  });
  const erros = []; pCom.on('pageerror', e => erros.push(e.message));
  await pCom.goto(require('../alvo').exigir('BASE_URL'), { waitUntil: 'domcontentloaded' });
  await pCom.waitForTimeout(450);
  let _n = 0, _f = 0;
  const ok = (n, c) => { _n++; if (!c) _f++; console.log((c ? '✓' : '✗') + ' ' + n); };

  const btn = pCom.locator('#busca-voz');
  ok('botão de voz aparece com o campo vazio (navegador com suporte)', await btn.isVisible());
  ok('botão de limpar não aparece ao mesmo tempo', !(await pCom.locator('#busca-limpar').isVisible()));

  await btn.click();
  await pCom.waitForTimeout(250);
  const iniciou = await pCom.evaluate(() => window.__vozIniciada === true);
  ok('clicar chama start() no reconhecimento', iniciou);

  await pCom.waitForTimeout(150); // o resultado falso chega em 60ms
  const valorCampo = await pCom.locator('#busca').inputValue();
  ok('o resultado da voz preenche o campo ("' + valorCampo + '")', valorCampo === 'síndico');

  const resultados = await pCom.locator('.res-item strong').count();
  ok('a busca roda sozinha com o texto reconhecido (' + resultados + ' resultados)', resultados > 0);

  ok('depois do resultado, o botão de voz some (há texto no campo)', !(await pCom.locator('#busca-voz').isVisible()));
  ok('e o botão de limpar aparece no lugar', await pCom.locator('#busca-limpar').isVisible());

  await ctxCom.close();

  // --- 2) SEM suporte: o botão nunca aparece -----------------------------
  const ctxSem = await b.newContext({ viewport: { width: 1000, height: 1000 } });
  const pSem = await ctxSem.newPage();
  await pSem.addInitScript(() => {
    delete window.SpeechRecognition;
    delete window.webkitSpeechRecognition;
  });
  await pSem.goto(require('../alvo').exigir('BASE_URL'), { waitUntil: 'domcontentloaded' });
  await pSem.waitForTimeout(450);

  // Se este bloco travasse o script inteiro (ex.: instanciar um construtor
  // indefinido), o botão continuaria escondido pelo hidden que já vem no
  // HTML — coincidência, não a regra funcionando. Por isso a ausência de
  // erro de execução também é verificada, não só a visibilidade.
  ok('sem SpeechRecognition, o botão de voz fica escondido (campo vazio)',
     !(await pSem.locator('#busca-voz').isVisible()));

  await pSem.fill('#busca', 'teste'); await pSem.waitForTimeout(300);
  ok('e continua escondido com o campo preenchido — não é só a regra do texto',
     !(await pSem.locator('#busca-voz').isVisible()));
  await pSem.fill('#busca', ''); await pSem.waitForTimeout(300);

  ok('nenhum erro de execução na página sem suporte a voz', erros.length === 0);

  await ctxSem.close();

  console.log('erros:', erros.length ? erros.join('|') : 'nenhum');
  console.log('FIM|' + _n + '|' + _f);
  await b.close();
})();
