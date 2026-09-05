import * as fs from 'fs/promises';

// --- CONFIGURAÇÃO DA GEMINI API ---
const apiKey=process.env.GEMINI_API_KEY;

// Usando modelo moderno e configurando a URL do endpoint corretamente.
const MODEL_NAME = 'gemini-2.5-flash'; 
const apiUrl = `https://generativelanguage.googleapis.com/v1/models/${MODEL_NAME}:generateContent?key=${apiKey}`;

const KNOWLEDGE_FILE = 'baseDeConhecimento.json';

// --- CONFIGURAÇÃO DE GERAÇÃO ---
const TOTAL_ITEMS = 25; 

// Estrutura JSON esperada para cada item
const responseSchema = {
    type: "ARRAY",
    items: {
        type: "OBJECT",
        properties: {
            "nome": { "type": "STRING", "description": "Nome da tecnologia (ex: React, MongoDB)." },
            "descricao": { "type": "STRING", "description": "Descrição concisa da tecnologia." },
            "data_criacao": { "type": "STRING", "description": "Ano de criação/lançamento (ex: '2013')." },
            "link": { "type": "STRING", "description": "URL oficial ou de documentação principal." },
            "tags": {
                "type": "ARRAY",
                "description": "Array de 3 a 5 strings que categorizam a tecnologia (ex: 'frontend', 'banco de dados', 'framework', 'linguagem de programação').",
                "items": { "type": "STRING" }
            }
        },
        "required": ["nome", "descricao", "data_criacao", "link", "tags"]
    }
};

/**
 * Espera de forma assíncrona (usado no retry).
 * @param {number} ms - Milissegundos para esperar.
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Função para gerar o conhecimento em uma única chamada à API.
 * Implementa retry com backoff exponencial.
 * @returns {Promise<Array<Object>>} Array com as 25 novas entradas de conhecimento.
 */
async function generateNewKnowledge(existingKnowledge) {
    // Lista de nomes existentes para evitar repetição (para incluir no prompt)
    const existingNames = existingKnowledge.map(item => item.nome).join(', ');

    // Instrução explícita para forçar saída em JSON puro
    const systemPrompt = `Você é um especialista em tecnologia e linguagens de programação. Sua tarefa é criar ${TOTAL_ITEMS} novas entradas sobre diferentes tecnologias (linguagens, frameworks, ferramentas, bancos de dados, metodologias, etc.) com a mesma estrutura JSON. Garanta que cada entrada seja única e relevante. O foco é em termos atuais e amplamente usados em desenvolvimento de software. Sua ÚNICA saída deve ser o array JSON estrito, sem qualquer texto, explicação ou bloco de código Markdown.`;
    
    // userQuery
    const userQuery = `Gere uma lista de ${TOTAL_ITEMS} novas tecnologias. Siga estritamente a estrutura JSON e o requisito de ser um ARRAY com EXATAMENTE ${TOTAL_ITEMS} objetos. Não inclua as 5 tecnologias iniciais (Python, JavaScript, Java, C++, Ruby) e NÃO use NENHUM dos seguintes nomes: ${existingNames}.`;

    const payload = {
        // ✅ CORREÇÃO FINAL PARA O PAYLOAD: Envia o System Prompt E o User Query no array contents.
        contents: [
            // 1. System Prompt (instruções de configuração e formato)
            { role: "user", parts: [{ text: systemPrompt }] },
            // 2. User Query (o pedido real de conteúdo)
            { role: "user", parts: [{ text: userQuery }] }
        ],
        generationConfig: {
            // ❌ REMOVIDO: O systemInstruction deve ser removido do generationConfig nesta abordagem.
            responseMimeType: "application/json",
            responseSchema: responseSchema
        }
    };

    let response;
    let retries = 0;
    const maxRetries = 5;
    // ... (o restante da função generateNewKnowledge, a lógica de fetch e retry, permanece igual)
    // ...
    while (retries < maxRetries) {
        try {
            response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const result = await response.json();
                const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;

                if (jsonText) {
                    try {
                        const newKnowledge = JSON.parse(jsonText);
                        
                        if (Array.isArray(newKnowledge) && newKnowledge.length === TOTAL_ITEMS) {
                            console.log(`Sucesso! ${TOTAL_ITEMS} novos itens gerados pela API.`);
                            return newKnowledge;
                        } else {
                            throw new Error(`O array retornado não contém ${TOTAL_ITEMS} itens. Encontrados: ${Array.isArray(newKnowledge) ? newKnowledge.length : 0}`);
                        }
                    } catch (parseError) {
                        throw new Error("JSON malformado ou incompleto na resposta da API.");
                    }
                } else {
                    throw new Error("Resposta da API vazia ou sem conteúdo textual.");
                }
            } else {
                const errorBody = await response.text();
                throw new Error(`Falha na API com status ${response.status}: ${response.statusText}. Detalhes: ${errorBody.substring(0, 100)}...`);
            }
        } catch (error) {
            retries++;
            if (retries < maxRetries) {
                const waitTime = Math.pow(2, retries) * 1000;
                console.log(`Tentativa ${retries} falhou (${error.message}). Esperando ${waitTime / 1000}s antes de tentar novamente.`);
                await delay(waitTime);
            } else {
                throw new Error(`Falha ao gerar o conhecimento após ${maxRetries} tentativas: ${error.message}`);
            }
        }
    }
}


/**
 * Função principal para executar o fluxo de trabalho.
 */
async function main() {
    // 1. Verifica se a chave da API está presente
    if (!apiKey) {
        console.error("\n❌ ERRO: A variável de ambiente GEMINI_API_KEY não está definida.");
        console.log("Por favor, crie um arquivo '.env' na raiz do projeto e defina a chave:");
        console.log("GEMINI_API_KEY=\"SUA_CHAVE_AQUI\"");
        return;
    }

    try {
        // 2. Carregar a base de conhecimento existente
        let existingKnowledge = [];
        try {
            const data = await fs.readFile(KNOWLEDGE_FILE, 'utf-8');
            existingKnowledge = JSON.parse(data);
            console.log(`Base de conhecimento inicial carregada. Total de itens: ${existingKnowledge.length}`);
        } catch (e) {
            if (e.code === 'ENOENT') {
                console.log(`O arquivo ${KNOWLEDGE_FILE} não foi encontrado. Iniciando com uma base vazia.`);
            } else {
                throw new Error(`Erro ao ler/analisar ${KNOWLEDGE_FILE}: ${e.message}`);
            }
        }

        // 3. Gerar as novas entradas
        console.log("Aumentando sua base de conhecimento!");
        const newKnowledge = await generateNewKnowledge(existingKnowledge);

        // 4. Combinar as bases
        const totalKnowledge = [...existingKnowledge, ...newKnowledge];
        console.log(`Base de conhecimento combinada. Total final de itens: ${totalKnowledge.length}`);

        // 5. Salvar a nova base no arquivo
        await fs.writeFile(KNOWLEDGE_FILE, JSON.stringify(totalKnowledge, null, 2), 'utf-8');
        console.log(`\n🎉 SUCESSO!`);
        console.log(`O arquivo '${KNOWLEDGE_FILE}' foi atualizado com ${totalKnowledge.length} itens.`);

    } catch (error) {
        console.error("\n❌ ERRO FATAL:", error.message);
        console.log("\n⚠️ AÇÃO NECESSÁRIA:");
        console.log("1. Verifique se sua chave de API no arquivo '.env' está correta e sem aspas extras.");
        console.log("2. Confirme se a API do Gemini está habilitada no seu projeto no Google Cloud.");
    }
}

main();