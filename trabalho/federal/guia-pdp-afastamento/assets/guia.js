(function(){
  "use strict";

  /* ---------- índice ---------- */
  var secs = [
    ["s1","Primeiro: entenda o que é o PDP"],
    ["s2","A linha dos 30 dias"],
    ["s3","Os cinco caminhos possíveis"],
    ["s4","Quanto tempo você pode ficar"],
    ["s5","O requisito que trava processos"],
    ["s6","Monte o processo sem esquecer nada"],
    ["downloads","Baixe os documentos"],
    ["s7f","Entendendo o formulário Anexo 2"],
    ["s7","Escolha o tema geral"],
    ["s8","Onde consultar e onde estudar"],
    ["s9","Base legal"]
  ];
  function buildToc(host){
    var ol = document.createElement("ol");
    secs.forEach(function(s,i){
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "#" + s[0];
      a.dataset.t = s[0];
      a.innerHTML = '<span class="n">' + String(i+1).padStart(2,"0") + '</span><span>' + s[1] + '</span>';
      li.appendChild(a); ol.appendChild(li);
    });
    host.appendChild(ol);
  }
  buildToc(document.getElementById("tocDesktop"));
  buildToc(document.getElementById("tocPanel"));

  var tocBtn = document.getElementById("tocBtn"), tocPanel = document.getElementById("tocPanel");
  tocBtn.addEventListener("click", function(){
    var open = tocPanel.classList.toggle("open");
    tocBtn.setAttribute("aria-expanded", open ? "true" : "false");
  });
  tocPanel.addEventListener("click", function(e){
    if (e.target.closest("a")) { tocPanel.classList.remove("open"); tocBtn.setAttribute("aria-expanded","false"); }
  });

  var links = Array.prototype.slice.call(document.querySelectorAll(".toc a"));
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (!en.isIntersecting) return;
        var id = en.target.id;
        links.forEach(function(a){ a.classList.toggle("on", a.dataset.t === id); });
      });
    }, { rootMargin: "-12% 0px -70% 0px", threshold: 0 });
    secs.forEach(function(s){
      var el = document.getElementById(s[0]);
      if (el) io.observe(el);
    });
  }

  /* ---------- comparador 30 dias ---------- */
  var tabA = document.getElementById("tabA"), tabB = document.getElementById("tabB"),
      panA = document.getElementById("panA"), panB = document.getElementById("panB");
  function pick(which){
    var a = which === "a";
    tabA.setAttribute("aria-selected", a ? "true" : "false");
    tabB.setAttribute("aria-selected", a ? "false" : "true");
    panA.hidden = !a; panB.hidden = a;
  }
  tabA.addEventListener("click", function(){ pick("a"); });
  tabB.addEventListener("click", function(){ pick("b"); });

  /* ---------- calculadora da licença ---------- */
  var TOTAL = 90, MAX_PER = 6, MIN_DIAS = 15;
  var cD = document.getElementById("cDias"), cP = document.getElementById("cPer"),
      out = document.getElementById("calcOut");
  var icOk = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 6 9 17l-5-5"/></svg>';
  var icNo = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';

  function calc(){
    var d = parseInt(cD.value, 10), p = parseInt(cP.value, 10);
    if (!isFinite(d) || !isFinite(p) || d < 1 || p < 1) {
      out.innerHTML = '<div class="verdict no">' + icNo +
        '<div><span class="vt">Preencha os dois campos</span>' +
        '<p style="margin:0;font-size:14px">Informe quantos dias por período e quantos períodos.</p></div></div>';
      return;
    }
    var soma = d * p, probs = [];
    if (p > MAX_PER) probs.push("São <strong>" + p + " períodos</strong>, e o limite é <strong>6</strong>.");
    if (d < MIN_DIAS) probs.push("Cada período tem <strong>" + d + " dias</strong>, abaixo do mínimo de <strong>15 dias</strong>.");
    if (soma > TOTAL) probs.push("O total dá <strong>" + soma + " dias</strong>, acima dos <strong>90 dias</strong> (3 meses) do saldo.");

    if (probs.length) {
      out.innerHTML = '<div class="verdict no">' + icNo +
        '<div><span class="vt">Esse parcelamento não fecha</span><ul><li>' +
        probs.join("</li><li>") + '</li></ul></div></div>';
    } else {
      var sobra = TOTAL - soma;
      var meses = Math.floor(soma / 30), dias = soma % 30;
      var dur = meses ? (meses + (meses > 1 ? " meses" : " mês") + (dias ? " e " + dias + " dias" : "")) : (soma + " dias");
      var extra = sobra > 0
        ? "Sobram <strong>" + sobra + " dias</strong> do saldo de 90."
        : "Usa o saldo inteiro de 90 dias.";
      var cal = p > 1
        ? " Com os <strong>60 dias de intervalo</strong> obrigatórios entre períodos, o calendário se estende por cerca de <strong>" +
          (soma + 60 * (p - 1)) + " dias</strong> do primeiro ao último dia."
        : "";
      out.innerHTML = '<div class="verdict ok">' + icOk +
        '<div><span class="vt">Dentro das regras</span>' +
        '<p style="margin:0;font-size:14px">' + p + (p > 1 ? " períodos" : " período") + " de " + d +
        " dias = <strong>" + soma + " dias</strong> (" + dur + "). " + extra + cal + "</p></div></div>";
    }
  }
  cD.addEventListener("input", calc);
  cP.addEventListener("input", calc);
  calc();

  /* ---------- checklist do processo ---------- */
  var GRUPOS = {
    ckA: [
      ["Requerimento", "documento de abertura"],
      ["Informação", "documento de abertura"],
      ["Documentos previstos nas Normas Técnicas da DCIPAS", "documento de abertura"]
    ],
    ckB: [
      ["Local em que a ação será realizada", "art. 28, I, a"],
      ["Carga horária prevista", "art. 28, I, b"],
      ["Período do afastamento, incluído o trânsito", "art. 28, I, c"],
      ["Instituição promotora, quando houver", "art. 28, I, d"],
      ["Despesas com inscrição e mensalidade, se houver", "art. 28, I, e"],
      ["Despesas com diárias e passagens, se houver", "art. 28, I, f"]
    ],
    ckC: [
      ["Currículo atualizado extraído do SIGEPE — Banco de Talentos", "art. 28, II"],
      ["Justificativa do interesse da administração pública", "art. 28, III"],
      ["Cópia do trecho do PDP onde a necessidade está indicada", "art. 28, IV"],
      ["Manifestação da chefia imediata, com concordância", "art. 28, V"],
      ["Manifestação da unidade de gestão de pessoas", "art. 28, VI"],
      ["Pedido de exoneração do cargo ou dispensa da função, se for o caso", "art. 28, VII"],
      ["Anuência da autoridade máxima", "art. 28, VIII"],
      ["Publicação do ato de concessão do afastamento", "art. 28, IX"]
    ]
  };
  var KEY = "pdp-checklist-v1", estado = {};
  try { estado = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { estado = {}; }

  var total = 0;
  Object.keys(GRUPOS).forEach(function(gid){
    var host = document.getElementById(gid);
    GRUPOS[gid].forEach(function(item, idx){
      var id = gid + "-" + idx; total++;
      var lab = document.createElement("label");
      lab.className = "ck"; lab.htmlFor = id;
      lab.innerHTML = '<input type="checkbox" id="' + id + '">' +
        '<span class="ck-txt">' + item[0] + '<span class="ck-ref">' + item[1] + '</span></span>';
      host.appendChild(lab);
      var cb = lab.querySelector("input");
      cb.checked = !!estado[id];
      lab.classList.toggle("done", cb.checked);
      cb.addEventListener("change", function(){
        estado[id] = cb.checked;
        lab.classList.toggle("done", cb.checked);
        save(); paint();
      });
    });
  });
  function save(){ try { localStorage.setItem(KEY, JSON.stringify(estado)); } catch (e) {} }
  function paint(){
    var n = document.querySelectorAll(".ck input:checked").length;
    document.getElementById("ckFill").style.width = (n / total * 100) + "%";
    document.getElementById("ckCount").textContent = n + " / " + total;
  }
  document.getElementById("ckReset").addEventListener("click", function(){
    estado = {}; save();
    document.querySelectorAll(".ck input").forEach(function(cb){
      cb.checked = false; cb.closest(".ck").classList.remove("done");
    });
    paint();
  });
  paint();

  /* ---------- busca de temas ---------- */
  var TEMAS = ["Accountability (Prestação Pública de Contas)","Administração de Empresas","Administração de Setores Específicos","Administração Educacional","Administração Estadual","Administração Federal","Administração Municipal","Administração Pública da América do Norte","Administração Pública da América Latina","Administração Pública da Europa","Administração Pública da África","Administração Pública da Ásia e Oceania","Administração Pública do Brasil","Administração Regional","Aerodinâmica","Agrometeorologia","Alta Administração Pública","Anatomia","Anatomia Patológica e Patologia Clínica","Antropologia das Populações Afro-Brasileiras","Antropologia Rural","Antropologia Urbana","Análise","Análise e Controle e Medicamentos","Análise Nutricional de População","Análise Toxicológica","Aplicações de Radioisotopos","Aquicultura","Arqueologia Histórica","Arqueologia Pré-Histórica","Arquivologia","Artes do Vídeo","Artes Plásticas","Astrofísica do Meio Interestelar","Astrofísica do Sistema Solar","Astrofísica Estelar","Astrofísica Extragaláctica","Astronomia de Posição e Mecânica Celeste","Atendimento ao Público","Auditoria","Avaliação de Desempenho (Setor Público)","Biblioteconomia","Bioengenharia","Biofísica Celular","Biofísica de Processos e Sistemas","Biofísica Molecular","Biologia e Fisiologia dos Microorganismos","Biologia Geral","Biologia Molecular","Bioquímica da Nutrição","Bioquímica dos Microorganismos","Botânica Aplicada","Bromatologia","Capacitação Profissional no Setor Público","Cinema","Circuitos Elétricos, Magnéticos e Eletrônicos","Cirurgia","Cirurgia Buco-Maxilo-Facial","Citologia e Biologia Celular","Ciência de Alimentos","Ciência do Solo","Ciências Contábeis","Clínica e Cirurgia Animal","Clínica Médica","Clínica Odontológica","Combustível Nuclear","Componentes da Dinâmica Demográfica","Comportamento Animal","Comportamento Político","Compras Governamentais","Comunicação Visual","Concessão de Serviços Públicos","Conservação da Natureza","Construção Civil","Construções Rurais e Ambiência","Consórcio Público","Contrato de gestão","Controle de Gestão","Controle Social","Cooperação Internacional","Corrupção Administrativa","Crescimento, Flutuações e Planejamento Econômico","Currículo","Código de Conduta","Dança","Demografia Histórica","Desburocratização","Desenho de Produto","Desnutrição e Desenvolvimento Fisiológico","Dietética","Dinâmica de Voo","Direito Privado","Direito Público","Direitos Especiais","Distribuição Espacial","Ecologia Aplicada","Ecologia de Ecossistemas","Ecologia dos Animais Domésticos e Etologia","Ecologia Teórica","Economia do Bem-Estar Social","Economia Doméstica","Economia dos Recursos Humanos","Economia Industrial","Economia Internacional","Economia Monetária e Fiscal","Economia Regional e Urbana","Economias Agrária e dos Recursos Naturais","Educação Artística","Educação Física","Eletrônica Industrial, Sistemas e Controles Eletrônicos Embriologia","Empresa Pública","Endodontia","Energia de Biomassa Florestal","Energização Rural","Engenharia de Alimentos","Engenharia de Pesca","Engenharia de Processamento de Produtos Agrícolas","Engenharia de Água e Solo","Engenharia do Produto","Engenharia Econômica","Engenharia Hidráulica","Engenharia Médica","Engenharia Térmica","Ensino-Aprendizagem","Entomologia e Malacologia de Parasitos e Vetores","Enzimologia","Epidemiologia","Epistemologia","Estado e Governo","Estatística","Estruturas","Estruturas Aeroespaciais","Estruturas Navais e Oceânicas","Etnofarmacologia","Etnologia Indígena","Extensão Rural","Farmacognosia","Farmacologia Autonômica","Farmacologia Bioquímica e Molecular","Farmacologia Cardiorenal","Farmacologia Clínica","Farmacologia Geral","Farmacotecnia","Fenômenos de Transporte","Filosofia Brasileira","Fiscalização da Moralidade Pública","Fisico-Química","Fisiologia Comparada","Fisiologia da Linguagem","Fisiologia de Órgaos e Sistemas","Fisiologia do Esforço","Fisiologia dos Grupos Recentes","Fisiologia Geral","Fisiologia Vegetal","Fisioterapia e Terapia Ocupacional","Fitogeografia","Fitossanidade","Fitotecnia","Floricultura, Parques e Jardins","Fonoaudiologia","Fontes de Dados Demográficos","Fotografia","Fundamentos da Educação","Fundamentos da Sociologia","Fundamentos de Arquitetura e Urbanismo","Fundamentos do Planejamento Urbano e Regional Liderança","Fundamentos do Serviço Social","Fundamentos e Crítica das Artes","Fundamentos e Medidas da Psicologia","Função Pública","Fusão Controlada","Física Atômica e Molecular","Física da Matéria Condensada","Física das Partículas Elementares e Campos","Física dos Fluidos, Física de Plasmas e Descargas Elétricas","Física Geral","Física Nuclear","Genética Animal","Genética e Melhoramento dos Animais Domésticos","Genética Humana e Médica","Genética Molecular e de Microorganismos","Genética Quantitativa","Genética Vegetal","Geodesia","Geofísica","Geografia Física","Geografia Humana","Geografia Regional","Geologia","Geometria e Topologia","Geotécnica","Gerência de Produção","Gestor Público","Gestão de Pessoas no Setor Público","Governança e Gestão de Riscos","Governo Eletrônico / Digital","Helmintologia de Parasitos","Hidrodinâmica de Navios e Sistemas Oceânicos","Histologia","História Antiga e Medieval","História da América","História da Filosofia","História da Teologia","História das Ciências","História do Brasil","História Moderna e Contemporânea","Imunogenética","Imunologia Aplicada","Imunologia Celular","Imunoquímica","Indicador de Desempenho (Setor Público)","Infra-Estrutura de Transportes","Inovação na Gestão Pública","Inspeção de Produtos de Origem Animal","Instalações e Equipamentos Metalúrgicos","Instrumentação Astronômica","Jornalismo e Editoração","Lavra","Linguística Aplicada","Linguística Histórica","Literatura Brasileira","Literatura Comparada","Literaturas Clássicas","Literaturas Estrangeiras Modernas","Língua Portuguesa","Línguas Clássicas","Línguas Estrangeiras Modernas","Línguas Indígenas","Lógica","Manejo Florestal","Matemática Aplicada","Matemática da Computação","Materiais e Processos para Engenharia Aeronáutica","Materiais Elétricos","Materiais não Metálicos","Materiais Odontológicos","Mecânica dos Sólidos","Medicina Legal e Deontologia","Medicina Preventiva","Medicina Veterinária Preventiva","Medidas Elétricas, Magnéticas e Eletrônicas Instrumentação","Metabolismo e Bioenergética","Metafísica","Metalurgia de Transformação","Metalurgia Extrativa","Metalurgia Física","Meteorologia","Metodologia e Técnicas da Computação","Microbiologia Aplicada","Modernização Administrativa","Morfologia dos Grupos Recentes","Morfologia Vegetal","Museologia","Mutagênese","Máquinas e Implementos Agrícolas","Máquinas Marítimas","Métodos e Técnicas do Planejamento Urbano Regional","Métodos Quantitativos em Economia","Música","Neuropsicofarmacologia","Nupcialidade e Família","Nutrição e Alimentação Animal","Oceanografia Biológica","Oceanografia Física","Oceanografia Geológica","Oceanografia Química","Odontologia Social e Preventiva","Odontopediatria","Operações de Transportes","Operações Industriais e Equipamentos para Engenharia Química","Orientação e Aconselhamento","Ortodontia","Outras Literaturas Vernáculas","Outras não especificadas","Outras Sociologias Específicas","Ouvidoria","Paisagismo","Paleobotânica","Paleozoologia","Parcerias no Setor Público","Parcerias Público-Privadas","Pastagem e Forragicultura","Patologia Animal","Periodontia","Pesquisa Mineral","Pesquisa Operacional","Planejamento de Transportes","Planejamento e Avaliação Educacional","Política Internacional","Política Pública e População","Políticas Públicas","Políticas Públicas e Uso de Evidências","Previdência","Probabilidade","Probabilidade e Estatística Aplicadas","Processos de Fabricação","Processos Industriais de Engenharia Química","Produtividade","Produção Animal","Programação Visual","Projeto de Arquitetura e Urbanismo","Projeto de Navios e de Sistemas Oceânicos","Projetos de Máquinas","Propulsão Aeroespacial","Protozoologia de Parasitos","Psicolinguística","Psicologia Cognitiva","Psicologia Comparativa","Psicologia do Desenvolvimento Humano","Psicologia do Ensino e da Aprendizagem","Psicologia do Trabalho e Organizacional","Psicologia Experimental","Psicologia Fisiológica","Psicologia Social","Psiquiatria","Química Analítica","Química de Macromoléculas","Química Inorgânica","Química Orgânica","Radiologia e Fotobiologia","Radiologia Médica","Radiologia Odontológica","Recursos Hídricos","Recursos Pesqueiros de Águas Interiores","Recursos Pesqueiros Marinhos","Reforma Administrativa","Regulação – Agência Reguladora","Relações de Trabalho no Setor Público","Relações Públicas e Propaganda","Reprodução Animal","Rádio e Televisão","Saneamento Ambiental","Saneamento Básico","Satisfação do Usuário","Saúde Materno-Infantil","Saúde Publica","Serviço Social Aplicado","Serviços Urbanos e Regionais","Silvicultura","Sistemas Aeroespaciais","Sistemas de Computação","Sistemas Elétricos de Potência","Sociolinguística e Dialetologia","Sociologia da Saúde","Sociologia do Conhecimento","Sociologia do Desenvolvimento","Sociologia Rural","Sociologia Urbana","Taxonomia dos Grupos Recentes","Taxonomia Vegetal","Teatro","Tecnologia","Tecnologia da Informação","Tecnologia de Alimentos","Tecnologia de Arquitetura e Urbanismo","Tecnologia de Construção Naval e de Sistemas Oceânicas dos Reatores","Tecnologia e Utilização de Produtos Florestais","Tecnologia Química","Telecomunicações","Tendência Populacional","Teologia Moral","Teologia Pastoral","Teologia Sistemática","Teoria Antropológica","Teoria da Administração Pública","Teoria da Computação","Teoria da Comunicação","Teoria da Informação","Teoria do Direito","Teoria e Análise Linguística","Teoria e Filosofia da História","Teoria e Método em Arqueologia","Teoria Econômica","Teoria Literária","Teoria Política","Terceirização","Terceiro Setor – ONG’s – OSCIP","Toxicologia","Tratamento de Minérios","Tratamento de Águas de Abastecimento Residuárias","Tratamento e Prevenção Psicológica","Técnicas e Operações Florestais","Técnicas Gerenciais no Setor Público","Tópicos Específicos de Educação","Veículos e Equipamentos de Controle","Zoologia Aplicada","Álgebra","Áreas Clássicas de Fenomenologia e suas Aplicações","Ética","Ética no Setor Público","Ópera"];
  var q = document.getElementById("q"), qList = document.getElementById("qList"),
      qMeta = document.getElementById("qMeta");
  /* Faixa dos sinais diacríticos combinantes (U+0300 a U+036F), montada em tempo de
     execução para o arquivo não depender de escapes que se perdem ao ser copiado. */
  var DIACRITICOS = new RegExp("[" + String.fromCharCode(0x300) + "-" + String.fromCharCode(0x36f) + "]", "g");
  function norm(s){ return s.normalize("NFD").replace(DIACRITICOS, "").toLowerCase(); }
  var IDX = TEMAS.map(norm);
  function esc(s){ return s.replace(/[&<>]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;"}[c]; }); }

  function render(){
    var termo = q.value.trim();
    var alvo = norm(termo);
    var hits = [];
    for (var i = 0; i < TEMAS.length; i++) {
      if (!alvo || IDX[i].indexOf(alvo) !== -1) hits.push(i);
    }
    qMeta.textContent = termo
      ? hits.length + " de " + TEMAS.length + " temas"
      : TEMAS.length + " temas na lista oficial";
    if (!hits.length) {
      qList.innerHTML = '<li class="none">Nenhum tema com “' + esc(termo) + '”. Tente uma palavra mais curta.</li>';
      return;
    }
    var mostra = hits.slice(0, 300);
    qList.innerHTML = mostra.map(function(i){
      var t = esc(TEMAS[i]);
      if (alvo) {
        var pos = IDX[i].indexOf(alvo);
        if (pos !== -1) {
          t = esc(TEMAS[i].slice(0, pos)) + "<mark>" + esc(TEMAS[i].slice(pos, pos + termo.length)) +
              "</mark>" + esc(TEMAS[i].slice(pos + termo.length));
        }
      }
      return "<li>" + t + "</li>";
    }).join("");
    if (hits.length > mostra.length) {
      qList.innerHTML += '<li class="none">+ ' + (hits.length - mostra.length) +
        " outros. Refine a busca para ver todos.</li>";
    }
  }
  q.addEventListener("input", render);
  render();
})();
