#!/bin/bash

# ClipChain - Inicio Rápido
# Script simple para desarrollo rápido

set -e

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 ClipChain - Inicio Rápido${NC}"

# Función de limpieza
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Deteniendo...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    echo -e "${GREEN}✅ Detenido${NC}"
    exit 0
}

# Configurar trap para limpiar al salir
trap cleanup SIGINT SIGTERM

# Limpiar puertos si están en uso
echo "🧹 Limpiando puertos..."
lsof -ti:9000 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
sleep 1

# Verificar dependencias básicas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

# Iniciar backend
echo "🔧 Iniciando backend..."
npm run server:dev &
BACKEND_PID=$!

# Esperar a que el backend esté listo
echo "⏳ Esperando backend..."
sleep 3

# Verificar backend (opcional)
if command -v curl >/dev/null 2>&1; then
    if curl -s http://localhost:9000/api/health >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend listo${NC}"
    else
        echo -e "${YELLOW}⚠️  Backend no responde, pero continuando...${NC}"
    fi
fi

# Iniciar frontend
echo "🎨 Iniciando frontend..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo -e "${GREEN}🎉 ¡ClipChain iniciado!${NC}"
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend:  http://localhost:9000"
echo -e "${YELLOW}💡 Ctrl+C para detener${NC}"
echo ""

# Esperar a que ambos procesos terminen
wait
