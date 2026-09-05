const cardContainer = document.querySelector('.card-container');
const inputBusca = document.getElementById('input-busca');
const filtrosCategoria = document.getElementById('filtros-categoria');

let dadosGerais = [];
let filtroAtivo = 'Todos';

// --- 1. CARREGAMENTO DOS DADOS ---
async function carregarDados() {
    try {
        // Assume que o arquivo JSON com os 28 itens está na raiz
        const response = await fetch('risk_management_data.json'); 
        dadosGerais = await response.json();
        renderizarFiltros();
        renderizarCards(dadosGerais);
    } catch (error) {
        cardContainer.innerHTML = `<p class="erro-carregamento">Erro ao carregar os dados: ${error.message}</p>`;
        console.error("Erro ao carregar dados:", error);
    }
}

// --- 2. RENDERIZAÇÃO DOS CARDS ---
function renderizarCards(dadosParaRenderizar) {
    cardContainer.innerHTML = "";
    
    if (dadosParaRenderizar.length === 0) {
        cardContainer.innerHTML = `<p class="aviso">Nenhuma técnica encontrada para o filtro ou termo de busca atual.</p>`;
        return;
    }

    for (let dado of dadosParaRenderizar) {
        let article = document.createElement("article");
        article.classList.add("card");

        // Geração da string de tags e de setores
        const tagsHTML = dado.tags.map(tag => `<span class="tag-item">${tag}</span>`).join('');
        const setoresHTML = dado.setores.map(setor => `<span class="tag-item setor-item">${setor}</span>`).join('');
        
        // Determina a classe de estilo para o TIPO (Execução ou Técnica)
        const tipoClass = dado.tipo === 'Execução' ? 'tipo-execucao' : 'tipo-tecnica';
        
        article.innerHTML = `
            <h2 class="${tipoClass}">${dado.nome}</h2>
            
            <p class="card-data-criacao">
                Ano: <strong>${dado.ano_criacao_tecnica}</strong> 
                (Origem: ${dado.origem_autores})
            </p>
            
            <p>${dado.descricao}</p>

            <div class="card-uso-info">
                <span><strong>Tipo:</strong> ${dado.tipo}</span>
                <span><strong>Uso Global:</strong> ${dado.uso_estimado}</span>
                <span><strong>Países Notáveis:</strong> ${dado.paises_uso_notavel}</span>
            </div>
            
            <div class="card-tags card-setores">
                <strong>Melhor Aplicabilidade:</strong> ${setoresHTML}
            </div>

            <div class="card-tags">
                <strong>Tags:</strong> ${tagsHTML}
            </div>
            
            <a href="${dado.link}" target="_blank">Referência / Saiba mais</a>
        `
        cardContainer.appendChild(article);
    }
}

// --- 3. RENDERIZAÇÃO E LÓGICA DOS FILTROS ---
function renderizarFiltros() {
    // 1. Coleta todas as categorias únicas de setores
    const todosSetores = dadosGerais.flatMap(dado => dado.setores);
    const setoresUnicos = new Set(['Todos', ...todosSetores]);

    filtrosCategoria.innerHTML = '';
    
    // 2. Cria e anexa os botões de filtro
    setoresUnicos.forEach(setor => {
        const button = document.createElement('button');
        button.classList.add('filtro-btn');
        button.textContent = setor;
        button.setAttribute('data-filtro', setor);
        
        if (setor === filtroAtivo) {
            button.classList.add('active');
        }

        button.addEventListener('click', () => {
            aplicarFiltro(setor);
        });

        filtrosCategoria.appendChild(button);
    });
}

function aplicarFiltro(setorSelecionado) {
    // Atualiza o estado do filtro
    filtroAtivo = setorSelecionado;
    
    // Atualiza a classe 'active' nos botões
    document.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-filtro') === setorSelecionado) {
            btn.classList.add('active');
        }
    });

    executarBusca(); // Executa a busca com o filtro e o termo de pesquisa (se houver)
}

// --- 4. LÓGICA DE BUSCA E FILTRO ---
function executarBusca() {
    const termo = inputBusca.value.toLowerCase().trim();
    let dadosFiltrados = dadosGerais;

    // A. Filtro por Categoria (Setor)
    if (filtroAtivo !== 'Todos') {
        dadosFiltrados = dadosFiltrados.filter(dado => 
            dado.setores.includes(filtroAtivo)
        );
    }

    // B. Filtro por Termo de Busca (Busca em todos os campos, incluindo os novos)
    if (termo.length > 0) {
        dadosFiltrados = dadosFiltrados.filter(dado => {
            const busca = termo;
            
            // Busca Básica
            if (dado.nome.toLowerCase().includes(busca)) return true;
            if (dado.descricao.toLowerCase().includes(busca)) return true;
            
            // Busca em Listas
            if (dado.tags.some(tag => tag.toLowerCase().includes(busca))) return true;
            if (dado.setores.some(setor => setor.toLowerCase().includes(busca))) return true;
            
            // Busca em Dados Históricos/Uso (NOVOS CAMPOS INCLUÍDOS)
            if (dado.origem_autores.toLowerCase().includes(busca)) return true;
            if (dado.tipo.toLowerCase().includes(busca)) return true; 
            if (dado.uso_estimado.toLowerCase().includes(busca)) return true; 
            if (dado.paises_uso_notavel.toLowerCase().includes(busca)) return true; 
            
            return false;
        });
    }

    renderizarCards(dadosFiltrados);
}

// --- 5. EVENT LISTENERS ---
// A busca é executada dinamicamente a cada digitação (evento 'input')
inputBusca.addEventListener('input', executarBusca);

// Inicia o carregamento dos dados quando a página carrega
document.addEventListener('DOMContentLoaded', carregarDados);