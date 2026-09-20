function pesquisar() {
    const section = document.getElementById("resultados-pesquisa");
    let campoPesquisa = document.getElementById("campo-pesquisa").value.toLowerCase();
    
    // Verifica se o campo está vazio após remover espaços em branco
    if (campoPesquisa.trim() === "") {
        section.innerHTML = "<p>Nenhum resultado encontrado</p>";
        return;
    }

    let resultados = "";
    
    for (let dado of dados) {
        // Variáveis criadas apenas no escopo do loop
        const titulo = dado.titulo.toLowerCase();
        const descricao = dado.descricao.toLowerCase();
        const tags = dado.tags.toLowerCase();

        // Verifica se a pesquisa corresponde ao título, descrição ou tags
        if (titulo.includes(campoPesquisa) || descricao.includes(campoPesquisa) || tags.includes(campoPesquisa)) {
            resultados += `
            <div class="item-resultado">
                <h2><a href="${dado.link}" target="_blank" rel="noopener noreferrer">${dado.titulo}</a></h2>
                <p class="descricao-meta">${dado.descricao}</p>
                <a href="${dado.link}" target="_blank" rel="noopener noreferrer">Mais informações</a>
            </div>
            `;
        }
    }

    // Se nenhum resultado for gerado no loop, mostra a mensagem
    if (resultados === "") {
        resultados = "<p>Nenhum resultado encontrado</p>";
    }
    
    section.innerHTML = resultados;
}