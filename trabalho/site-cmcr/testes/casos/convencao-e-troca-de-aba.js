const { chromium } = require('../playwright-local');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1000, height: 1100 }, deviceScaleFactor: 1.5 });
  const erros = []; p.on('pageerror', e => erros.push(e.message));
  await p.goto(require('../alvo').exigir('BASE_URL'), { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(500);
  let _n=0, _f=0;
  const ok = (n,c)=>{_n++; if(!c)_f++; console.log((c?'✓':'✗')+' '+n);};

  // --- Convenção como documento real ---
  await p.locator('.aba[data-doc="convencao"]').click(); await p.waitForTimeout(300);
  ok('cabeçalho da Convenção', (await p.locator('.doc-cabeca').textContent()).includes('67 artigos em 13 capítulos'));
  ok('sem lacunas pendentes', (await p.locator('.lacuna').count()) === 0);
  ok('13 capítulos', (await p.locator('.cap').count()) === 13);
  await p.locator('.cap-btn').nth(8).click(); await p.waitForTimeout(300);  // Cap IX
  const cap9 = await p.locator('.cap-corpo').textContent();
  ok('Cap IX (o que faltava no resumo) abre', cap9.length > 200);
  console.log('   1º artigo:', (await p.locator('.cap-corpo .art-rot').first().textContent()));

  // --- busca dentro da Convenção ---
  await p.fill('#busca','quorum'); await p.waitForTimeout(350);
  console.log('   busca "quorum" na Convenção:', await p.locator('.res-cnt').textContent());

  await p.fill('#busca','sindico'); await p.waitForTimeout(350);
  ok('busca na Convenção traz artigos', (await p.locator('.res-item').count()) > 5);
  ok('badge diz "Convenção"', (await p.locator('.res-doc').first().textContent()) === 'Convenção');
  const cruz = await p.locator('.cruzado').textContent();
  ok('aviso cruzado aponta o Regimento', cruz.includes('Regimento Interno'));
  console.log('   cruzado:', cruz.trim());

  await p.locator('.cruzado').click(); await p.waitForTimeout(350);
  ok('clique no cruzado troca de documento', (await p.locator('.res-doc').first().textContent()) === 'Regimento');
  ok('termo preservado na troca', (await p.inputValue('#busca')) === 'sindico');

  // --- navegação para artigo na Convenção ---
  await p.locator('.aba[data-doc="convencao"]').click(); await p.waitForTimeout(250);
  await p.fill('#busca','fundo de reserva'); await p.waitForTimeout(350);
  await p.locator('.res-item').first().click(); await p.waitForTimeout(350);
  ok('clique abre artigo da Convenção', await p.locator('.art').first().isVisible());
  console.log('   abriu:', await p.locator('.art-rot').first().textContent());

  // --- Regimento segue intacto ---
  await p.fill('#busca',''); await p.waitForTimeout(250);   // sem isso a view é a de resultados
  await p.locator('.aba[data-doc="regimento"]').click(); await p.waitForTimeout(250);
  ok('Regimento com 88 artigos', (await p.locator('.doc-cabeca').textContent()).includes('88 artigos'));
  ok('aviso "Texto conferido" no Regimento', (await p.locator('.alerta').first().textContent()).includes('Texto conferido'));

  await p.locator('.aba[data-doc="legislacao"]').click(); await p.waitForTimeout(250);
  ok('Legislação intacta', (await p.locator('.lei-item').count()) === 17);

  await p.setViewportSize({width:375,height:800}); await p.waitForTimeout(250);
  ok('sem overflow mobile', (await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth))===0);
  console.log('erros runtime:', erros.length?erros.join('|'):'nenhum');
  console.log('FIM|' + _n + '|' + _f);
  await b.close();
})();
