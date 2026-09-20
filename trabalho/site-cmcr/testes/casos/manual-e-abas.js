const { chromium } = require('../playwright-local');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1000, height: 1150 }, deviceScaleFactor: 1.5 });
  const erros = []; p.on('pageerror', e => erros.push(e.message));
  await p.goto(require('../alvo').exigir('BASE_URL'), { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(500);
  let _n=0, _f=0;
  const ok = (n,c)=>{_n++; if(!c)_f++; console.log((c?'✓':'✗')+' '+n);};

  ok('4 abas', (await p.locator('.aba').count()) === 4);
  // Estas precisam vir antes de qualquer clique: depois de o teste selecionar
  // uma aba, verificar qual está selecionada só confirma o que ele mesmo fez.
  const ordem = await p.locator('.aba').evaluateAll(as => as.map(a => a.dataset.doc));
  ok('as abas estão na ordem Manual, Convenção, Regimento, Legislação (' + ordem.join(' · ') + ')',
     JSON.stringify(ordem) === JSON.stringify(['manual','convencao','regimento','legislacao']));
  // o atributo aria-selected está escrito no HTML e pode mentir se o JS abrir
  // outro documento; o que vale é o que apareceu no painel
  const abriuEm = (await p.locator('.doc-cabeca h2').textContent()).trim();
  ok('a página abre no Manual do Proprietário (abriu em "' + abriuEm + '")',
     abriuEm === 'Manual do Proprietário');

  await p.locator('.aba[data-doc="manual"]').click(); await p.waitForTimeout(350);
  // Observações: curto, com a origem e o que o documento é.
  // o texto de .alerta começa pelo ícone; o parágrafo é o que o morador lê
  const obs = (await p.locator('.alerta p').first().textContent()).trim();
  ok('o aviso do Manual começa por "Observações" (começa por "' + obs.slice(0, 24) + '…")',
     obs.startsWith('Observações'));
  ok('o aviso diz de onde veio o Manual', /entregue pela Construtora/i.test(obs));
  ok('o aviso diz para que serve', /conhecer o próprio imóvel/i.test(obs));
  ok('o aviso cabe em um parágrafo',
     (await p.locator('.alerta p').count()) === 1);
  ok('cabeçalho do Manual', (await p.locator('.doc-cabeca').textContent()).includes('35 seções em 10 partes'));

  ok('aviso "não é norma"', (await p.locator('.alerta').first().textContent()).includes('Não é norma do condomínio'));
  ok('10 partes', (await p.locator('.cap').count()) === 10);

  // seção 6.1 com a tabela de garantias
  await p.locator('.cap-btn').nth(5).click(); await p.waitForTimeout(350);
  ok('tabela de garantias renderiza', (await p.locator('.tabela').count()) === 1);
  ok('18 linhas de garantia', (await p.locator('.tabela tbody tr').count()) === 18);
  const tb = await p.locator('.tabela tbody').textContent();
  ok('impermeabilizações 03 anos', tb.includes('Impermeabilizações') && tb.includes('03 anos'));
  ok('vistoria = defeito aparente', tb.includes('Defeito aparente'));

  // aviso de contato nas seções 8/9/10
  await p.locator('.cap-btn').nth(8).click(); await p.waitForTimeout(300);
  ok('quadro de materiais com aviso', (await p.locator('.tabela-aviso').count()) === 1);

  // busca no Manual
  await p.fill('#busca','garantia'); await p.waitForTimeout(400);
  ok('busca "garantia" no Manual acha 7 seções', (await p.locator('.res-item').count()) === 7);
  const secs = await p.locator('.res-item strong').allTextContents();
  ok('inclui a Seção 6.1, cujo texto é só a tabela', secs.includes('Seção 6.1'));
  ok('badge "Manual"', (await p.locator('.res-doc').first().textContent()) === 'Manual');
  ok('sem aviso cruzado no Manual', (await p.locator('.cruzado').count()) === 0);

  await p.fill('#busca','infiltracao'); await p.waitForTimeout(400);
  console.log('   "infiltracao" no Manual:', await p.locator('.res-cnt').textContent());

  // documentos normativos seguem íntegros
  await p.locator('.aba[data-doc="regimento"]').click(); await p.waitForTimeout(300);
  ok('Regimento: aviso cruzado volta', (await p.locator('.cruzado').count()) === 1);
  await p.fill('#busca',''); await p.waitForTimeout(300);
  ok('Regimento 88 artigos', (await p.locator('.doc-cabeca').textContent()).includes('88 artigos'));
  await p.locator('.aba[data-doc="convencao"]').click(); await p.waitForTimeout(300);
  ok('Convenção 67 artigos', (await p.locator('.doc-cabeca').textContent()).includes('67 artigos'));
  await p.locator('.aba[data-doc="legislacao"]').click(); await p.waitForTimeout(250);
  ok('Legislação 17 links', (await p.locator('.lei-item').count()) === 17);

  await p.setViewportSize({width:375,height:800}); await p.waitForTimeout(300);
  ok('sem overflow mobile', (await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth))===0);
  console.log('erros runtime:', erros.length?erros.join('|'):'nenhum');
  console.log('FIM|' + _n + '|' + _f);
  await b.close();
})();
