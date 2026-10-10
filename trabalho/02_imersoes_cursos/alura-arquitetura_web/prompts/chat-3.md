### User Input

Evolua o servidor da API de álbum de figurinhas para também servir
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

*Viewed [main.py](file:///c:/Users/aleti/OneDrive/%C3%81rea%20de%20Trabalho/backend/main.py) *

*Listed directory [backend](file:///c:/Users/aleti/OneDrive/%C3%81rea%20de%20Trabalho/backend) *

*Listed directory [figurinhas](file:///c:/Users/aleti/OneDrive/%C3%81rea%20de%20Trabalho/backend/figurinhas) *

*Edited relevant file*

### Planner Response

O arquivo [main.py](file:///c:/Users/aleti/OneDrive/Área de Trabalho/backend/main.py) foi atualizado para servir os arquivos estáticos da pasta [figurinhas](file:///c:/Users/aleti/OneDrive/Área de Trabalho/backend/figurinhas) através da rota `/imgs`.

Aqui está o código implementado com os comentários explicativos:

```python
import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

# Cria a instância da aplicação FastAPI
app = FastAPI()

# Define os caminhos absolutos para encontrar a pasta de imagens de forma robusta
PASTA_BASE = os.path.dirname(os.path.abspath(__file__))
PASTA_IMAGENS = os.path.join(PASTA_BASE, "figurinhas")

# Configura o serviço de arquivos estáticos montando a pasta de imagens na rota "/imgs"
app.mount("/imgs", StaticFiles(directory=PASTA_IMAGENS), name="imgs")

# Lista de figurinhas de exemplo da API
figurinhas = [
    {
        "id": 1,
        "nome": "Alan Turing",
        "categoria": "IA",
        "imagem_url": "/imgs/01-alan-turing.jpg"
    },
    {
        "id": 2,
        "nome": "John McCarthy",
        "categoria": "IA",
        "imagem_url": "/imgs/02-john-mccarthy.jpg"
    }
]

# Define o único endpoint para listar as figurinhas cadastradas
@app.get("/figurinhas")
def listar_figurinhas():
    # Retorna a lista de figurinhas
    return figurinhas
```

### Como testar

Seu servidor de desenvolvimento com o `--reload` irá recarregar automaticamente. Agora você pode acessar:

1. **Endpoint para listar as figurinhas ([listar_figurinhas](file:///c:/Users/aleti/OneDrive/Área de Trabalho/backend/main.py#L31)):** [http://127.0.0.1:8000/figurinhas](http://127.0.0.1:8000/figurinhas)
2. **Imagens estáticas:**
   - Alan Turing: [http://127.0.0.1:8000/imgs/01-alan-turing.jpg](http://127.0.0.1:8000/imgs/01-alan-turing.jpg)
   - John McCarthy: [http://127.0.0.1:8000/imgs/02-john-mccarthy.jpg](http://127.0.0.1:8000/imgs/02-john-mccarthy.jpg)