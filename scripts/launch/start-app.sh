#!/bin/bash

# ClipChain - Script Principal de Lanzamiento
# Este script inicia la aplicación completa con verificaciones previas

set -e  # Exit on any error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Función para verificar si un puerto está en uso
port_in_use() {
    lsof -ti:$1 >/dev/null 2>&1
}

# Función para limpiar procesos en puertos específicos
cleanup_ports() {
    local ports=("3000" "9000" "5173")
    
    for port in "${ports[@]}"; do
        if port_in_use $port; then
            local pids=$(lsof -ti:$port)
            log "Puerto $port está en uso. Limpiando procesos..."
            echo $pids | xargs kill -9 2>/dev/null || true
            sleep 1
        fi
    done
}

# Función para verificar dependencias
check_dependencies() {
    log "Verificando dependencias..."
    
    if ! command_exists node; then
        error "Node.js no está instalado. Por favor instala Node.js primero."
        exit 1
    fi
    
    if ! command_exists npm; then
        error "npm no está instalado. Por favor instala npm primero."
        exit 1
    fi
    
    if ! command_exists mongod; then
        warning "MongoDB no está instalado o no está en PATH. La aplicación puede no funcionar correctamente."
    fi
    
    success "Dependencias verificadas"
}

# Función para verificar si las dependencias de npm están instaladas
check_npm_dependencies() {
    log "Verificando dependencias de npm..."
    
    if [ ! -d "node_modules" ]; then
        log "Instalando dependencias de npm..."
        npm install
    fi
    
    success "Dependencias de npm verificadas"
}

# Función para verificar la base de datos
check_database() {
    log "Verificando conexión a la base de datos..."
    
    # Intentar conectar a MongoDB
    if command_exists mongosh; then
        if mongosh --eval "db.runCommand('ping')" >/dev/null 2>&1; then
            success "Base de datos MongoDB accesible"
        else
            warning "No se puede conectar a MongoDB. Asegúrate de que esté ejecutándose."
        fi
    else
        warning "mongosh no está disponible. No se puede verificar la base de datos."
    fi
}

# Función para iniciar el servidor backend
start_backend() {
    log "Iniciando servidor backend..."
    
    if port_in_use 9000; then
        warning "Puerto 9000 ya está en uso. Limpiando..."
        cleanup_ports
    fi
    
    # Iniciar backend en background
    npm run server:dev &
    BACKEND_PID=$!
    
    # Esperar a que el backend esté listo
    log "Esperando a que el backend esté listo..."
    local attempts=0
    local max_attempts=30
    
    while [ $attempts -lt $max_attempts ]; do
        if curl -s http://localhost:9000/api/health >/dev/null 2>&1; then
            success "Backend iniciado correctamente en puerto 9000"
            break
        fi
        
        attempts=$((attempts + 1))
        sleep 1
        
        if [ $attempts -eq $max_attempts ]; then
            error "Backend no respondió después de $max_attempts intentos"
            kill $BACKEND_PID 2>/dev/null || true
            exit 1
        fi
    done
}

# Función para iniciar el frontend
start_frontend() {
    log "Iniciando frontend..."
    
    if port_in_use 5173; then
        warning "Puerto 5173 ya está en uso. Limpiando..."
        cleanup_ports
    fi
    
    # Iniciar frontend
    npm run dev
}

# Función para manejar la señal de interrupción
cleanup() {
    log "Recibida señal de interrupción. Limpiando..."
    
    if [ ! -z "$BACKEND_PID" ]; then
        log "Deteniendo backend (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null || true
    fi
    
    cleanup_ports
    success "Limpieza completada"
    exit 0
}

# Configurar trap para limpiar al salir
trap cleanup SIGINT SIGTERM

# Función principal
main() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    ClipChain Launcher                        ║"
    echo "║                                                              ║"
    echo "║  Iniciando aplicación completa...                           ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    # Verificar que estamos en el directorio correcto
    if [ ! -f "package.json" ]; then
        error "No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto."
        exit 1
    fi
    
    # Verificaciones previas
    check_dependencies
    check_npm_dependencies
    check_database
    
    # Limpiar puertos si es necesario
    cleanup_ports
    
    # Iniciar servicios
    start_backend
    start_frontend
}

# Ejecutar función principal
main "$@"
