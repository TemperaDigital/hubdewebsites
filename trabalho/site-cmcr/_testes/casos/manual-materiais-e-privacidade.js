const { chromium } = require('../playwright-local');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1000, height: 1100 }, deviceScaleFactor: 1.5 });
  const erros=[]; p.on('pageerror', e=>erros.push(e.message));
  await p.goto(require('../alvo').exigir('BASE_URL'), { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(500);
  let _n=0, _f=0;
  const ok=(n,c)=>{_n++; if(!c)_f++; console.log((c?'✓':'✗')+' '+n);};

  await p.locator('.aba[data-doc="manual"]').click(); await p.waitForTimeout(350);
  ok('Manual: aviso não-normativo + nota de conferência', (await p.locator('.alerta').first().textContent()).includes('não é norma do condomínio') && (await p.locator('.alerta').first().textContent()).includes('conferidos diretamente nas imagens'));
  ok('sem avisos de tabela perdida', (await p.locator('.aviso-tabela').count()) === 0);

  // Seções 8 e 9: listas de contato removidas, com nota explicando a ausência
  for (const [i,nome] of [[7,'8 (autores dos projetos)'],[8,'9 (fornecedores)']]) {
    await p.locator('.cap-btn').nth(i).click(); await p.waitForTimeout(350);
    ok(`Seção ${nome} sem tabela`, (await p.locator('.cap-corpo .tabela').count()) === 0);
    ok(`Seção ${nome} explica a ausência`,
       (await p.locator('.cap-corpo').textContent()).includes('Não foi publicada aqui'));
    await p.locator('.cap-btn').nth(i).click(); await p.waitForTimeout(200);
  }
  // Seção 10: ficam as especificações, sem telefone e sem e-mail
  await p.locator('.cap-btn').nth(9).click(); await p.waitForTimeout(350);
  ok('quadro de materiais com 16 linhas', (await p.locator('.cap-corpo .tabela tbody tr').count()) === 16);
  ok('3 colunas (sem telefone/e-mail)', (await p.locator('.cap-corpo .tabela thead th').count()) === 3);
  const mat = await p.locator('.cap-corpo .tabela').textContent();
  ok('referência do material preservada', mat.includes('Porcelanato Durato') && mat.includes('Fck 30 MPa'));
  ok('nenhum telefone no quadro', !/\(\d{2}\)\s?\d{4,5}-\d{4}/.test(mat));
  ok('nenhum e-mail no quadro', !/@/.test(mat));
  await p.locator('.cap-btn').nth(9).click(); await p.waitForTimeout(200);

  // busca por fornecedor / material
  for (const t of ['otis','tintas','deca','porcelanato','elevador']) {
    await p.fill('#busca', t); await p.waitForTimeout(350);
    console.log(`   "${t}" -> ${await p.locator('.res-cnt').textContent()}`);
  }
  await p.fill('#busca','tintas'); await p.waitForTimeout(350);
  await p.locator('.res-item').first().click(); await p.waitForTimeout(400);
  ok('clique abre a seção com a tabela', (await p.locator('.tabela').count()) === 1);
  ok('destaque dentro da tabela', (await p.locator('.tabela mark').count()) >= 2);

  await p.fill('#busca',''); await p.waitForTimeout(300);
  await p.locator('.aba[data-doc="convencao"]').click(); await p.waitForTimeout(300);
  ok('Convenção intacta', (await p.locator('.doc-cabeca').textContent()).includes('67 artigos'));
  await p.setViewportSize({width:375,height:800}); await p.waitForTimeout(300);
  ok('sem overflow mobile', (await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth))===0);
  console.log('erros:', erros.length?erros.join('|'):'nenhum');
  console.log('FIM|' + _n + '|' + _f);
  await b.close();
})();
