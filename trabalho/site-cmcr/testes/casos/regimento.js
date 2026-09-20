const { chromium } = require('../playwright-local');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1000, height: 1100 }, deviceScaleFactor: 1.5 });
  const erros = []; p.on('pageerror', e => erros.push(e.message));
  await p.goto(require('../alvo').exigir('BASE_URL'), { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(500);
  let _n=0, _f=0;
  const ok = (n,c)=>{_n++; if(!c)_f++; console.log((c?'✓':'✗')+' '+n);};

  // A página se chama Normas Legais e tem saída: antes era um beco, só dava
  // para voltar pelo botão do navegador.
  ok('a página se chama Normas Legais',
     (await p.locator('.marca h1').textContent()).trim() === 'Normas Legais');

  // O logotipo vem da pasta acima (../assets). Caminho relativo entre pastas é
  // exatamente o que quebra numa mudança de estrutura, sem erro visível.
  const marca = p.locator('.marca-logo img');
  ok('logotipo do condomínio carregou no cabeçalho',
     await marca.evaluate(i => i.complete && i.naturalWidth > 0));
  // O navegador escolhe a fonte conforme a densidade da tela, então exigir 2x
  // do arquivo ESCOLHIDO só vale quando o teste roda a 2x — mede a densidade
  // do teste, não a qualidade da página. O que importa é haver no srcset um
  // arquivo grande o bastante para uma tela retina, e o escolhido cobrir a
  // densidade atual.
  const mres = await marca.evaluate(function (i) {
    var maior = (i.srcset || '').split(',')
      .map(function (c) { var m = c.trim().match(/(\d+)w$/); return m ? +m[1] : 0; })
      .reduce(function (a, b) { return Math.max(a, b); }, 0);
    var src = i.currentSrc || i.src;
    return new Promise(function (ok) {
      var im = new Image();
      im.onload = function () { ok({ maior: maior, escolhido: im.naturalWidth, exib: i.width, dpr: window.devicePixelRatio }); };
      im.onerror = function () { ok({ maior: maior, escolhido: 0, exib: i.width, dpr: window.devicePixelRatio }); };
      im.src = src;
    });
  });
  ok('logotipo do cabeçalho: o srcset oferece resolução para tela retina (' + mres.maior +
     'w disponível para ' + Math.round(mres.exib) + 'px exibidos)',
     mres.maior >= mres.exib * 2);
  ok('logotipo do cabeçalho: o arquivo escolhido cobre a densidade desta tela (' + mres.escolhido +
     'px para ' + Math.round(mres.exib) + '×' + mres.dpr + ')',
     mres.escolhido >= mres.exib * mres.dpr);
  ok('o quadradinho "MC" saiu do lugar do logotipo',
     (await p.locator('.marca-icone').count()) === 0);

  // Ler o atributo de um elemento ausente estoura, e um caso que estoura avisa
  // que algo quebrou sem dizer o quê. Só segue se o botão existir.
  const voltar = p.locator('.voltar-site');
  const temVoltar = (await voltar.count()) === 1;
  ok('existe botão de voltar ao site do condomínio', temVoltar);
  ok('o botão de voltar aponta para a página do condomínio',
     temVoltar && (await voltar.getAttribute('href')) === '../');
  ok('o botão de voltar é visível sem rolar a página',
     temVoltar && await voltar.isVisible());
  if (!temVoltar) { console.log('FIM|' + _n + '|' + _f); await b.close(); return; }

  // e leva mesmo a algum lugar — um href certo para uma página quebrada
  // continuaria sendo um beco
  await voltar.click();
  await p.waitForLoadState('domcontentloaded'); await p.waitForTimeout(400);
  const cheguei = await p.locator('h1').first().textContent();
  ok('clicar leva à página do condomínio (chegou em "' + cheguei.trim().slice(0, 40) + '")',
     /Monte Carlo|endereço para morar/i.test(cheguei));
  await p.goBack(); await p.waitForTimeout(500);

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
