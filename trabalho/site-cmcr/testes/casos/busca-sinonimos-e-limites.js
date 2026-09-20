// Duas regras da busca que nenhum caso travava, e que a auditoria por mutação
// mostrou passarem despercebidas:
//
//  1. Os sinônimos. "cachorro" não aparece uma única vez no Regimento — quem
//     digita essa palavra só acha alguma coisa porque a tabela de sinônimos a
//     liga a "animal", "animais" e "cães". Quebrar a tabela zerava a busca e
//     a suíte continuava verde.
//
//  2. O limite de palavra. "pet" tem três letras e precisa casar com palavra
//     inteira, senão encontra "peteca" — que existe no Art. 41º, sobre a
//     piscina. Esse bug já existiu, foi consertado, e nada impedia que
//     voltasse.
const { chromium } = require('../playwright-local');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport:{width:1000,height:1000}, deviceScaleFactor:1.5 });
  const erros=[]; p.on('pageerror', e=>erros.push(e.message));
  await p.goto(require('../alvo').exigir('BASE_URL'), {waitUntil:'domcontentloaded'});
  await p.waitForTimeout(450);

  // A aba de partida é o Manual. Nenhum caso deve depender disso: quem precisa
  // de um documento escolhe a aba, senão reordenar as abas quebra a suíte
  // inteira por um motivo que nada tem a ver com o que cada caso verifica.
  await p.locator('.aba[data-doc="regimento"]').click(); await p.waitForTimeout(400);
  let _n=0, _f=0;
  const ok=(n,c)=>{_n++; if(!c)_f++; console.log((c?'✓':'✗')+' '+n);};
  const buscar = async (termo) => {
    await p.fill('#busca', termo); await p.waitForTimeout(340);
    return p.locator('.res-item strong').allTextContents();
  };

  // --- sinônimos ---------------------------------------------------------
  // A premissa do caso: a palavra digitada não está no documento. Se um dia
  // ela passar a estar, este caso deixa de provar o que se propõe — por isso
  // a premissa é verificada, não suposta.
  const temCachorro = await p.evaluate(() =>
    window.DADOS_REGIMENTO.artigos.some(a => a.busca.includes('cachorro')));
  ok('premissa: "cachorro" não aparece no texto do Regimento', temCachorro === false);

  const rc = await buscar('cachorro');
  ok('"cachorro" acha artigos mesmo sem a palavra existir no documento ('+
     (rc.join(', ')||'nada')+')', rc.length > 0);
  for (const art of ['Art. 12º','Art. 15º','Art. 47º']) {
    ok('"cachorro" chega ao '+art+' pelos sinônimos', rc.includes(art));
  }

  // o verbete é "cachorro"; digitar no plural precisa cair nele
  const rcp = await buscar('cachorros');
  ok('"cachorros" no plural cai no mesmo verbete ('+(rcp.join(', ')||'nada')+')',
     rcp.includes('Art. 12º'));

  // --- limite de palavra -------------------------------------------------
  const temPeteca = await p.evaluate(() => {
    const a = window.DADOS_REGIMENTO.artigos.find(x => x.n === 41);
    return !!a && a.busca.includes('peteca');
  });
  ok('premissa: "peteca" está no Art. 41º', temPeteca === true);

  const rp = await buscar('pet');
  ok('"pet" acha os artigos de animais ('+(rp.join(', ')||'nada')+')', rp.includes('Art. 12º'));
  ok('"pet" NÃO acha o Art. 41º, que só tem "peteca"', rp.includes('Art. 41º') === false);

  // e o destaque não pode grifar um pedaço de palavra maior
  await p.fill('#busca','pet'); await p.waitForTimeout(340);
  const dentroDeOutra = await p.evaluate(() => {
    const marcas = Array.from(document.querySelectorAll('.res-item mark'));
    return marcas.some(m => {
      const inteiro = (m.parentElement.textContent || '');
      const i = inteiro.indexOf(m.textContent);
      if (i < 0) return false;
      const depois = inteiro[i + m.textContent.length] || ' ';
      return /[a-zà-ú0-9]/i.test(depois);
    });
  });
  ok('nenhum destaque cai no meio de uma palavra maior', dentroDeOutra === false);

  // "cão" também é curto e não pode achar "aplicação"
  const rcao = await buscar('cao');
  const achouAplicacao = await p.evaluate(() =>
    Array.from(document.querySelectorAll('.res-item mark'))
      .some(m => /aplica/i.test(m.parentElement.textContent || '')
                 && m.textContent.toLowerCase() === 'ção'));
  ok('"cao" não grifa o fim de "aplicação" ('+rcao.length+' resultados)', achouAplicacao === false);

  console.log('erros:', erros.length?erros.join('|'):'nenhum');
  console.log('FIM|' + _n + '|' + _f);
  await b.close();
})();
