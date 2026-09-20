// Três coisas que a página faz e que nenhum caso olhava:
//
//  1. O preâmbulo. É o texto de abertura de cada documento — na Convenção,
//     a escritura; no Regimento, a ligação com a Convenção. Apagá-lo não
//     fazia nenhuma asserção reclamar.
//  2. O tema claro/escuro. Alternar é pouco: o que importa é lembrar da
//     escolha na visita seguinte.
//  3. O rel dos links de legislação. Uma aba aberta com target="_blank" sem
//     rel="noopener" dá à página de destino acesso à janela de origem.
const { chromium } = require('../playwright-local');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport:{width:1000,height:1000} });
  const p = await ctx.newPage();
  const erros=[]; p.on('pageerror', e=>erros.push(e.message));
  const URL = require('../alvo').exigir('BASE_URL');
  await p.goto(URL, {waitUntil:'domcontentloaded'}); await p.waitForTimeout(450);
  let _n=0, _f=0;
  const ok=(n,c)=>{_n++; if(!c)_f++; console.log((c?'✓':'✗')+' '+n);};

  // --- preâmbulo ---------------------------------------------------------
  // Ler o texto de um elemento que não existe estoura, e um caso que morre
  // avisa que algo quebrou sem dizer o quê. Conferir a presença primeiro faz
  // a ausência do preâmbulo reprovar com nome.
  const texto = async () => {
    if (await p.locator('.preambulo').count() === 0) return null;
    return ((await p.locator('.preambulo').first().textContent()) || '').trim();
  };

  const preReg = await texto();
  ok('preâmbulo existe no Regimento', preReg !== null);
  ok('preâmbulo do Regimento é o texto do documento ("'+String(preReg).slice(0,42)+'…")',
     preReg !== null && preReg.includes('parte integrante da Convenção'));

  await p.locator('.aba[data-doc="convencao"]').click(); await p.waitForTimeout(400);
  const preConv = await texto();
  ok('preâmbulo existe na Convenção', preConv !== null);
  ok('preâmbulo da Convenção é a escritura ("'+String(preConv).slice(0,42)+'…")',
     preConv !== null && /ESCRITURA PARTICULAR DE CONVEN/i.test(preConv));
  ok('os dois preâmbulos são diferentes',
     preReg !== null && preConv !== null && preReg !== preConv && preReg.length > 40);

  // --- tema claro/escuro -------------------------------------------------
  await p.locator('.aba[data-doc="regimento"]').click(); await p.waitForTimeout(300);
  const antes = await p.evaluate(() => document.documentElement.dataset.theme || '(do sistema)');
  await p.locator('#btn-tema').click(); await p.waitForTimeout(250);
  const depois = await p.evaluate(() => document.documentElement.dataset.theme);
  ok('o botão troca o tema ('+antes+' -> '+depois+')', !!depois && depois !== antes);
  ok('o tema aplicado é claro ou escuro, não um valor solto',
     depois === 'dark' || depois === 'light');

  const gravado = await p.evaluate(() => { try { return localStorage.getItem('mcr-tema'); }
                                           catch (e) { return '(sem acesso)'; } });
  ok('a escolha é gravada ('+gravado+')', gravado === depois);

  // o que realmente importa: lembrar na visita seguinte
  await p.reload({waitUntil:'domcontentloaded'}); await p.waitForTimeout(400);
  const aoVoltar = await p.evaluate(() => document.documentElement.dataset.theme);
  ok('o tema sobrevive ao recarregar ('+aoVoltar+')', aoVoltar === depois);

  // e alternar de volta também precisa ficar gravado
  await p.locator('#btn-tema').click(); await p.waitForTimeout(250);
  const terceiro = await p.evaluate(() => ({
    tema: document.documentElement.dataset.theme,
    salvo: (function(){ try { return localStorage.getItem('mcr-tema'); } catch(e){ return null; } })()
  }));
  ok('voltar ao tema anterior também grava ('+terceiro.tema+')',
     terceiro.tema !== depois && terceiro.salvo === terceiro.tema);

  // --- links externos ----------------------------------------------------
  await p.locator('.aba[data-doc="legislacao"]').click(); await p.waitForTimeout(400);
  const links = await p.locator('.lei-item').evaluateAll(as => as.map(a => ({
    rot: (a.querySelector('.lei-rot') || {}).textContent || a.href,
    rel: a.getAttribute('rel') || '',
    alvo: a.getAttribute('target') || '',
    href: a.getAttribute('href') || ''
  })));
  ok('a aba de legislação tem links ('+links.length+')', links.length >= 17);

  const semNoopener = links.filter(l => !l.rel.includes('noopener'));
  ok('todo link externo tem rel="noopener"' +
     (semNoopener.length ? ' — faltou em: ' + semNoopener.map(l=>l.rot).join(', ') : ''),
     semNoopener.length === 0);

  const semNoreferrer = links.filter(l => !l.rel.includes('noreferrer'));
  ok('todo link externo tem rel="noreferrer"', semNoreferrer.length === 0);

  const semBlank = links.filter(l => l.alvo !== '_blank');
  ok('todo link externo abre em aba nova', semBlank.length === 0);

  const foraDoHttps = links.filter(l => !/^https:\/\//.test(l.href));
  ok('nenhum link de legislação aponta para http sem cifra' +
     (foraDoHttps.length ? ' — ' + foraDoHttps.map(l=>l.href).join(', ') : ''),
     foraDoHttps.length === 0);

  console.log('erros:', erros.length?erros.join('|'):'nenhum');
  console.log('FIM|' + _n + '|' + _f);
  await b.close();
})();
