const { chromium } = require('../playwright-local');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1000, height: 1100 }, deviceScaleFactor: 1.5 });
  const erros = []; p.on('pageerror', e => erros.push(e.message));
  await p.goto(require('../alvo').exigir('BASE_URL'), { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(500);
  let _n=0, _f=0;
  const ok = (n,c)=>{_n++; if(!c)_f++; console.log((c?'✓':'✗')+' '+n);};

  ok('aviso "Texto conferido"', (await p.locator('.alerta').first().textContent()).includes('Texto conferido'));
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
