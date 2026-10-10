Você vai criar a versão final do servidor da API de álbum de figurinhas.
Ele precisa liberar acesso para o frontend (CORS), listar as figurinhas e
entregar a imagem de cada uma por um endpoint próprio.

Crie um arquivo main.py com um servidor FastAPI que:

1. Configure o middleware CORS para aceitar requisições de qualquer origem

2. Defina caminhos absolutos para a pasta de imagens usando:
   PASTA_BASE = os.path.dirname(os.path.abspath(__file__))
   PASTA_IMAGENS = os.path.join(PASTA_BASE, "figurinhas")

3. Crie uma lista chamada `figurinhas` com as 30 figurinhas,
   cada uma com: id, nome, categoria, imagem_url
   O imagem_url deve apontar para "/figurinhas/{id}/imagem"
   Comente as figurinhas que ainda não estão disponíveis (ex: ids 3, 4, 5...)
   Deixe ativas apenas as figurinhas cujas imagens existem na pasta figurinhas/

4. Crie o endpoint GET "/figurinhas" que retorna a lista

5. Crie o endpoint GET "/figurinhas/{id}/imagem" que:
   - Usa glob para encontrar o arquivo com prefixo "{id:02d}[!0-9]*" na pasta figurinhas/
   - Retorna 404 se não encontrar
   - Retorna FileResponse com o arquivo encontrado

Imports necessários:
  from fastapi import FastAPI, HTTPException
  from fastapi.responses import FileResponse
  from fastapi.middleware.cors import CORSMiddleware
  import os
  import glob
