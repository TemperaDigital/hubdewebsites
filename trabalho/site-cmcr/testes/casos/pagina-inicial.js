const { chromium } = require('../playwright-local');
const URL = require('../alvo').exigir('HOME_URL');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport:{width:1100,height:1000}, deviceScaleFactor:1.5 });
  const erros=[]; p.on('pageerror', e=>erros.push(e.message));
  p.on('console', m => { if (m.type()==='error' && !m.text().includes('CERT')) erros.push('console: '+m.text()); });
  await p.goto(URL, {waitUntil:'domcontentloaded'}); await p.waitForTimeout(600);
  let _n=0, _f=0;
  const ok=(n,c)=>{_n++; if(!c)_f++; console.log((c?'✓':'✗')+' '+n);};

  // logotipo
  const logo = p.locator('.marca img');
  ok('logotipo carregou', await logo.evaluate(i => i.complete && i.naturalWidth > 0));
  ok('logotipo tem alt', (await logo.getAttribute('alt')) === 'Monte Carlo Residence');

  // Fixar a largura exata congelaria a arte: trocar o logotipo mudaria o
  // número sem que nada estivesse errado. O que não pode mudar é a imagem
  // sair esticada, sair borrada por falta de resolução, ou aparecer num
  // tamanho que denuncie conta errada.
  const m = await logo.evaluate(i => ({
    nw: i.naturalWidth, nh: i.naturalHeight, w: i.width, h: i.height
  }));
  const distorcao = Math.abs((m.w / m.h) - (m.nw / m.nh));
  ok('logotipo não sai esticado (proporção '+(m.w/m.h).toFixed(3)+
     ' contra '+(m.nw/m.nh).toFixed(3)+')', distorcao < 0.01);
  // O navegador escolhe a fonte conforme a densidade da tela, então exigir 2x
  // do arquivo ESCOLHIDO só vale quando o teste roda a 2x — mede a densidade
  // do teste, não a qualidade da página. O que importa é haver no srcset um
  // arquivo grande o bastante para uma tela retina, e o escolhido cobrir a
  // densidade atual.
  const res = await logo.evaluate(function (i) {
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
  ok('logotipo: o srcset oferece resolução para tela retina (' + res.maior +
     'w disponível para ' + Math.round(res.exib) + 'px exibidos)',
     res.maior >= res.exib * 2);
  ok('logotipo: o arquivo escolhido cobre a densidade desta tela (' + res.escolhido +
     'px para ' + Math.round(res.exib) + '×' + res.dpr + ')',
     res.escolhido >= res.exib * res.dpr);
  ok('logotipo ocupa o cabeçalho sem exagero ('+Math.round(m.w)+'px)',
     m.w >= 280 && m.w <= 340);

  // o ícone da aba precisa existir de verdade, não só estar declarado
  const icone = await p.locator('link[rel="icon"]').getAttribute('href');
  const respIcone = await p.evaluate(u => fetch(u).then(r => r.status).catch(() => 0), icone);
  ok('ícone da aba existe ('+icone+' -> '+respIcone+')', respIcone === 200);

  // link real para a base
  const links = await p.locator('a[href="base-conhecimento/"]').count();
  ok(`${links} links para as Normas e Informativos`, links >= 3);
  const resp = await p.request.get(URL + 'base-conhecimento/');
  ok('o link resolve de verdade (HTTP '+resp.status()+')', resp.status() === 200);

  // horários vindos do regimento
  const cards = await p.locator('.area-card').count();
  ok(`${cards} espaços com horário, lidos do Regimento`, cards === 6);
  const nomes = await p.locator('.area-nome').allTextContents();
  console.log('   espaços:', nomes.join(' · '));
  const salao = await p.locator('.area-card').first().textContent();
  ok('horário do salão confere com o quadro', salao.includes('09h às 00h') && salao.includes('09h às 02h'));
  ok('observação do espaço aparece', (await p.locator('.area-obs').count()) >= 2);
  const mud = await p.locator('.area-card').last().textContent();
  ok('sábado das mudanças é 09h às 12h', mud.includes('09h às 12h'));

  // números derivados da convenção
  ok('unidades contadas = 76', (await p.locator('[data-num="unidades"]').textContent()) === '76');
  ok('vagas somadas = 79', (await p.locator('[data-num="vagas"]').textContent()) === '79');
  ok('nota explica a origem', (await p.locator('#nota-num').textContent()).includes('Art. 6º'));

  // navegação
  await p.locator('.menu a[href="#areas"]').click(); await p.waitForTimeout(600);
  ok('âncora do menu funciona', await p.locator('#areas').isVisible());

  // Fixar o hex da marca não media nada: o site pode trocar de paleta e continuar
  // correto. O que não pode mudar é o texto do cartão ficar ilegível sobre ele.
  const contraste = await p.locator('.base-card').evaluate(function (card) {
    function lum(rgb) {
      var c = rgb.map(function (v) {
        v = v / 255;
        return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    }
    function trio(txt) {
      var m = txt.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
      return m ? [+m[1], +m[2], +m[3]] : null;
    }
    var fundo = trio(getComputedStyle(card).backgroundImage);
    var alvo = card.querySelector('.base-texto > p');
    var frente = trio(getComputedStyle(alvo).color);
    if (!fundo || !frente) return -1;
    var a = lum(fundo), b = lum(frente);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  });
  ok('texto do cartão da base tem contraste >= 4.5:1 (mediu ' + contraste.toFixed(2) + ')',
     contraste >= 4.5);

  await p.screenshot({ path: require('path').join(__dirname, '..', '_saida', 'home-desktop.png'), fullPage:true });

  // celular
  await p.setViewportSize({width:375,height:820}); await p.waitForTimeout(400);
  ok('sem rolagem horizontal no celular',
     (await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth))===0);
  await p.screenshot({ path: require('path').join(__dirname, '..', '_saida', 'home-mobile.png'), fullPage:true });

  console.log('erros:', erros.length?erros.join('|'):'nenhum');
  console.log('FIM|' + _n + '|' + _f);
  await b.close();
})();
