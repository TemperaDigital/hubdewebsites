# Prompts - Aula 3

1. Evolua o servidor da API de álbum de figurinhas para também servir
   as imagens das figurinhas como arquivos estáticos.

   Atualize o arquivo main.py com um servidor FastAPI que:

   1. Use a aplicação com app = FastAPI()

   2. Defina o caminho absoluto da pasta de imagens (para o servidor encontrar
      a pasta independente de onde for executado):
        PASTA_BASE = os.path.dirname(os.path.abspath(__file__))
        PASTA_IMAGENS = os.path.join(PASTA_BASE, "figurinhas")

   3. Configure os arquivos estáticos: "monte" a pasta PASTA_IMAGENS na rota "/imgs"
      usando StaticFiles, com name="imgs".
      Assim, "figurinhas/01-alan-turing.jpg" fica acessível em "/imgs/01-alan-turing.jpg".

   4. Tenha uma lista chamada "figurinhas" com 2 itens, cada um com os campos
      id, nome, categoria e imagem_url:
        - {id: 1, nome: "Alan Turing",   categoria: "IA", imagem_url: "/imgs/01-alan-turing.jpg"}
        - {id: 2, nome: "John McCarthy", categoria: "IA", imagem_url: "/imgs/02-john-mccarthy.jpg"}

   5. Tenha apenas um endpoint: GET "/figurinhas" (função listar_figurinhas)
      que retorna a lista de figurinhas.

   Requisitos:
   - Use Python com FastAPI
   - Adicione comentários em português explicando cada parte
   - Imports necessários:
       from fastapi import FastAPI
       from fastapi.staticfiles import StaticFiles
       import os
