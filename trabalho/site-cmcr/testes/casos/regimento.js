const { chromium } = require('../playwright-local');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1000, height: 1100 }, deviceScaleFactor: 1.5 });
  const erros = []; p.on('pageerror', e => erros.push(e.message));
  await p.goto(require('../alvo').exigir('BASE_URL'), { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(500);
  let _n=0, _f=0;
  const ok = (n,c)=>{_n++; if(!c)_f++; console.log((c?'✓':'✗')+' '+n);};

  // A nota de procedência foi removida de propósito: como o texto foi conferido
  // é assunto de quem mantém a base, não de quem veio saber se pode ter cachorro.
  const tecnico = /Texto conferido|motores de OCR|\bOCR\b|\bdpi\b|segmenta[çc]|tesseract/i;
  ok('Regimento sem nota técnica de procedência',
     !tecnico.test(await p.locator('#painel').innerText()));
  ok('Regimento não abre com caixa de alerta', (await p.locator('.alerta').count()) === 0);

  // a nota de fidelidade vai no fim, depois dos capítulos, não no topo
  const posicao = await p.evaluate(() => {
    const nota = document.querySelector('.nota-fidelidade');
    const caps = document.querySelectorAll('.cap');
    if (!nota || !caps.length) return null;
    const ultimo = caps[caps.length - 1];
    // DOCUMENT_POSITION_FOLLOWING = a nota vem depois do último capítulo
    return !!(ultimo.compareDocumentPosition(nota) & Node.DOCUMENT_POSITION_FOLLOWING);
  });
  ok('nota de fidelidade fica depois dos capítulos, não no topo', posicao === true);

  await p.locator('#ver-erros').click(); await p.waitForTimeout(200);
  ok('lista de erros do original abre', await p.locator('.erros-orig').isVisible());
  ok('8 divergências listadas', (await p.locator('.erros-orig dt').count()) === 8);
  await p.locator('#ver-erros').click(); await p.waitForTimeout(200);
  ok('lista fecha', (await p.locator('.erros-orig').count()) === 0);

  await p.fill('#busca','lampadas'); await p.waitForTimeout(350);
  const arts = await p.locator('.res-item strong').allTextContents();
  ok('busca acha o novo Art. 72º ('+arts.join(', ')+')', arts.includes('Art. 72º'));
  await p.locator('.res-item', { hasText: 'Art. 72º' }).click(); await p.waitForTimeout(300);
  console.log('   texto:', (await p.locator('#regimento-art-72 .art-corpo').textContent()).trim());

  await p.fill('#busca',''); await p.waitForTimeout(250);
  await p.locator('.cap-btn').nth(1).click(); await p.waitForTimeout(300);
  const tab = await p.locator('.tabela tbody').textContent();
  ok('tabela sem marcas (?)', !tab.includes('(?)'));
  ok('sábado 09h às 12h', tab.includes('09h às 12h'));
  ok('sem lacunas na página', (await p.locator('.lacuna').count()) === 0);

  await p.setViewportSize({width:375,height:800}); await p.waitForTimeout(250);
  ok('sem overflow mobile', (await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth))===0);
  console.log('erros runtime:', erros.length?erros.join('|'):'nenhum');
  console.log('FIM|' + _n + '|' + _f);
  await b.close();
})();
