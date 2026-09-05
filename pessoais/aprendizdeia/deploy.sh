#!/bin/bash

# ============================================
# Script de Deploy Automático - Aprendiz Web
# ============================================
# Este script automatiza o deploy no ZimaOS
# Uso: bash deploy.sh [start|stop|restart|logs|update|status]

set -e

PROJECT_DIR="$HOME/apps/aprendiz-web"
CONTAINER_NAME="aprendiz-web"
PORT=8083

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções de log
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se Docker está instalado
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker não está instalado!"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose não está instalado!"
        exit 1
    fi
    
    log_success "Docker e Docker Compose encontrados"
}

# Criar estrutura de diretórios
setup_structure() {
    log_info "Criando estrutura de diretórios..."
    
    if [ ! -d "$PROJECT_DIR" ]; then
        mkdir -p "$PROJECT_DIR"
        log_success "Diretório criado: $PROJECT_DIR"
    else
        log_info "Diretório já existe: $PROJECT_DIR"
    fi
}

# Verificar se arquivos estão presentes
check_files() {
    log_info "Verificando arquivos necessários..."
    
    local missing_files=0
    
    for file in "index.html" "docker-compose.yml" "nginx.conf"; do
        if [ ! -f "$PROJECT_DIR/$file" ]; then
            log_warning "Arquivo não encontrado: $file"
            missing_files=$((missing_files + 1))
        else
            log_success "✓ $file"
        fi
    done
    
    if [ $missing_files -gt 0 ]; then
        log_error "$missing_files arquivo(s) faltando!"
        exit 1
    fi
}

# Iniciar container
start_container() {
    log_info "Iniciando container..."
    cd "$PROJECT_DIR"
    
    docker-compose up -d
    
    log_success "Container iniciado com sucesso!"
    sleep 2
    show_status
}

# Parar container
stop_container() {
    log_info "Parando container..."
    cd "$PROJECT_DIR"
    
    docker-compose down
    
    log_success "Container parado com sucesso!"
}

# Reiniciar container
restart_container() {
    log_info "Reiniciando container..."
    cd "$PROJECT_DIR"
    
    docker-compose restart
    
    log_success "Container reiniciado com sucesso!"
    sleep 2
    show_status
}

# Mostrar status
show_status() {
    log_info "Status do container:"
    cd "$PROJECT_DIR"
    docker-compose ps
    
    echo ""
    log_info "Testando acesso..."
    
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/ | grep -q "200"; then
        log_success "✅ Servidor respondendo em http://localhost:$PORT/"
        log_success "✅ Acesso externo: http://192.168.1.153:$PORT/"
    else
        log_error "Servidor não respondendo"
    fi
}

# Mostrar logs
show_logs() {
    log_info "Exibindo logs (Ctrl+C para sair)..."
    cd "$PROJECT_DIR"
    docker-compose logs -f aprendiz-web
}

# Atualizar arquivo HTML
update_html() {
    if [ -z "$1" ]; then
        log_error "Especifique o caminho do arquivo HTML"
        exit 1
    fi
    
    if [ ! -f "$1" ]; then
        log_error "Arquivo não encontrado: $1"
        exit 1
    fi
    
    log_info "Atualizando index.html..."
    cp "$1" "$PROJECT_DIR/index.html"
    
    cd "$PROJECT_DIR"
    docker cp index.html $CONTAINER_NAME:/usr/share/nginx/html/
    
    log_success "HTML atualizado com sucesso!"
    log_info "Recarregue seu navegador para ver as mudanças"
}

# Health check
health_check() {
    log_info "Executando health check..."
    
    cd "$PROJECT_DIR"
    
    if [ ! "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
        log_warning "Container não está rodando"
        return 1
    fi
    
    local health=$(docker-compose exec -T aprendiz-web curl -s -o /dev/null -w "%{http_code}" http://localhost/)
    
    if [ "$health" = "200" ]; then
        log_success "Health check passou! (HTTP $health)"
        return 0
    else
        log_error "Health check falhou (HTTP $health)"
        return 1
    fi
}

# Limpeza
cleanup() {
    log_info "Limpando recursos (containers, volumes)..."
    cd "$PROJECT_DIR"
    
    docker-compose down -v
    
    log_success "Limpeza concluída!"
}

# Menu de ajuda
show_help() {
    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo "  🚀 Aprendiz de Programação - Deploy Script"
    echo "═══════════════════════════════════════════════════════════"
    echo ""
    echo "📖 Uso: $0 [comando]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  start      - Iniciar container"
    echo "  stop       - Parar container"
    echo "  restart    - Reiniciar container"
    echo "  status     - Mostrar status do container"
    echo "  logs       - Exibir logs em tempo real"
    echo "  update     - Atualizar arquivo HTML"
    echo "  health     - Executar health check"
    echo "  clean      - Limpar tudo (remove container e volumes)"
    echo "  help       - Exibir esta mensagem"
    echo ""
    echo "Exemplos:"
    echo "  $0 start"
    echo "  $0 logs"
    echo "  $0 update /caminho/para/novo/index.html"
    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo ""
}

# Main
main() {
    local command="${1:-help}"
    
    check_docker
    setup_structure
    
    case "$command" in
        start)
            check_files
            start_container
            ;;
        stop)
            stop_container
            ;;
        restart)
            check_files
            restart_container
            ;;
        status)
            show_status
            ;;
        logs)
            show_logs
            ;;
        update)
            update_html "$2"
            ;;
        health)
            health_check
            ;;
        clean)
            log_warning "Isto vai remover o container e volumes!"
            read -p "Tem certeza? (s/n): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Ss]$ ]]; then
                cleanup
            else
                log_info "Operação cancelada"
            fi
            ;;
        help)
            show_help
            ;;
        *)
            log_error "Comando desconhecido: $command"
            show_help
            exit 1
            ;;
    esac
}

main "$@"
