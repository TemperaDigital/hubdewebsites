document.addEventListener('DOMContentLoaded', () => {
    const campoBusca = document.getElementById('campo-busca');
    const botaoBusca = document.getElementById('botao-busca');
    const secaoResultados = document.getElementById('resultados');

    let todasAsLinguagens = [];

    // Função para buscar os dados do arquivo data.json
    async function carregarLinguagens() {
        try {
            const response = await fetch('data.json');
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            todasAsLinguagens = await response.json();
            exibirLinguagens(todasAsLinguagens);
        } catch (error) {
            console.error('Falha ao carregar o arquivo de linguagens:', error);
            secaoResultados.innerHTML = '<p>Não foi possível carregar os dados. Tente novamente mais tarde.</p>';
        }
    }

    // Função para criar e exibir os cartões de linguagens na tela
    function exibirLinguagens(linguagens) {
        secaoResultados.innerHTML = ''; // Limpa os resultados anteriores

        if (linguagens.length === 0) {
            secaoResultados.innerHTML = '<p>Nenhuma linguagem encontrada com o termo pesquisado.</p>';
            return;
        }

        linguagens.forEach(linguagem => {
            const card = document.createElement('article');
            card.className = 'card';

            card.innerHTML = `
                <h2>${linguagem.nome}</h2>
                <p><strong>Ano de Criação:</strong> ${linguagem.ano}</p>
                <p>${linguagem.descricao}</p>
                <a href="${linguagem.link}" target="_blank" rel="noopener noreferrer">Saiba mais</a>
            `;

            secaoResultados.appendChild(card);
        });
    }

    // Função para filtrar as linguagens com base na busca
    function buscar() {
        const termoBusca = campoBusca.value.toLowerCase().trim();

        if (!termoBusca) {
            exibirLinguagens(todasAsLinguagens); // Mostra todas se a busca estiver vazia
            return;
        }

        const resultadosFiltrados = todasAsLinguagens.filter(linguagem =>
            linguagem.nome.toLowerCase().includes(termoBusca)
        );

        exibirLinguagens(resultadosFiltrados);
    }

    // Adiciona os eventos aos elementos de busca
    botaoBusca.addEventListener('click', buscar);
    campoBusca.addEventListener('keyup', (event) => {
        // Permite buscar tanto com Enter quanto digitando
        if (event.key === 'Enter') {
            buscar();
        }
        buscar(); // Busca em tempo real enquanto digita
    });

    // Carrega todas as linguagens assim que a página é aberta
    carregarLinguagens();
});