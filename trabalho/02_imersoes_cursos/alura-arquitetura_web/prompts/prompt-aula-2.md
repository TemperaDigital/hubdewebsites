# Prompts - Aula 2

1. Crie um ambiente virtual em Python usando a venv e faça a ativação

2. Instale o uvicorn na venv deste projeto

3. Você vai criar o primeiro servidor de uma API de álbum de figurinhas.

   Crie um arquivo main.py com um servidor FastAPI que tenha apenas 1 endpoint:

   1. GET "/" → retorna o JSON {"mensagem": "Olá, mundo! 🌍"}
      (use uma função chamada hello_world)

   Requisitos:
   - Use apenas Python com FastAPI (import: from fastapi import FastAPI)
   - Crie a aplicação com app = FastAPI()
   - Adicione comentários em português explicando cada parte
   - Não adicione nenhum outro endpoint

4. No mesmo arquivo main.py, adicione um segundo endpoint, mantendo o endpoint "/" que já existe:

   2. GET "/figurinhas" → retorna uma lista com 2 figurinhas de exemplo
      (use uma função chamada listar_figurinhas)
      Cada figurinha é um objeto com os campos:
        - id (número inteiro)
        - nome (texto)
        - categoria (texto)
      Use estas duas figurinhas:
        - {id: 1, nome: "Alan Turing",   categoria: "IA"}
        - {id: 2, nome: "John McCarthy", categoria: "IA"}

   Requisitos:
   - Mantenha tudo que já existe no arquivo
   - Adicione comentários em português
   - Não adicione nenhum endpoint além desses dois
