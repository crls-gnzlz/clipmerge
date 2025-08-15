#!/bin/bash

# ClipChain - Script de Mantenimiento
# Este script limpia logs, procesos y archivos temporales

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

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Función para limpiar procesos
cleanup_processes() {
    log "Limpiando procesos de ClipChain..."
    
    local processes=(
        "nodemon.*server.js"
        "vite"
        "npm.*dev"
        "npm.*server:dev"
    )
    
    for pattern in "${processes[@]}"; do
        local pids=$(pgrep -f "$pattern" 2>/dev/null || true)
        if [ ! -z "$pids" ]; then
            log "Deteniendo procesos: $pattern"
            echo $pids | xargs kill -9 2>/dev/null || true
        fi
    done
    
    success "Procesos limpiados"
}

# Función para limpiar puertos
cleanup_ports() {
    log "Limpiando puertos..."
    
    local ports=("3000" "9000" "5173")
    
    for port in "${ports[@]}"; do
        local pids=$(lsof -ti:$port 2>/dev/null || true)
        if [ ! -z "$pids" ]; then
            log "Limpiando puerto $port"
            echo $pids | xargs kill -9 2>/dev/null || true
        fi
    done
    
    success "Puertos limpiados"
}

# Función para limpiar logs
cleanup_logs() {
    log "Limpiando logs..."
    
    # Limpiar logs del servidor
    if [ -d "server/logs" ]; then
        find server/logs -name "*.log" -mtime +7 -delete 2>/dev/null || true
        log "Logs del servidor limpiados"
    fi
    
    # Limpiar logs temporales del sistema
    if [ -f "/tmp/mongod.log" ]; then
        rm /tmp/mongod.log 2>/dev/null || true
        log "Log de MongoDB limpiado"
    fi
    
    success "Logs limpiados"
}

# Función para limpiar archivos temporales
cleanup_temp() {
    log "Limpiando archivos temporales..."
    
    # Limpiar node_modules si es muy grande
    if [ -d "node_modules" ]; then
        local size=$(du -sh node_modules | cut -f1)
        log "Tamaño de node_modules: $size"
        
        if [[ $size == *"G"* ]] || [[ $size == *"M"* && ${size%M} -gt 500 ]]; then
            warning "node_modules es muy grande. Considera reinstalar dependencias."
            read -p "¿Quieres eliminar node_modules y reinstalar? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                log "Eliminando node_modules..."
                rm -rf node_modules
                log "Reinstalando dependencias..."
                npm install
                success "Dependencias reinstaladas"
            fi
        fi
    fi
    
    # Limpiar archivos de build
    if [ -d "dist" ]; then
        rm -rf dist
        log "Carpeta dist eliminada"
    fi
    
    success "Archivos temporales limpiados"
}

# Función para mostrar estado del sistema
show_system_status() {
    log "Estado del sistema:"
    echo ""
    
    # Procesos
    local processes=$(pgrep -f "nodemon.*server.js|vite|npm.*dev" | wc -l)
    echo -e "  Procesos activos: $processes"
    
    # Puertos
    local ports_used=0
    for port in 3000 9000 5173; do
        if lsof -ti:$port >/dev/null 2>&1; then
            ports_used=$((ports_used + 1))
        fi
    done
    echo -e "  Puertos en uso: $ports_used/3"
    
    # Espacio en disco
    local disk_usage=$(df -h . | tail -1 | awk '{print $5}')
    echo -e "  Uso de disco: $disk_usage"
    
    # Memoria
    local mem_usage=$(free -h 2>/dev/null | grep Mem | awk '{print $3"/"$2}' || echo "N/A")
    echo -e "  Uso de memoria: $mem_usage"
}

# Función principal
main() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                ClipChain Maintenance                        ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    # Verificar que estamos en el directorio correcto
    if [ ! -f "package.json" ]; then
        echo "❌ Error: No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto."
        exit 1
    fi
    
    # Mostrar estado actual
    show_system_status
    echo ""
    
    # Ejecutar limpieza
    cleanup_processes
    cleanup_ports
    cleanup_logs
    cleanup_temp
    
    echo ""
    success "¡Mantenimiento completado!"
    echo ""
    
    # Mostrar estado final
    show_system_status
}

# Ejecutar función principal
main "$@"

