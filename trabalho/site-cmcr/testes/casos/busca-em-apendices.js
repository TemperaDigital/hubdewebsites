const { chromium } = require('../playwright-local');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport:{width:1000,height:1000}, deviceScaleFactor:1.5 });
  const erros=[]; p.on('pageerror', e=>erros.push(e.message));
  await p.goto(require('../alvo').exigir('BASE_URL'), {waitUntil:'domcontentloaded'}); await p.waitForTimeout(450);

  // A aba de partida é o Manual. Nenhum caso deve depender disso: quem precisa
  // de um documento escolhe a aba, senão reordenar as abas quebra a suíte
  // inteira por um motivo que nada tem a ver com o que cada caso verifica.
  await p.locator('.aba[data-doc="regimento"]').click(); await p.waitForTimeout(400);
  let _n=0, _f=0;
  const ok=(n,c)=>{_n++; if(!c)_f++; console.log((c?'✓':'✗')+' '+n);};

  // termos que só existem nos apêndices
  for (const [termo, esperado] of [['veneziana','Apêndice A'],['marfim','Apêndice A'],
                                   ['alisares','Apêndice A'],['tetra','Apêndice A']]) {
    await p.fill('#busca', termo); await p.waitForTimeout(320);
    const r = await p.locator('.res-item strong').allTextContents();
    ok(`"${termo}" acha o ${esperado} (${r.join(', ') || 'nada'})`, r.includes(esperado));
  }

  // abrir o resultado leva ao bloco do apêndice, com destaque
  await p.fill('#busca','veneziana'); await p.waitForTimeout(320);
  await p.locator('.res-item', { hasText:'Apêndice A' }).click(); await p.waitForTimeout(450);
  ok('bloco do apêndice abre', await p.locator('#regimento-ap-A .cap-corpo').isVisible());
  ok('termo destacado dentro do apêndice', (await p.locator('#regimento-ap-A mark').count()) >= 1);
  ok('botão de voltar aos resultados presente', (await p.locator('#voltar-busca').count()) === 1);

  // o Apêndice B (taxas) também
  await p.fill('#busca','tarifa'); await p.waitForTimeout(320);
  const rb = await p.locator('.res-item strong').allTextContents();
  ok('"tarifa" acha o Apêndice B ('+rb.join(', ')+')', rb.includes('Apêndice B'));

  // não quebrou a busca normal
  await p.fill('#busca','sindico'); await p.waitForTimeout(320);
  const rs = await p.locator('.res-item strong').allTextContents();
  ok('busca normal intacta ('+rs.length+' resultados, artigos primeiro)',
     rs.length > 15 && rs[0].startsWith('Art.'));
  ok('apêndices vêm depois dos artigos',
     rs.filter(x=>x.startsWith('Apêndice')).every(x => rs.indexOf(x) > rs.lastIndexOf(rs.filter(y=>y.startsWith('Art.')).pop())));

  // títulos e subtítulos também precisam ser encontráveis
  await p.locator('.aba[data-doc="manual"]').click(); await p.waitForTimeout(300);
  for (const [termo, secao] of [['prazos','Seção 6.1'],['apresentacao','Seção 1'],
                                ['assistencia tecnica','Seção 6.2']]) {
    await p.fill('#busca', termo); await p.waitForTimeout(320);
    const r = await p.locator('.res-item strong').allTextContents();
    ok(`"${termo}" acha a ${secao} pelo título (${r.slice(0,4).join(', ') || 'nada'})`, r.includes(secao));
  }
  await p.locator('.aba[data-doc="regimento"]').click(); await p.waitForTimeout(300);
  await p.fill('#busca','penalidades'); await p.waitForTimeout(320);
  ok('título de capítulo também indexa', (await p.locator('.res-item').count()) > 0);

  console.log('erros:', erros.length?erros.join('|'):'nenhum');
  console.log('FIM|' + _n + '|' + _f);
  await b.close();
})();
