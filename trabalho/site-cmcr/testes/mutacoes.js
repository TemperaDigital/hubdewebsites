// Cada mutação é um defeito plausível no site. Se a suíte continuar verde
// depois dela, a suíte não cobre aquilo — e o verde não significa nada ali.
//
// Os caminhos são relativos à raiz do site (a pasta acima desta).
//
// Uma mutação que passar despercebida deve ganhar a chave `descoberto` com o
// motivo, para virar lista de trabalho e não desaparecer no relatório. Hoje
// não há nenhuma: as cinco que existiam foram fechadas pelos casos
// busca-sinonimos-e-limites.js e tema-preambulo-e-links.js.
module.exports = [
  { nome: 'artigo removido do Regimento',
    arquivo: 'base-conhecimento/dados/regimento.js',
    aplicar: function (s) { return s.replace('"n": 72,', '"n": 720,'); } },

  { nome: 'sinônimo quebrado (cachorro deixa de achar animais)',
    arquivo: 'base-conhecimento/dados/temas.js',
    aplicar: function (s) { return s.replace('"cachorro": [', '"cachorroX": ['); } },

  { nome: 'destaque do termo desligado',
    arquivo: 'base-conhecimento/assets/app.js',
    aplicar: function (s) { return s.replace('return out + esc(texto.slice(pos));', 'return esc(texto);'); } },

  { nome: 'busca deixa de ignorar acento',
    arquivo: 'base-conhecimento/assets/app.js',
    aplicar: function (s) { return s.replace(".normalize('NFD')", ''); } },

  { nome: 'limite de palavra removido (pet volta a achar peteca)',
    arquivo: 'base-conhecimento/assets/app.js',
    aplicar: function (s) {
      return s.replace('var fimOk = alvo.length >= 4 || !/[a-z0-9]/.test(depois);', 'var fimOk = true;');
    } },

  { nome: 'aviso cruzado entre documentos some',
    arquivo: 'base-conhecimento/assets/app.js',
    aplicar: function (s) { return s.replace('if (outro && outro.artigos.length) {', 'if (false) {'); } },

  { nome: 'tabela some do artigo',
    arquivo: 'base-conhecimento/assets/app.js',
    aplicar: function (s) { return s.replace('if (art.tabela) h += htmlTabela(art.tabela, alvos);', ''); } },

  { nome: 'linha do quadro de garantias perdida',
    arquivo: 'base-conhecimento/dados/manual.js',
    aplicar: function (s) {
      return s.replace(/\{\s*"c":\s*\[\s*"Portas empenadas",\s*"01 ano"\s*\]\s*\},\s*/, '');
    } },

  { nome: 'link da legislação perde rel=noopener',
    arquivo: 'base-conhecimento/assets/app.js',
    aplicar: function (s) { return s.replace('rel="noopener noreferrer"', 'rel=""'); } },

  { nome: 'empilhamento no celular desligado',
    arquivo: 'base-conhecimento/assets/app.js',
    aplicar: function (s) { return s.replace('var empilha = t.colunas.length > 3;', 'var empilha = false;'); } },

  { nome: 'filtro deixa de esconder linhas',
    arquivo: 'base-conhecimento/assets/app.js',
    aplicar: function (s) { return s.replace('tr.hidden = !bate;', ''); } },

  { nome: 'coluna ITEM some de novo',
    arquivo: 'base-conhecimento/dados/regimento.js',
    aplicar: function (s) { return s.replace(/"Item",\s*(?=\s*"Local \/ Atividade")/, ''); } },

  { nome: 'lacuna reaparece na Convenção',
    arquivo: 'base-conhecimento/dados/convencao.js',
    aplicar: function (s) {
      return s.replace('"lacunas": [],', '"lacunas": [{"n": null, "cap": "XIII", "motivo": "teste"}],');
    } },

  { nome: 'tema escuro não persiste',
    arquivo: 'base-conhecimento/assets/app.js',
    aplicar: function (s) { return s.replace('document.documentElement.dataset.theme = novo;', ''); } },

  { nome: 'preâmbulo do documento some',
    arquivo: 'base-conhecimento/assets/app.js',
    aplicar: function (s) {
      return s.replace("h += '<p class=\"preambulo\">' + destacar(D.preambulo, alvos) + '</p>';", '');
    } },

  { nome: 'logotipo do cabeçalho aponta para caminho inexistente',
    arquivo: 'base-conhecimento/index.html',
    aplicar: function (s) { return s.replace(/\.\.\/assets\/logo-monte-carlo-vinho/g, '../assets/logo-sumido'); } },

  { nome: 'botão de voltar ao site some das Normas Legais',
    arquivo: 'base-conhecimento/index.html',
    aplicar: function (s) { return s.replace('class="voltar-site" href="../"', 'class="voltar-site-x" href="../"'); } },

  { nome: 'branco fixo volta por cima da cor de destaque',
    arquivo: 'base-conhecimento/assets/estilo.css',
    aplicar: function (s) {
      // os dois blocos escuros: o da preferência do sistema e o do botão
      return s.split('--accent-contraste: #2a1618;').join('--accent-contraste: #ffffff;');
    } },

  { nome: 'nota técnica de procedência volta para o topo do documento',
    arquivo: 'base-conhecimento/assets/app.js',
    aplicar: function (s) {
      return s.replace(
        "if (D.naoNormativo) {",
        "if (D.confiabilidade === 'conferido') {\n" +
        "      h += htmlAlerta('OK', '<p><strong>Texto conferido.</strong> Lido por dois motores de OCR.</p>');\n" +
        "    }\n" +
        "    if (D.naoNormativo) {");
    } },

  { nome: 'procedência volta para o aviso de um quadro',
    arquivo: 'base-conhecimento/dados/manual.js',
    aplicar: function (s) {
      return s.replace('"aviso": "Os prazos contam',
                       '"aviso": "Quadro conferido diretamente nas imagens das páginas 14 e 15 do manual. Os prazos contam');
    } },

  { nome: 'logotipo exibido acima da resolução do arquivo',
    arquivo: 'assets/estilo.css',
    aplicar: function (s) { return s.replace('.marca img { width: 311px;', '.marca img { width: 620px;'); } },

  { nome: 'ícone da aba aponta para arquivo que não existe',
    arquivo: 'index.html',
    aplicar: function (s) { return s.replace('assets/favicon-vinho.png', 'assets/favicon-sumido.png'); } },

  { nome: 'texto do cartão da base fica ilegível',
    arquivo: 'assets/estilo.css',
    aplicar: function (s) { return s.replace('color: #f0e2e0;', 'color: #7d4a4d;'); } }
];
