#!/bin/bash

# ClipChain - Script de Configuración de Base de Datos
# Este script configura MongoDB y la base de datos inicial

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Función para logging
log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Función para verificar MongoDB
check_mongodb() {
    log "Verificando MongoDB..."
    
    if ! command -v mongod >/dev/null 2>&1; then
        error "MongoDB no está instalado. Por favor instala MongoDB primero."
        echo "Instrucciones de instalación:"
        echo "  macOS: brew install mongodb-community"
        echo "  Ubuntu: sudo apt-get install mongodb"
        echo "  Windows: Descarga desde https://www.mongodb.com/try/download/community"
        exit 1
    fi
    
    if ! pgrep -x "mongod" >/dev/null; then
        warning "MongoDB no está ejecutándose. Iniciando..."
        mongod --fork --logpath /tmp/mongod.log --dbpath /tmp/mongodb
        sleep 2
    fi
    
    success "MongoDB está ejecutándose"
}

# Función para configurar la base de datos
setup_database() {
    log "Configurando base de datos..."
    
    # Verificar que el servidor esté ejecutándose
    if ! curl -s http://localhost:9000/api/health >/dev/null 2>&1; then
        error "El servidor backend no está ejecutándose. Inicia el servidor primero."
        exit 1
    fi
    
    # Inicializar base de datos
    log "Inicializando base de datos..."
    npm run db:init
    
    # Sembrar datos de ejemplo
    log "Sembrando datos de ejemplo..."
    npm run db:seed
    
    success "Base de datos configurada correctamente"
}

# Función para verificar la conexión
test_connection() {
    log "Probando conexión a la base de datos..."
    
    if npm run db:test; then
        success "Conexión a la base de datos exitosa"
    else
        error "No se pudo conectar a la base de datos"
        exit 1
    fi
}

# Función para mostrar estado
show_status() {
    log "Estado de la base de datos:"
    echo ""
    
    # Verificar MongoDB
    if pgrep -x "mongod" >/dev/null; then
        echo -e "  MongoDB: ${GREEN}✅ Ejecutándose${NC}"
    else
        echo -e "  MongoDB: ${RED}❌ No ejecutándose${NC}"
    fi
    
    # Verificar servidor
    if curl -s http://localhost:9000/api/health >/dev/null 2>&1; then
        echo -e "  Servidor: ${GREEN}✅ Ejecutándose${NC}"
    else
        echo -e "  Servidor: ${RED}❌ No ejecutándose${NC}"
    fi
    
    # Verificar base de datos
    if npm run db:test >/dev/null 2>&1; then
        echo -e "  Base de datos: ${GREEN}✅ Conectada${NC}"
    else
        echo -e "  Base de datos: ${RED}❌ No conectada${NC}"
    fi
}

# Función principal
main() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║              ClipChain Database Setup                        ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    # Verificar que estamos en el directorio correcto
    if [ ! -f "package.json" ]; then
        error "No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto."
        exit 1
    fi
    
    # Verificar dependencias
    if [ ! -d "node_modules" ]; then
        log "Instalando dependencias..."
        npm install
    fi
    
    # Configurar base de datos
    check_mongodb
    setup_database
    test_connection
    
    echo ""
    success "¡Configuración de base de datos completada!"
    echo ""
    show_status
}

# Ejecutar función principal
main "$@"

