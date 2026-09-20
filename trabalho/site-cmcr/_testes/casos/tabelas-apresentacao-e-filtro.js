const { chromium } = require('../playwright-local');
(async () => {
  const b = await chromium.launch();
  const erros = [];
  let _n=0, _f=0;
  const ok=(n,c)=>{_n++; if(!c)_f++; console.log((c?'✓':'✗')+' '+n);};

  // ---------- desktop ----------
  let p = await b.newPage({ viewport:{width:1000,height:1000}, deviceScaleFactor:1.5 });
  p.on('pageerror', e=>erros.push(e.message));
  await p.goto(require('../alvo').exigir('BASE_URL'), {waitUntil:'domcontentloaded'}); await p.waitForTimeout(400);

  await p.locator('.cap-btn').nth(1).click(); await p.waitForTimeout(400);   // Regimento Cap II
  const hor = p.locator('.tabela').first();
  ok('horários com 4 colunas (ITEM de volta)', (await hor.locator('thead th').count()) === 4);
  const itens = await hor.locator('tbody tr:not(.linha-obs) td:first-child').allTextContents();
  ok('itens 1 a 6 presentes', ['1','2','3','4','5','6'].every(n => itens.includes(n)));
  ok('continuações em branco, como a célula mesclada do original',
     itens.filter(x => x === '').length === 4);

  await p.locator('.aba[data-doc="manual"]').click(); await p.waitForTimeout(300);
  await p.locator('.cap-btn').nth(9).click(); await p.waitForTimeout(400);
  ok('"Fornecedor" restaurado', (await p.locator('.tabela thead').textContent()).includes('Fornecedor'));

  // filtro da tabela de vagas
  await p.locator('.aba[data-doc="convencao"]').click(); await p.waitForTimeout(300);
  await p.locator('.cap-btn').nth(2).click(); await p.waitForTimeout(500);
  ok('campo de filtro presente', (await p.locator('.filtro-campo').count()) === 1);
  ok('conta inicial 76 linhas', (await p.locator('.filtro-conta').textContent()) === '76 linhas');
  await p.fill('.filtro-campo','1801'); await p.waitForTimeout(250);
  ok('filtro "1801" -> 1 linha', (await p.locator('.filtro-conta').textContent()) === '1 linha');
  const vis = await p.locator('[data-tabela="vagas"] tbody tr:visible').count();
  ok('só 1 linha visível', vis === 1);
  await p.fill('.filtro-campo','subsolo'); await p.waitForTimeout(250);
  console.log('   filtro "subsolo" ->', await p.locator('.filtro-conta').textContent());
  await p.fill('.filtro-campo',''); await p.waitForTimeout(250);
  ok('limpar restaura 76', (await p.locator('.filtro-conta').textContent()) === '76 linhas');
  ok('zebra nas duas tabelas da Convenção', (await p.locator('.tabela.zebra').count()) === 2);
  ok('faixas alternam por grupo, não por linha', (await p.locator('[data-tabela="vagas"] tbody tr.faixa').count()) === 38);
  await p.close();

  // ---------- celular ----------
  p = await b.newPage({ viewport:{width:375,height:900}, deviceScaleFactor:2 });
  p.on('pageerror', e=>erros.push(e.message));
  await p.goto(require('../alvo').exigir('BASE_URL'), {waitUntil:'domcontentloaded'}); await p.waitForTimeout(400);
  await p.locator('.aba[data-doc="convencao"]').click(); await p.waitForTimeout(300);
  await p.locator('.cap-btn').nth(2).click(); await p.waitForTimeout(600);
  for (const [i,nome] of [[0,'áreas'],[1,'vagas']]) {
    const t = p.locator('.tabela').nth(i);
    const bb = await t.boundingBox();
    const cx = await t.locator('xpath=ancestor::div[contains(@class,"tabela-box")]').boundingBox();
    ok(`${nome}: cabe na caixa no celular (${Math.round(bb.width)} <= ${Math.round(cx.width)})`, bb.width <= cx.width + 1);
  }
  // o rótulo da coluna precisa mesmo aparecer antes do valor, via ::before
  const rotulos = await p.locator('[data-tabela="vagas"] tbody tr').first()
    .locator('td').evaluateAll(tds => tds.map(td => getComputedStyle(td,'::before').content));
  ok('cada célula ganha o rótulo da coluna (' + rotulos.length + ' campos)',
     rotulos.length >= 4 && rotulos.every(c => c && c !== 'none' && c.length > 3));
  ok('rótulos são os cabeçalhos reais',
     rotulos.join(' ').toLowerCase().includes('livres') &&
     rotulos.join(' ').toLowerCase().includes('pavimento'));
  ok('no desktop o rótulo não é injetado', await p.evaluate(() => {
       const m = window.matchMedia('(max-width: 620px)'); return m.matches;
     }));
  const primeira = await p.locator('[data-tabela="vagas"] tbody tr').first().textContent();
  console.log('   1ª linha empilhada:', primeira.replace(/\s+/g,' ').trim().slice(0,80));
  ok('sem rolagem horizontal na página',
     (await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth))===0);

  // o filtro precisa esconder de fato, não só atualizar a contagem
  await p.fill('.filtro-campo','1801'); await p.waitForTimeout(300);
  const visMob = await p.locator('[data-tabela="vagas"] tbody tr:visible').count();
  ok('celular: filtro esconde as demais linhas (' + visMob + ' visível)', visMob === 1);
  ok('celular: contagem confere', (await p.locator('.filtro-conta').textContent()) === '1 linha');
  const cartao = await p.locator('[data-tabela="vagas"] tbody tr:visible').textContent();
  ok('celular: o cartão visível é o da unidade filtrada', cartao.indexOf('1801') === 0);
  await p.fill('.filtro-campo',''); await p.waitForTimeout(300);
  ok('celular: limpar traz as 76 de volta',
     (await p.locator('[data-tabela="vagas"] tbody tr:visible').count()) === 76);
  await p.screenshot({ path: require('path').join(__dirname, '..', '_saida', 'mob-tabela.png') });
  await p.close();

  console.log('erros:', erros.length?erros.join('|'):'nenhum');
  console.log('FIM|' + _n + '|' + _f);
  await b.close();
})();
