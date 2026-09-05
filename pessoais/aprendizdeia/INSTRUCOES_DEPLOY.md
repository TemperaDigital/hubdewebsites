# 🚀 Guia de Deploy - Aprendiz de Programação no ZimaOS

## Resumo do Problema Original

O arquivo `index.html` que você tinha era um **template React/SPA**, não um arquivo HTML standalone. Ele esperava:
- Uma aplicação React compilada em `/src/main.tsx`
- Processo de build com Vite/TypeScript
- Assets bundled pelo webpack/vite

Quando servido diretamente, a página ficava em branco porque a `<div id="root">` nunca era preenchida pelo JavaScript.

---

## ✅ Solução Entregue

### Três arquivos criados:

1. **`index.html`** - HTML completo e standalone
   - ✨ Sem dependências de build
   - 📱 Totalmente responsivo
   - 🎨 Design baseado nas imagens que você mostrou
   - ⚡ Funciona imediatamente quando servido

2. **`docker-compose.yml`** - Orquestração para ZimaOS
   - 🐳 Usa Nginx Alpine (extremamente leve)
   - 🔄 Health checks automáticos
   - 🔐 Restart automático se falhar
   - 🌐 Network isolada

3. **`nginx.conf`** - Configuração Nginx otimizada
   - 📦 Gzip compression ativado
   - 💾 Cache inteligente (HTML vs Assets)
   - 🔒 Headers de segurança
   - 🚀 Performance otimizada

---

## 📋 Pré-requisitos

- Docker e Docker Compose instalados no ZimaOS
- Acesso SSH ao seu servidor
- Porta 8083 disponível (ou você pode mudar no docker-compose.yml)

---

## 🛠️ Instalação Passo a Passo

### 1️⃣ Crie um diretório para o projeto

```bash
mkdir -p ~/apps/aprendiz-web
cd ~/apps/aprendiz-web
```

### 2️⃣ Copie os três arquivos para o diretório

```
~/apps/aprendiz-web/
├── index.html
├── docker-compose.yml
└── nginx.conf
```

Você pode fazer via SCP:
```bash
scp index.html seu-usuario@192.168.1.153:~/apps/aprendiz-web/
scp docker-compose.yml seu-usuario@192.168.1.153:~/apps/aprendiz-web/
scp nginx.conf seu-usuario@192.168.1.153:~/apps/aprendiz-web/
```

### 3️⃣ Inicie o container

```bash
cd ~/apps/aprendiz-web
docker-compose up -d
```

### 4️⃣ Verifique se está rodando

```bash
docker-compose ps
```

Esperado:
```
NAME            STATUS              PORTS
aprendiz-web    Up 2 seconds        0.0.0.0:8083->80/tcp
```

### 5️⃣ Teste no navegador

Acesse: **http://192.168.1.153:8083**

---

## 🔧 Troubleshooting

### A página ainda está em branco?

```bash
# Ver logs do container
docker-compose logs -f aprendiz-web

# Verificar se o arquivo index.html está dentro do container
docker-compose exec aprendiz-web ls -la /usr/share/nginx/html/

# Testar conexão direto
docker-compose exec aprendiz-web curl -I http://localhost/
```

### Porta 8083 já está em uso?

Edite `docker-compose.yml` e mude:
```yaml
ports:
  - "8084:80"  # Mude para 8084 ou outra porta
```

Depois: `docker-compose up -d`

### Health check falhando?

```bash
docker-compose exec aprendiz-web wget --verbose http://localhost/
```

---

## 🔌 Integração com Cloudflare Tunnel

Para expor isso com Cloudflare Tunnel (mantendo seguro):

```bash
# Adicione um tunnel apontando para seu container
cloudflared tunnel route dns seu-tunnel-name aprendiz.seu-dominio.com

# Configure para apontar para http://192.168.1.153:8083
```

---

## 📝 Editar o HTML

Se quiser customizar cores, textos ou layout:

```bash
# Edite o arquivo localmente
nano index.html

# Recarregue (o container pega automaticamente)
docker-compose restart aprendiz-web
```

Cores principais (no `:root` do CSS):
```css
--primary-blue: #4570E8;      /* Azul principal */
--bg-light: #F5F7FA;          /* Fundo claro */
--text-dark: #1F2937;         /* Texto escuro */
--text-muted: #6B7280;        /* Texto muted */
```

---

## 🚀 Fazer Atualizações

### Para atualizar o HTML sem derrubar o container:

```bash
# 1. Edite o arquivo local
nano index.html

# 2. Copie para o container (sem rebudar)
docker cp index.html aprendiz-web:/usr/share/nginx/html/

# 3. Recarregue no navegador (Ctrl+Shift+R)
```

### Ou com docker-compose:

```bash
docker-compose down
docker-compose up -d
```

---

## 📊 Monitoramento

### Ver uso de recursos:

```bash
docker stats aprendiz-web
```

### Ver logs em tempo real:

```bash
docker-compose logs -f --tail 50 aprendiz-web
```

### Verificar saúde:

```bash
curl -I http://192.168.1.153:8083/health
# Esperado: HTTP/1.1 200 OK
```

---

## 🎯 Próximos Passos

1. **Adicionar conteúdo real ao blog**
   - Criar seção com posts estáticos
   - Ou integrar com um backend (Node.js, Python, etc)

2. **Conectar com o backend Lovable**
   - Se ainda quiser usar o backend gerenciado
   - Configure um proxy reverso no nginx

3. **Melhorar performance**
   - Adicionar webp para imagens
   - CDN local com Cloudflare

4. **SSL/HTTPS**
   - Recomendo via Cloudflare Tunnel
   - Ou Let's Encrypt com Certbot

---

## 🐛 Se Ainda Não Funcionar

Envie os logs:

```bash
docker-compose logs aprendiz-web > logs.txt
cat /proc/cpuinfo | head -20 >> logs.txt
```

Compartilhe o `logs.txt` comigo!

---

## 📄 Resumo das Mudanças vs Arquivo Original

| Aspecto | Original | Novo |
|---------|----------|------|
| **Tipo** | React SPA template | HTML standalone |
| **Dependências** | Vite, React, TypeScript | Nenhuma |
| **Build process** | Necessário | Não necessário |
| **Renderização** | Client-side React | HTML direto |
| **Performance** | Mais lento (framework) | Muito rápido |
| **Tamanho** | 50-100KB+ (após build) | ~15KB |
| **Cache** | Complexo | Simples e eficiente |

---

**🎉 Pronto! Seu site agora vai renderizar perfeitamente no 192.168.1.153:8083**
