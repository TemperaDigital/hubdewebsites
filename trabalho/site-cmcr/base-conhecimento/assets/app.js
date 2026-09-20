(function () {
  'use strict';

  var REG = window.DADOS_REGIMENTO;
  var CONV = window.DADOS_CONVENCAO;
  var LEIS = window.DADOS_LEGISLACAO;
  var TEMAS = window.DADOS_TEMAS;
  var SIN = window.DADOS_SINONIMOS;

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var painel = $('#painel');
  var campo = $('#busca');
  var btnLimpar = $('#busca-limpar');

  var estado = { doc: 'regimento', termo: '', tema: null, abertos: {}, verErros: false };

  /* ---------- utilidades ---------- */

  function norm(s) {
    return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }
  function esc(s) {
    return (s || '').replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* Localiza as ocorrências de um alvo num texto já normalizado.
     O alvo precisa começar em início de palavra. Alvos curtos (< 4 letras)
     também precisam terminar em fim de palavra, para que "pet" não case
     com "peteca" nem "cao" com "aplicação". */
  function ocorrencias(plano, alvo) {
    var faixas = [], i = plano.indexOf(alvo);
    while (i > -1) {
      var antes = i === 0 ? ' ' : plano[i - 1];
      var fim = i + alvo.length;
      var depois = fim >= plano.length ? ' ' : plano[fim];
      var inicioOk = !/[a-z0-9]/.test(antes);
      var fimOk = alvo.length >= 4 || !/[a-z0-9]/.test(depois);
      if (inicioOk && fimOk) faixas.push([i, fim]);
      i = plano.indexOf(alvo, i + 1);
    }
    return faixas;
  }

  /* Expande o termo digitado com os sinônimos cadastrados. */
  function expandir(termo) {
    var base = norm(termo).trim();
    if (!base) return [];
    var palavras = base.split(/\s+/).filter(function (p) { return p.length >= 2; });
    var alvos = [base];
    palavras.forEach(function (p) {
      if (alvos.indexOf(p) < 0) alvos.push(p);
      /* tenta a palavra como digitada e, se não houver verbete, no singular */
      var syn = SIN[p] || (p.length > 3 && /s$/.test(p) ? SIN[p.replace(/s$/, '')] : null);
      if (syn) syn.forEach(function (s) {
        var n = norm(s);
        if (alvos.indexOf(n) < 0) alvos.push(n);
      });
    });
    return alvos;
  }

  /* Destaca no HTML já escapado todas as ocorrências dos alvos, ignorando acentos. */
  function destacar(texto, alvos) {
    if (!alvos.length) return esc(texto);
    var plano = norm(texto);
    var faixas = [];
    alvos.forEach(function (alvo) {
      if (alvo.length < 2) return;
      faixas = faixas.concat(ocorrencias(plano, alvo));
    });
    if (!faixas.length) return esc(texto);
    faixas.sort(function (a, b) { return a[0] - b[0]; });
    var uniao = [faixas[0]];
    for (var k = 1; k < faixas.length; k++) {
      var u = uniao[uniao.length - 1];
      if (faixas[k][0] <= u[1]) u[1] = Math.max(u[1], faixas[k][1]);
      else uniao.push(faixas[k]);
    }
    var out = '', pos = 0;
    uniao.forEach(function (f) {
      out += esc(texto.slice(pos, f[0])) + '<mark>' + esc(texto.slice(f[0], f[1])) + '</mark>';
      pos = f[1];
    });
    return out + esc(texto.slice(pos));
  }

  function textoPlano(art) {
    var t = [];
    art.blocos.forEach(function (b) {
      if (b.rotulo) t.push(b.rotulo);
      if (b.caput) t.push(b.caput);
      b.itens.forEach(function (i) { t.push(i.rot + ' - ' + i.txt); });
    });
    return t.join(' ');
  }

  /* ---------- busca ---------- */

  /* Devolve dois grupos: os artigos que citam o termo digitado ("diretos")
     e os que só aparecem por causa de um sinônimo ("relacionados"). */
  function buscar() {
    var alvos = expandir(estado.termo);
    var lit = norm(estado.termo).trim();
    var diretos = [], relacionados = [];

    REG.artigos.forEach(function (a) {
      if (estado.tema && a.tags.indexOf(estado.tema) < 0) return;
      if (!alvos.length) { diretos.push({ art: a, peso: 0 }); return; }
      var hits = lit ? ocorrencias(a.busca, lit).length : 0;
      if (hits) { diretos.push({ art: a, peso: Math.min(hits, 10) }); return; }
      var viaSinonimo = alvos.some(function (alvo) { return ocorrencias(a.busca, alvo).length > 0; });
      if (viaSinonimo) relacionados.push({ art: a, peso: 0 });
    });

    function ordena(lista) {
      return lista.sort(function (x, y) { return y.peso - x.peso || x.art.n - y.art.n; })
                  .map(function (r) { return r.art; });
    }
    return { diretos: ordena(diretos), relacionados: ordena(relacionados) };
  }

  function trecho(art, alvos) {
    var plano = textoPlano(art);
    if (!alvos.length) return plano.slice(0, 240) + (plano.length > 240 ? '…' : '');
    var pl = norm(plano), pos = -1;
    for (var i = 0; i < alvos.length && pos < 0; i++) {
      var f = ocorrencias(pl, alvos[i]);
      if (f.length) pos = f[0][0];
    }
    if (pos < 0) pos = 0;
    var ini = Math.max(0, pos - 90);
    var fim = Math.min(plano.length, pos + 190);
    /* recua/avança até um espaço para não partir palavras */
    if (ini > 0) { var e = plano.indexOf(' ', ini); if (e > -1 && e < pos) ini = e + 1; }
    if (fim < plano.length) { var f = plano.lastIndexOf(' ', fim); if (f > pos) fim = f; }
    return (ini > 0 ? '…' : '') + plano.slice(ini, fim).trim() + (fim < plano.length ? '…' : '');
  }

  /* ---------- renderização ---------- */

  function htmlArtigo(art, alvos) {
    var h = '<article class="art" id="reg-art-' + art.n + '">';
    h += '<span class="art-rot">' + esc(art.rotulo) + '</span>';
    h += '<div class="art-corpo">';
    art.blocos.forEach(function (b) {
      if (b.caput || b.rotulo) {
        h += '<p>';
        if (b.rotulo) h += '<span class="par-rot">' + esc(b.rotulo) + ' — </span>';
        h += destacar(b.caput, alvos) + '</p>';
      }
      if (b.itens.length) {
        h += '<ul class="itens">';
        b.itens.forEach(function (i) {
          h += '<li><span class="item-rot">' + esc(i.rot) + ' –</span><span>' + destacar(i.txt, alvos);
          if (i.tabela) h += htmlTabela(i.tabela, alvos);
          h += '</span></li>';
        });
        h += '</ul>';
      }
    });
    h += '</div>';
    if (art.tags.length) {
      h += '<div class="art-tags">';
      art.tags.forEach(function (t) {
        var tema = TEMAS.filter(function (x) { return x.id === t; })[0];
        if (tema) h += '<button class="art-tag" data-tema="' + t + '" type="button">' + tema.icone + ' ' + esc(tema.nome) + '</button>';
      });
      h += '</div>';
    }
    return h + '</article>';
  }

  function htmlTabela(id, alvos) {
    var t = (REG.tabelas || []).filter(function (x) { return x.id === id; })[0];
    if (!t) return '';
    var h = '<div class="tabela-box"><table class="tabela"><caption class="sr-only">' + esc(t.titulo) + '</caption><thead><tr>';
    t.colunas.slice(1).forEach(function (c) { h += '<th scope="col">' + esc(c) + '</th>'; });
    h += '</tr></thead><tbody>';
    var anterior = null;
    t.linhas.forEach(function (l) {
      if (l.obs) {
        h += '<tr class="linha-obs"><td colspan="3"><strong>Observação</strong> — ' + destacar(l.hora, alvos) + '</td></tr>';
        return;
      }
      var novo = l.local !== anterior;
      h += '<tr' + (novo ? ' class="linha-nova"' : '') + '>' +
        '<th scope="row">' + (novo ? destacar(l.local, alvos) + (l.item ? ' <span class="item-n">' + esc(l.item) + '</span>' : '') : '') + '</th>' +
        '<td>' + destacar(l.dia, alvos) + '</td>' +
        '<td class="hora">' + destacar(l.hora, alvos) + '</td></tr>';
      anterior = l.local;
    });
    h += '</tbody></table><p class="tabela-aviso">' + esc(t.aviso) + '</p></div>';
    return h;
  }

  function htmlAlerta(icone, html) {
    return '<div class="alerta"><span class="alerta-icone" aria-hidden="true">' + icone + '</span><div>' + html + '</div></div>';
  }

  function viewRegimento() {
    var h = '<div class="doc-cabeca"><h2>' + esc(REG.titulo) + '</h2>' +
      '<p class="doc-meta"><span>' + esc(REG.subtitulo) + '</span><span>' + esc(REG.data) +
      '</span><span>' + REG.artigos.length + ' artigos em ' + REG.capitulos.length + ' capítulos</span></p></div>';

    if (REG.confiabilidade === 'conferido') {
      h += htmlAlerta('\u2705',
        '<p><strong>Texto conferido.</strong> Os 88 artigos foram lidos por dois motores de OCR independentes ' +
        'e, nos pontos em que discordaram, conferidos diretamente na imagem do documento registrado.</p>' +
        '<p>A redação reproduz o original, inclusive onde o próprio documento tem erro de digitação. ' +
        '<button class="link-btn" type="button" id="ver-erros">Ver os ' + (REG.errosDoOriginal || []).length +
        ' pontos em que o original diverge da norma culta</button></p>');
    } else {
      h += htmlAlerta('\u26a0\ufe0f',
        '<p><strong>Texto em revisão.</strong> Foi extraído por reconhecimento óptico (OCR) de um PDF escaneado. ' +
        'A conferência contra o documento registrado em cartório ainda não foi concluída.</p>' +
        (REG.lacunas.length ? '<p>Pendências conhecidas: ' +
          REG.lacunas.map(function (l) { return 'Art. ' + l.n + 'º não recuperado'; }).join('; ') +
          '. Consulte <code>REVISAO-OCR.md</code> para a lista completa.</p>' : ''));
    }

    if (estado.verErros && (REG.errosDoOriginal || []).length) {
      h += '<div class="erros-orig"><h3>Divergências presentes no documento original</h3>' +
        '<p>Reproduzidas fielmente nesta base. Não são erros de leitura.</p><dl>';
      REG.errosDoOriginal.forEach(function (e) {
        h += '<dt>' + esc(e.onde) + '</dt><dd>' + esc(e.texto) + ' <span>' + esc(e.nota) + '</span></dd>';
      });
      h += '</dl></div>';
    }

    h += '<p class="preambulo">' + destacar(REG.preambulo, expandir(estado.termo)) + '</p>';

    REG.capitulos.forEach(function (c) {
      var aberto = !!estado.abertos['reg-' + c.numero];
      h += '<section class="cap">';
      h += '<button class="cap-btn" type="button" data-cap="reg-' + c.numero + '" aria-expanded="' + aberto + '">' +
        '<span class="cap-num">' + esc(c.numero) + '</span>' +
        '<span class="cap-tit">' + esc(c.titulo) + '</span>' +
        '<span class="cap-cnt">' + c.artigos.length + ' art.</span>' +
        '<span class="cap-seta" aria-hidden="true">›</span></button>';
      if (aberto) {
        h += '<div class="cap-corpo">';
        REG.artigos.filter(function (a) { return a.cap === c.numero; })
          .forEach(function (a) { h += htmlArtigo(a, expandir(estado.termo)); });
        REG.lacunas.filter(function (l) { return l.cap === c.numero; })
          .forEach(function (l) { h += '<p class="lacuna"><strong>Art. ' + l.n + 'º — texto ausente.</strong> ' + esc(l.motivo) + '</p>'; });
        h += '</div>';
      }
      h += '</section>';
    });

    REG.apendices.forEach(function (ap) {
      var id = 'reg-ap-' + ap.id, aberto = !!estado.abertos[id];
      h += '<section class="cap"><button class="cap-btn" type="button" data-cap="' + id + '" aria-expanded="' + aberto + '">' +
        '<span class="cap-num">' + esc(ap.id) + '</span><span class="cap-tit">Apêndice ' + esc(ap.id) + ' — ' + esc(ap.titulo) + '</span>' +
        '<span class="cap-cnt"></span><span class="cap-seta" aria-hidden="true">›</span></button>';
      if (aberto) h += '<div class="cap-corpo"><div class="art"><div class="art-corpo"><p>' +
        destacar(ap.texto, expandir(estado.termo)) + '</p></div></div></div>';
      h += '</section>';
    });
    return h;
  }

  function viewConvencao() {
    var h = '<div class="doc-cabeca"><h2>' + esc(CONV.titulo) + '</h2>' +
      '<p class="doc-meta"><span>' + esc(CONV.subtitulo) + '</span><span>' + esc(CONV.data) + '</span></p></div>';
    h += htmlAlerta('📄', '<p><strong>Texto integral ainda não disponível.</strong> ' + esc(CONV.aviso) + '</p>');
    h += '<p class="preambulo">' + esc(CONV.preambulo) + '</p>';
    CONV.capitulos.forEach(function (c) {
      var faixa = c.artigos.length
        ? (c.artigos.length === 1 ? 'Art. ' + c.artigos[0] + 'º' : 'Arts. ' + c.artigos[0] + 'º a ' + c.artigos[c.artigos.length - 1] + 'º')
        : '';
      h += '<section class="cap"><div class="cap-btn" style="cursor:default">' +
        '<span class="cap-num">' + esc(c.numero) + '</span>' +
        '<span class="cap-tit">' + esc(c.titulo) +
        (c.nota ? '<br><span style="font-weight:400;font-size:.85rem;color:var(--text-muted)">' + esc(c.nota) + '</span>' : '') +
        '</span><span class="cap-cnt">' + faixa + '</span></div></section>';
    });
    return h;
  }

  function viewLegislacao() {
    var h = '<div class="doc-cabeca"><h2>Legislação</h2>' +
      '<p class="doc-meta"><span>Código Civil e normas correlatas</span><span>links oficiais</span></p></div>';
    h += htmlAlerta('ℹ️', '<p>Os links abrem os textos oficiais no portal do Planalto e nos sites dos órgãos. ' +
      'Confira sempre a versão vigente antes de citar uma norma em notificação ou assembleia.</p>');
    LEIS.forEach(function (g) {
      h += '<section class="lei-grupo"><h3>' + esc(g.grupo) + '</h3><p>' + esc(g.descricao) + '</p>';
      g.itens.forEach(function (i) {
        h += '<a class="lei-item" href="' + esc(i.url) + '" target="_blank" rel="noopener noreferrer">' +
          '<span class="lei-rot">' + esc(i.rotulo) + '</span>' +
          '<p class="lei-nota">' + esc(i.nota) + '</p></a>';
      });
      h += '</section>';
    });
    return h;
  }

  function viewResultados() {
    var r = buscar();
    var alvos = expandir(estado.termo);
    var tema = estado.tema ? TEMAS.filter(function (t) { return t.id === estado.tema; })[0] : null;
    var total = r.diretos.length + r.relacionados.length;

    var titulo = estado.termo ? '\u201c' + esc(estado.termo) + '\u201d' : (tema ? tema.icone + ' ' + esc(tema.nome) : 'Tudo');
    var h = '<div class="res-cabeca"><h2>' + titulo + '</h2><span class="res-cnt">' +
      (total === 1 ? '1 artigo encontrado' : total + ' artigos encontrados') +
      ' no Regimento Interno</span></div>';

    if (!total) {
      return h + '<div class="vazio"><span class="vazio-icone" aria-hidden="true">\ud83d\udd0d</span>' +
        '<strong>Nenhum artigo encontrado</strong>' +
        'Tente outra palavra, ou use um dos temas acima. Lembre-se: o texto da Conven\u00e7\u00e3o ainda n\u00e3o est\u00e1 nesta base.</div>';
    }

    function item(a) {
      return '<button class="res-item" type="button" data-ir="' + a.n + '">' +
        '<span class="res-topo"><span class="res-doc">Regimento</span>' +
        '<strong>' + esc(a.rotulo) + '</strong>' +
        '<span class="res-cap">Cap. ' + esc(a.cap) + ' \u2014 ' + esc(a.capTitulo) + '</span></span>' +
        '<p class="res-texto">' + destacar(trecho(a, alvos), alvos) + '</p></button>';
    }

    if (r.diretos.length) {
      if (estado.termo && r.relacionados.length) {
        h += '<h3 class="grupo-res">Cita \u201c' + esc(estado.termo) + '\u201d diretamente <span>' + r.diretos.length + '</span></h3>';
      }
      h += r.diretos.map(item).join('');
    }

    if (r.relacionados.length) {
      var termos = alvos.slice(1).filter(function (t) { return t !== norm(estado.termo).trim(); }).slice(0, 8);
      h += '<h3 class="grupo-res">Assuntos relacionados <span>' + r.relacionados.length + '</span></h3>' +
        '<p class="busca-dica" style="margin-top:-8px">Encontrados por termos pr\u00f3ximos: <em>' +
        termos.map(esc).join('</em>, <em>') + '</em></p>';
      h += r.relacionados.map(item).join('');
    }
    return h;
  }

  /* ---------- temas ---------- */

  var LIMITE_CHIPS = 10;

  function montarTemas() {
    var box = $('#temas');
    var cont = {};
    REG.artigos.forEach(function (a) { a.tags.forEach(function (t) { cont[t] = (cont[t] || 0) + 1; }); });
    var lista = TEMAS.filter(function (t) { return cont[t.id]; })
      .sort(function (a, b) { return cont[b.id] - cont[a.id]; });

    box.innerHTML = lista.map(function (t, i) {
      return '<button class="tema-chip" type="button" data-tema="' + t.id + '" aria-pressed="false"' +
        (i >= LIMITE_CHIPS ? ' data-extra="1" hidden' : '') + '>' +
        '<span aria-hidden="true">' + t.icone + '</span>' + esc(t.nome) +
        '<span class="cnt">' + cont[t.id] + '</span></button>';
    }).join('') +
    (lista.length > LIMITE_CHIPS
      ? '<button class="tema-mais" id="tema-mais" type="button" aria-expanded="false">+ ' +
        (lista.length - LIMITE_CHIPS) + ' temas</button>'
      : '');

    var mais = $('#tema-mais');
    if (mais) mais.addEventListener('click', function () {
      var abrir = mais.getAttribute('aria-expanded') === 'false';
      mais.setAttribute('aria-expanded', String(abrir));
      mais.textContent = abrir ? '− menos temas' : '+ ' + (lista.length - LIMITE_CHIPS) + ' temas';
      Array.prototype.forEach.call(box.querySelectorAll('[data-extra]'), function (c) { c.hidden = !abrir; });
    });
  }

  function sincronizarTemas() {
    Array.prototype.forEach.call(document.querySelectorAll('#temas .tema-chip[data-tema]'), function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.tema === estado.tema));
    });
  }

  /* ---------- render principal ---------- */

  function render() {
    var buscando = !!(estado.termo.trim() || estado.tema);
    if (buscando && estado.doc === 'regimento') painel.innerHTML = viewResultados();
    else if (estado.doc === 'regimento') painel.innerHTML = viewRegimento();
    else if (estado.doc === 'convencao') painel.innerHTML = viewConvencao();
    else painel.innerHTML = viewLegislacao();

    Array.prototype.forEach.call(document.querySelectorAll('.aba'), function (b) {
      b.setAttribute('aria-selected', String(b.dataset.doc === estado.doc));
    });
    btnLimpar.hidden = !estado.termo;
    sincronizarTemas();
  }

  function irParaArtigo(n) {
    estado.termo = ''; estado.tema = null; campo.value = '';
    var art = REG.artigos.filter(function (a) { return a.n === n; })[0];
    if (art) estado.abertos['reg-' + art.cap] = true;
    render();
    var alvo = document.getElementById('reg-art-' + n);
    if (alvo) alvo.scrollIntoView({ block: 'center' });
  }

  /* ---------- eventos ---------- */

  var timer;
  campo.addEventListener('input', function () {
    clearTimeout(timer);
    timer = setTimeout(function () {
      estado.termo = campo.value;
      if (estado.termo.trim()) estado.doc = 'regimento';
      render();
    }, 160);
  });

  btnLimpar.addEventListener('click', function () {
    campo.value = ''; estado.termo = ''; estado.tema = null; render(); campo.focus();
  });

  $('#abas').addEventListener('click', function (e) {
    var b = e.target.closest('.aba');
    if (!b) return;
    estado.doc = b.dataset.doc;
    if (estado.doc !== 'regimento') { estado.tema = null; }
    render();
  });

  document.addEventListener('click', function (e) {
    var chip = e.target.closest('[data-tema]');
    if (chip) {
      var t = chip.dataset.tema;
      estado.tema = estado.tema === t ? null : t;
      estado.doc = 'regimento';
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (e.target.id === 'ver-erros') { estado.verErros = !estado.verErros; render(); return; }
    var cap = e.target.closest('[data-cap]');
    if (cap) {
      var k = cap.dataset.cap;
      estado.abertos[k] = !estado.abertos[k];
      render();
      return;
    }
    var ir = e.target.closest('[data-ir]');
    if (ir) irParaArtigo(Number(ir.dataset.ir));
  });

  /* tema claro/escuro */
  var btnTema = $('#btn-tema');
  try {
    var salvo = localStorage.getItem('mcr-tema');
    if (salvo) document.documentElement.dataset.theme = salvo;
  } catch (e) { /* modo privativo: segue com o tema do sistema */ }
  btnTema.addEventListener('click', function () {
    var atual = document.documentElement.dataset.theme;
    if (!atual) {
      atual = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    var novo = atual === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = novo;
    try { localStorage.setItem('mcr-tema', novo); } catch (e) { /* ignora */ }
  });

  /* atalho: "/" foca a busca */
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && document.activeElement !== campo) { e.preventDefault(); campo.focus(); }
    if (e.key === 'Escape' && document.activeElement === campo) { btnLimpar.click(); }
  });

  montarTemas();
  render();
})();
