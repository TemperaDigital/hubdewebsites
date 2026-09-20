const { chromium } = require('../playwright-local');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1000, height: 1100 }, deviceScaleFactor: 1.5 });
  const erros=[]; p.on('pageerror', e=>erros.push(e.message));
  await p.goto(require('../alvo').exigir('BASE_URL'), { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(500);
  let _n=0, _f=0;
  const ok=(n,c)=>{_n++; if(!c)_f++; console.log((c?'✓':'✗')+' '+n);};

  await p.locator('.aba[data-doc="convencao"]').click(); await p.waitForTimeout(350);
  ok('Convenção agora "Texto conferido"', (await p.locator('.alerta').first().textContent()).includes('Texto conferido'));
  ok('sem lacunas pendentes', (await p.locator('.lacuna').count()) === 0);

  await p.locator('.cap-btn').nth(2).click(); await p.waitForTimeout(400);   // Cap III (Arts 3-6)
  ok('2 tabelas no Cap III', (await p.locator('.tabela').count()) === 2);
  const areas = await p.locator('.tabela').first().textContent();
  ok('tabela de áreas com fração ideal', areas.includes('0,01344') && areas.includes('116,94'));
  ok('tabela de vagas com 76 linhas', (await p.locator('.tabela').nth(1).locator('tbody tr').count()) === 76);
  const vg = await p.locator('.tabela').nth(1).textContent();
  ok('unidade 1801 com 2 vagas', /1801[\s\S]{0,40}2/.test(vg));
  ok('tabela longa tem rolagem', (await p.locator('.tabela-rolagem').count()) === 1);

  // buscar por unidade encontra o artigo da garagem
  await p.fill('#busca','1801'); await p.waitForTimeout(400);
  const res = await p.locator('.res-item strong').allTextContents();
  ok('busca "1801" acha exatamente os Arts. 4º e 6º ('+res.join(', ')+')',
     res.length === 2 && res.includes('Art. 4º') && res.includes('Art. 6º'));

  await p.fill('#busca',''); await p.waitForTimeout(300);
  // regressão nas outras tabelas
  await p.locator('.aba[data-doc="regimento"]').click(); await p.waitForTimeout(300);
  await p.locator('.cap-btn').nth(1).click(); await p.waitForTimeout(350);
  const hor = await p.locator('.tabela').textContent();
  ok('tabela de horários intacta', hor.includes('09h às 12h') && hor.includes('Salão de Festas'));
  await p.locator('.aba[data-doc="manual"]').click(); await p.waitForTimeout(300);
  await p.locator('.cap-btn').nth(5).click(); await p.waitForTimeout(350);
  ok('tabela de garantias intacta', (await p.locator('.tabela tbody tr').count()) === 18);

  await p.setViewportSize({width:375,height:800}); await p.waitForTimeout(300);
  ok('sem overflow mobile', (await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth))===0);
  console.log('erros:', erros.length?erros.join('|'):'nenhum');
  console.log('FIM|' + _n + '|' + _f);
  await b.close();
})();
