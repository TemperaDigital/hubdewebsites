# Portal SPC — v2 (Híbrido)

## Como usar
1. Copie esta pasta (sem `spc.yaml`) para `/DATA/AppData/spc-portal/` no ZimaOS.
2. Importe `spc.yaml` no CasaOS/ZimaOS.
3. Edite **`js/config.js`** e coloque a URL pública do backend Lovable após publicar:
   `window.SPC_API = "https://SEU-PROJETO.lovable.app";`
4. Ajuste `SPC_WHATSAPP` com o número real (formato `5521XXXXXXXXX`).
5. Acesse: http://192.168.1.153:8088/

## Backend (Lovable Cloud)
- Painel admin: `https://SEU-PROJETO.lovable.app/admin`
- Login: cadastre-se em `/login` com **alexandre.guerra51@icloud.com** — virá automaticamente como admin pelo trigger do banco.
- Endpoints públicos (CORS aberto, consumidos por este site):
  - `GET /api/public/news`
  - `GET /api/public/notices`
  - `GET /api/public/faq?q=&cat=`
  - `GET|POST /api/public/questions`
  - `POST /api/public/messages` (multipart com arquivo opcional)

## Pré-requisito
O ZimaOS precisa de acesso à internet para chamar `*.lovable.app`.
