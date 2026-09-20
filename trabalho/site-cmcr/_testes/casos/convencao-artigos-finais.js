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
  ok('67 artigos', (await p.locator('.doc-cabeca').textContent()).includes('67 artigos em 13 capítulos'));
  ok('data completa', (await p.locator('.doc-cabeca').textContent()).includes('15 de junho de 2018'));
  ok('nenhuma lacuna', (await p.locator('.lacuna').count()) === 0);
  ok('fecho com assinatura', (await p.locator('.fecho').textContent()).includes('B & C Construções'));

  await p.locator('.cap-btn').nth(12).click(); await p.waitForTimeout(400);  // Cap XIII
  const c13 = await p.locator('.cap-corpo').textContent();
  ok('Cap XIII com 10 artigos', (await p.locator('.cap-corpo .art').count()) === 10);
  ok('Art. 61º com a multa de 10 salários', c13.includes('10 (dez) salários mínimos'));
  ok('parágrafo único do 61º (venda com débito)', c13.includes('esteja quite com as suas obrigações'));
  ok('parágrafo único do 64º (regimento completa)', c13.includes('completará esta convenção'));
  ok('Art. 66º cita a Lei 4.591', c13.includes('4.591'));

  await p.fill('#busca','vender apartamento'); await p.waitForTimeout(400);
  console.log('   "vender apartamento":', await p.locator('.res-cnt').textContent());
  await p.fill('#busca','foro'); await p.waitForTimeout(400);
  const r = await p.locator('.res-item strong').allTextContents();
  ok('busca "foro" acha o Art. 65º ('+r.join(', ')+')', r.includes('Art. 65º'));

  await p.setViewportSize({width:375,height:800}); await p.waitForTimeout(300);
  ok('sem overflow mobile', (await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth))===0);
  console.log('erros:', erros.length?erros.join('|'):'nenhum');
  console.log('FIM|' + _n + '|' + _f);
  await b.close();
})();
