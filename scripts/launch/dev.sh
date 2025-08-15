#!/bin/bash

# ClipChain - Script de Desarrollo
# Script simple para desarrollo diario

set -e

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 ClipChain - Modo Desarrollo${NC}"

# Limpiar puertos si están en uso
echo "🧹 Limpiando puertos..."
lsof -ti:9000 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
sleep 1

# Iniciar backend
echo "🔧 Iniciando backend..."
npm run server:dev &
BACKEND_PID=$!

# Esperar a que el backend esté listo
echo "⏳ Esperando backend..."
sleep 5

# Verificar backend
if curl -s http://localhost:9000/api/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend listo${NC}"
else
    echo "⚠️  Backend no responde, pero continuando..."
fi

# Iniciar frontend
echo "🎨 Iniciando frontend..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo -e "${GREEN}🎉 ClipChain iniciado!${NC}"
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend:  http://localhost:9000"
echo "💡 Ctrl+C para detener"
echo ""

# Función de limpieza
cleanup() {
    echo ""
    echo "🛑 Deteniendo servicios..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    echo "✅ Servicios detenidos"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Esperar
wait

