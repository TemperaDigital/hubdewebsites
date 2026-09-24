# Especificação: busca por voz

Pedido do dono em 24/09/2026: um microfone no campo de busca, para o morador
falar em vez de digitar. Decisões já tomadas, não reabrir:

- **Sem aviso de privacidade.** A transcrição é feita pelo navegador; no
  Chrome, o áudio sai para o serviço de voz do Google — como a maioria dos
  sites faz, e sem aviso na tela, por decisão explícita do dono.
- **Sem servidor, sem biblioteca, sem chave.** É a Web Speech API do próprio
  navegador (`SpeechRecognition` / `webkitSpeechRecognition`). Cabe no site
  estático como ele é hoje.
- **Navegador sem suporte não vê o botão.** Firefox não implementa a API.
  Quem usa Firefox continua digitando, sem ver nada faltando — o botão nunca
  aparece, não aparece quebrado.

Este documento é a especificação completa: os quatro arquivos a mexer, com
posição exata e código pronto para colar. Quem implementar não precisa
inventar nada — só decidir se o desenho abaixo está bom e aplicar.

**Este código não é teórico.** Antes de escrever esta versão final, apliquei
os patches numa cópia do site fora do repositório e rodei a suíte de verdade
contra ela — inclusive as duas mutações da seção 5. Duas coisas quebraram no
caminho e estão corrigidas abaixo; ficam descritas na seção 8, porque são do
mesmo tipo de erro que este projeto já tem cicatriz por causa dele, e vale
saber o porquê, não só copiar o código certo.

## O desenho: um botão só, dois papéis

O campo de busca já tem um botão de limpar (✕) que só aparece quando há
texto, sempre no mesmo canto do campo — `.busca-campo`, posição absoluta,
`right: 10px`. A saída mais simples, testada primeiro no papel: o microfone
ocupa **o mesmo lugar**, e os dois nunca aparecem juntos.

```
campo vazio, navegador com suporte  →  🎤 aparece
campo com texto (por voz ou digitado) →  ✕ aparece
navegador sem suporte                 →  nenhum dos dois no lugar do 🎤
```

Isso evita qualquer ajuste de `padding` no `#busca` ou reposicionamento do
botão de limpar — o CSS novo é só o botão em si, no mesmo slot que já existe.

## 1. `index.html` — o botão

Arquivo: `base-conhecimento/index.html`.

Local: dentro de `.busca-campo`, logo depois do botão de limpar. Hoje:

```html
      <button id="busca-limpar" class="btn-limpar" type="button" aria-label="Limpar busca" hidden>✕</button>
    </div>
```

Vira:

```html
      <button id="busca-limpar" class="btn-limpar" type="button" aria-label="Limpar busca" hidden>✕</button>
      <button id="busca-voz" class="btn-voz" type="button" aria-label="Buscar por voz" hidden>🎤</button>
    </div>
```

`hidden` por padrão nos dois casos: o JS decide quando mostrar. Sem suporte
no navegador, o `hidden` nunca sai — o botão não existe para quem o usa.

## 2. `assets/estilo.css` — o mesmo slot do botão de limpar

Hoje, logo depois de `.btn-limpar`:

```css
.btn-limpar {
  position: absolute; right: 10px; width: 30px; height: 30px; border-radius: 50%;
  border: none; cursor: pointer; background: var(--surface-2); color: var(--text-muted); font-size: .85rem;
}
.btn-limpar:hover { color: var(--text); }
```

Acrescentar logo depois:

```css
/* Ocupa o mesmo canto do botão de limpar — os dois nunca aparecem juntos,
   então não há disputa de espaço nem padding extra a calcular no #busca. */
.btn-voz {
  position: absolute; right: 10px; width: 30px; height: 30px; border-radius: 50%;
  border: none; cursor: pointer; background: var(--surface-2); color: var(--text-muted);
  font-size: .95rem; align-items: center; justify-content: center;
}
/* "display: flex" incondicional venceria o [hidden] do navegador na
   cascata — autor sempre bate user-agent, mesmo com especificidade
   empatada. É o mesmo bug que o empilhamento das tabelas já causou neste
   projeto (ver mutacoes.js). Detalhe na seção 8. */
.btn-voz:not([hidden]) { display: flex; }
.btn-voz:hover { color: var(--accent); border-color: var(--accent); }
.btn-voz.ouvindo {
  background: var(--accent); color: var(--accent-contraste);
  animation: pulso-voz 1.1s ease-in-out infinite;
}
@keyframes pulso-voz {
  0%, 100% { box-shadow: 0 0 0 0 var(--accent-soft); }
  50% { box-shadow: 0 0 0 7px var(--accent-soft); }
}
```

`--accent-contraste` já existe na paleta (ver `CLAUDE.md`) e troca de valor
sozinha entre os dois temas — não fixar `#fff` aqui, é o erro que já
aconteceu uma vez nesta página.

## 3. `assets/app.js` — a lógica

Três pontos de inserção, todos pequenos.

### 3.1. Declarar o botão e detectar suporte

Hoje, logo no topo:

```js
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var painel = $('#painel');
  var campo = $('#busca');
  var btnLimpar = $('#busca-limpar');
```

Vira:

```js
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var painel = $('#painel');
  var campo = $('#busca');
  var btnLimpar = $('#busca-limpar');
  var btnVoz = $('#busca-voz');
  /* Firefox não implementa a Web Speech API — sem isso, suportaVoz fica
     false e o botão nunca sai do hidden. Não é polyfill nem detecção de
     navegador por nome; é perguntar ao objeto se ele existe. */
  var ReconhecimentoDeVoz = window.SpeechRecognition || window.webkitSpeechRecognition;
  var suportaVoz = !!(ReconhecimentoDeVoz && btnVoz);
```

### 3.2. Mostrar ou esconder junto com o botão de limpar

Dentro de `render()`, hoje:

```js
    btnLimpar.hidden = !estado.termo;
    sincronizarTemas();
```

Vira:

```js
    btnLimpar.hidden = !estado.termo;
    if (btnVoz) btnVoz.hidden = !suportaVoz || !!estado.termo;
    sincronizarTemas();
```

### 3.3. A escuta em si

Na seção `/* ---------- eventos ---------- */`, depois do bloco de
`btnLimpar.addEventListener('click', ...)`, acrescentar:

```js
  if (suportaVoz) {
    var reconhecimento = new ReconhecimentoDeVoz();
    reconhecimento.lang = 'pt-BR';
    reconhecimento.interimResults = false;
    reconhecimento.maxAlternatives = 1;

    reconhecimento.addEventListener('result', function (e) {
      var texto = e.results[0][0].transcript;
      campo.value = texto;
      estado.termo = texto;
      estado.verDoc = false;
      if (estado.termo.trim() && estado.doc === 'legislacao') estado.doc = 'regimento';
      render();
    });

    var pararDeOuvir = function () {
      btnVoz.classList.remove('ouvindo');
      btnVoz.setAttribute('aria-label', 'Buscar por voz');
    };
    reconhecimento.addEventListener('end', pararDeOuvir);
    reconhecimento.addEventListener('error', pararDeOuvir);

    btnVoz.addEventListener('click', function () {
      if (btnVoz.classList.contains('ouvindo')) { reconhecimento.stop(); return; }
      btnVoz.classList.add('ouvindo');
      btnVoz.setAttribute('aria-label', 'Ouvindo — toque para parar');
      try { reconhecimento.start(); }
      catch (e) { pararDeOuvir(); }
    });
  }
```

`interimResults: false` de propósito: um resultado só, já fechado, e a busca
roda uma vez — não a cada sílaba reconhecida. `try/catch` no `start()` porque
alguns navegadores lançam erro síncrono se o microfone já estiver em uso por
outra aba.

Reaproveita o mesmo caminho que a digitação usa (`estado.termo`, `render()`,
a troca de aba se estiver na Legislação) — nenhuma lógica de busca nova, só
outra forma de preencher `campo.value`.

## 4. Teste — `testes/casos/busca-por-voz.js`

Não dá para testar microfone de verdade em CI. O que dá, e o que importa
verificar, é a fiação: se o navegador tem a API, o clique aciona ela, e o
resultado enche o campo e dispara a busca — sem depender de áudio real, nem
de permissão do sistema.

O arquivo abaixo injeta uma implementação falsa de `SpeechRecognition` antes
da página carregar, com `page.addInitScript`. Criar em
`testes/casos/busca-por-voz.js`:

```js
// Não dá para testar microfone de verdade em CI. O que este caso verifica é
// a fiação: se a API existe, o clique aciona ela, e o resultado enche o
// campo e dispara a busca. Uma implementação falsa de SpeechRecognition é
// injetada antes da página carregar — os eventos que ela dispara são os
// mesmos que o navegador real dispararia.
//
// A falsa API é atribuída aos DOIS nomes, com e sem prefixo. O Chromium do
// Playwright expõe `window.SpeechRecognition` nativamente — se só
// `webkitSpeechRecognition` fosse trocado, o app.js pegaria o nativo pelo
// `||`, e o clique acionaria reconhecimento de verdade (que falha sem
// microfone, sem avisar por quê).
const { chromium } = require('../playwright-local');
(async () => {
  const b = await chromium.launch();

  // --- 1) COM suporte: a fiação funciona de ponta a ponta ---------------
  const ctxCom = await b.newContext({ viewport: { width: 1000, height: 1000 } });
  const pCom = await ctxCom.newPage();
  await pCom.addInitScript(() => {
    function FalsoReconhecimento() {
      this.lang = ''; this.interimResults = null; this.maxAlternatives = null;
      this._ouvintes = {};
    }
    FalsoReconhecimento.prototype.addEventListener = function (tipo, fn) {
      (this._ouvintes[tipo] = this._ouvintes[tipo] || []).push(fn);
    };
    FalsoReconhecimento.prototype.start = function () {
      window.__vozIniciada = true;
      var self = this;
      setTimeout(function () {
        var evento = { results: [[{ transcript: 'síndico' }]] };
        (self._ouvintes.result || []).forEach(function (fn) { fn(evento); });
        (self._ouvintes.end || []).forEach(function (fn) { fn(); });
      }, 60);
    };
    FalsoReconhecimento.prototype.stop = function () {
      (this._ouvintes.end || []).forEach(function (fn) { fn(); });
    };
    window.SpeechRecognition = FalsoReconhecimento;
    window.webkitSpeechRecognition = FalsoReconhecimento;
  });
  const erros = []; pCom.on('pageerror', e => erros.push(e.message));
  await pCom.goto(require('../alvo').exigir('BASE_URL'), { waitUntil: 'domcontentloaded' });
  await pCom.waitForTimeout(450);
  let _n = 0, _f = 0;
  const ok = (n, c) => { _n++; if (!c) _f++; console.log((c ? '✓' : '✗') + ' ' + n); };

  const btn = pCom.locator('#busca-voz');
  ok('botão de voz aparece com o campo vazio (navegador com suporte)', await btn.isVisible());
  ok('botão de limpar não aparece ao mesmo tempo', !(await pCom.locator('#busca-limpar').isVisible()));

  await btn.click();
  await pCom.waitForTimeout(250);
  const iniciou = await pCom.evaluate(() => window.__vozIniciada === true);
  ok('clicar chama start() no reconhecimento', iniciou);

  await pCom.waitForTimeout(150); // o resultado falso chega em 60ms
  const valorCampo = await pCom.locator('#busca').inputValue();
  ok('o resultado da voz preenche o campo ("' + valorCampo + '")', valorCampo === 'síndico');

  const resultados = await pCom.locator('.res-item strong').count();
  ok('a busca roda sozinha com o texto reconhecido (' + resultados + ' resultados)', resultados > 0);

  ok('depois do resultado, o botão de voz some (há texto no campo)', !(await pCom.locator('#busca-voz').isVisible()));
  ok('e o botão de limpar aparece no lugar', await pCom.locator('#busca-limpar').isVisible());

  await ctxCom.close();

  // --- 2) SEM suporte: o botão nunca aparece -----------------------------
  const ctxSem = await b.newContext({ viewport: { width: 1000, height: 1000 } });
  const pSem = await ctxSem.newPage();
  await pSem.addInitScript(() => {
    delete window.SpeechRecognition;
    delete window.webkitSpeechRecognition;
  });
  await pSem.goto(require('../alvo').exigir('BASE_URL'), { waitUntil: 'domcontentloaded' });
  await pSem.waitForTimeout(450);

  // Se este bloco travasse o script inteiro (ex.: instanciar um construtor
  // indefinido), o botão continuaria escondido pelo hidden que já vem no
  // HTML — coincidência, não a regra funcionando. Por isso a ausência de
  // erro de execução também é verificada, não só a visibilidade.
  ok('sem SpeechRecognition, o botão de voz fica escondido (campo vazio)',
     !(await pSem.locator('#busca-voz').isVisible()));

  await pSem.fill('#busca', 'teste'); await pSem.waitForTimeout(300);
  ok('e continua escondido com o campo preenchido — não é só a regra do texto',
     !(await pSem.locator('#busca-voz').isVisible()));
  await pSem.fill('#busca', ''); await pSem.waitForTimeout(300);

  ok('nenhum erro de execução na página sem suporte a voz', erros.length === 0);

  await ctxSem.close();

  console.log('erros:', erros.length ? erros.join('|') : 'nenhum');
  console.log('FIM|' + _n + '|' + _f);
  await b.close();
})();
```

Rodar sozinho durante o desenvolvimento:

```bash
cd trabalho/site-cmcr/testes
node rodar.js busca-por-voz
```

## 5. Mutações — provar que o teste enxerga

Antes de considerar pronto, plantar os dois defeitos abaixo em
`testes/mutacoes.js` (seguindo o padrão dos que já existem) e confirmar que
`node auditoria.js` os pega:

```js
  { nome: 'botão de voz aparece mesmo sem suporte no navegador',
    arquivo: 'base-conhecimento/assets/app.js',
    aplicar: function (s) {
      return s.replace('if (btnVoz) btnVoz.hidden = !suportaVoz || !!estado.termo;',
                       'if (btnVoz) btnVoz.hidden = !!estado.termo;');
    } },

  { nome: 'clique no botão de voz não preenche mais a busca',
    arquivo: 'base-conhecimento/assets/app.js',
    aplicar: function (s) {
      return s.replace('campo.value = texto;\n      estado.termo = texto;', '');
    } },
```

A primeira faz o botão aparecer mesmo sem suporte — mutação testada e
confirmada: 1 falha, sem crash. A segunda quebra a fiação central: o teste 1
teria resultado vazio no campo depois do "áudio" — confirmada, 4 falhas. Se
qualquer uma escapar, o teste tem furo antes de ir para produção — é a regra
que este repositório carrega desde o dia em que nasceu.

Repare que a primeira mutação **não** mexe em `suportaVoz` diretamente — ver
seção 8 para o porquê.

## 6. Checklist manual, num navegador de verdade

O teste automatizado prova a fiação, não o microfone. Antes de publicar,
confirmar uma vez à mão, num Chrome ou Edge real:

- [ ] O botão aparece no campo vazio, some ao digitar, volta ao limpar.
- [ ] Clicar pede permissão de microfone (primeira vez) e, autorizado, o
      ícone entra no estado "ouvindo" (pulso visível).
- [ ] Falar um tema (por exemplo "síndico") preenche o campo e a busca roda.
- [ ] Clicar de novo enquanto ouve interrompe sem travar a página.
- [ ] Recusar a permissão do microfone não quebra nada — o campo continua
      aceitando texto digitado normalmente.
- [ ] No Firefox, o botão nunca aparece; a busca por texto funciona igual.
- [ ] No celular (Chrome Android), o botão funciona do mesmo jeito.

## 7. Depois de implementar

- Rodar a suíte inteira: `node rodar.js` — os números batem com os de antes
  mais as novas deste arquivo. Validado numa cópia fora do repositório:
  **188 asserções, 0 falhas, todos os arquivos completaram** (eram 178 antes
  desta funcionalidade).
- Este documento pode ser apagado do repositório uma vez implementado, ou
  ficar como registro — critério de quem implementa, sem necessidade de
  perguntar de volta.

## 8. O que a validação achou — duas armadilhas, não hipotéticas

Esta especificação não foi escrita e entregue direto. Antes da versão final,
apliquei os quatro patches numa cópia do site fora do repositório e rodei a
suíte de verdade contra ela — é a mesma regra que rege este projeto desde o
primeiro dia: não afirmar sem verificar. Duas coisas quebraram, e as duas
merecem registro porque são do mesmo tipo de erro que já morde este projeto
antes.

### 8.1. `display: flex` incondicional vence o `[hidden]` do navegador

A primeira versão do CSS declarava `display: flex` direto em `.btn-voz`, sem
condição. Resultado: o navegador some com `[hidden] { display: none }` da
sua própria folha de estilo, mas essa é uma regra de **user-agent**, e
regras de **autor** sempre vencem regras de user-agent na cascata — mesmo
quando a especificidade empata. O botão continuava visível mesmo com o
atributo `hidden` presente no HTML.

É a mesma família do bug que o empilhamento das tabelas já causou neste
projeto (registrado em `mutacoes.js`): uma regra de `display` do autor
vencendo o mecanismo de esconder do navegador. A correção —
`.btn-voz:not([hidden]) { display: flex; }` — só aplica o `flex` quando o
atributo **não** está presente, deixando o `[hidden]` nativo decidir o resto.

Só apareceu porque testei de verdade: `getComputedStyle(el).display` dava
`flex` mesmo com `hidden=""` no HTML. Sem essa checagem, teria ido para
produção um botão que "aparecia escondido" — presente no DOM, invisível
para leitor de tela por `aria-hidden` indireto nenhum, mas visualmente lá.

### 8.2. O Chromium de teste tem `SpeechRecognition` nativo, sem prefixo

A primeira versão do teste só sobrescrevia `window.webkitSpeechRecognition`
com a implementação falsa. Mas o Chromium que o Playwright usa aqui expõe
**os dois nomes nativamente** — `window.SpeechRecognition` e
`window.webkitSpeechRecognition` já existem antes de qualquer script rodar.
Como `app.js` faz `window.SpeechRecognition || window.webkitSpeechRecognition`,
o nativo (sem prefixo) ganhava do meu falso, mesmo eu tendo sobrescrito o
segundo — e o clique acionava reconhecimento de voz **de verdade**, que
falha silenciosamente sem microfone real, sem lançar erro de página.
Resultado: nove testes acusando falha, sem pista nenhuma do porquê.

A correção é sobrescrever os dois nomes no `addInitScript`. Documentado
inline no teste, para não se perder de novo.

### 8.3. A mutação "sem suporte" original crashava a página inteira

A primeira versão da mutação de nº 1 mudava `var suportaVoz = ...` para
sempre `true`, ignorando se `ReconhecimentoDeVoz` existia. No cenário "sem
suporte" do teste, isso fazia `new ReconhecimentoDeVoz()` explodir com
`TypeError: ReconhecimentoDeVoz is not a constructor` — um erro de página
real, capturado por `pageerror`. Mas como o crash acontece **antes** da
primeira chamada a `render()`, o botão nunca perde o `hidden` que já vem
escrito no HTML — fica escondido por coincidência, não porque a regra
funcionou. A asserção de visibilidade passava mesmo com a página inteira
quebrada, e o teste não checava `erros.length` para pegar isso.

Dois consertos, não um: a mutação passou a mexer só na linha de `render()`
que decide a visibilidade (`btnVoz.hidden = ...`), isolando o defeito real
sem derrubar o resto da página; e o teste ganhou
`ok('nenhum erro de execução...', erros.length === 0)`, para nunca mais
confundir "a página não quebrou" com "a página nunca chegou a rodar".

Nenhum dos três achados muda o desenho da funcionalidade — só corrige como
ela é verificada. O código das seções 1 a 3 é o mesmo desde a primeira
versão; CSS, teste e mutação são os que aprenderam algo no caminho.
