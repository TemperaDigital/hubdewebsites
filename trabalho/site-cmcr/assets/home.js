(function () {
  'use strict';

  /* Esta página não repete dados: lê os mesmos arquivos que alimentam a Base de
     Conhecimento. Os horários vêm do quadro do Art. 2º XVI do Regimento, e os números
     do edifício são contados no quadro de vagas do Art. 6º da Convenção. Se uma
     correção entrar lá, entra aqui junto. */

  var REG = window.DADOS_REGIMENTO;
  var CONV = window.DADOS_CONVENCAO;

  var ICONES = {
    'salao de festas': '🎉',
    'espaco gourmet': '🔥',
    'brinquedoteca': '🧸',
    'piscina': '🏊',
    'academia': '🏋️',
    'mudancas': '📦'
  };

  function norm(s) {
    return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }
  function esc(s) {
    return (s || '').replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function icone(nome) {
    var n = norm(nome);
    for (var k in ICONES) if (n.indexOf(k) === 0) return ICONES[k];
    return '•';
  }

  /* ---------- horários, a partir do quadro do Regimento ---------- */
  function montarAreas() {
    var alvo = document.getElementById('grade-areas');
    if (!alvo) return;
    var tab = REG && (REG.tabelas || []).filter(function (t) { return t.id === 'horarios'; })[0];
    if (!tab) {
      alvo.innerHTML = '<p class="carregando">Os horários estão no Regimento Interno. ' +
        '<a href="base-conhecimento/">Consultar</a>.</p>';
      return;
    }

    /* o quadro traz uma linha por dia e uma linha de observação por espaço */
    var iCol = tab.colunas.indexOf('Local / Atividade');
    var iDia = tab.colunas.indexOf('Dia da semana');
    var iHora = tab.colunas.indexOf('Horário');
    var ordem = [], grupos = {};

    tab.linhas.forEach(function (l) {
      if (l.obs) {
        if (ordem.length) grupos[ordem[ordem.length - 1]].obs = l.c[0];
        return;
      }
      var nome = l.c[iCol];
      if (!grupos[nome]) { grupos[nome] = { horas: [], obs: '' }; ordem.push(nome); }
      grupos[nome].horas.push({ dia: l.c[iDia], hora: l.c[iHora] });
    });

    alvo.innerHTML = ordem.map(function (nome) {
      var g = grupos[nome];
      return '<article class="area-card">' +
        '<div class="area-topo"><span class="area-icone" aria-hidden="true">' + icone(nome) + '</span>' +
        '<span class="area-nome">' + esc(nome) + '</span></div>' +
        '<ul class="area-horas">' + g.horas.map(function (h) {
          return '<li><span class="area-dia">' + esc(h.dia) + '</span>' +
                 '<span class="area-hora">' + esc(h.hora) + '</span></li>';
        }).join('') + '</ul>' +
        (g.obs ? '<p class="area-obs">' + esc(g.obs) + '</p>' : '') +
        '</article>';
    }).join('');
  }

  /* ---------- números do edifício, contados no quadro de vagas ---------- */
  function montarNumeros() {
    var tab = CONV && (CONV.tabelas || []).filter(function (t) { return t.id === 'vagas'; })[0];
    if (!tab) return;
    var iTotal = tab.colunas.indexOf('Total');
    var unidades = tab.linhas.length;
    var vagas = tab.linhas.reduce(function (n, l) { return n + (parseInt(l.c[iTotal], 10) || 0); }, 0);

    var eUn = document.querySelector('[data-num="unidades"]');
    var eVg = document.querySelector('[data-num="vagas"]');
    if (eUn) eUn.textContent = unidades;
    if (eVg) eVg.textContent = vagas;

    var nota = document.getElementById('nota-num');
    if (nota) {
      nota.innerHTML = 'Unidades e vagas contadas no quadro do Art. 6º da Convenção — ' +
        unidades + ' unidades e ' + vagas + ' vagas — e não digitadas à parte. ' +
        '<a href="base-conhecimento/">Ver o quadro</a>.';
    }
  }

  montarAreas();
  montarNumeros();
})();
