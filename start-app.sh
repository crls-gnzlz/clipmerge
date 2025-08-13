#!/bin/bash

# ClipChain - Launch Script
# Este script inicia tanto el servidor backend como el frontend

echo "🚀 Iniciando ClipChain..."
echo "=========================="

# Función para limpiar procesos al salir
cleanup() {
    echo ""
    echo "🛑 Deteniendo servicios..."
    pkill -f "nodemon.*server.js" 2>/dev/null
    pkill -f "vite" 2>/dev/null
    pkill -f "npm.*dev" 2>/dev/null
    pkill -f "npm.*server:dev" 2>/dev/null
    echo "✅ Servicios detenidos"
    exit 0
}

# Capturar Ctrl+C para limpiar procesos
trap cleanup SIGINT SIGTERM

# Verificar que estemos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto."
    exit 1
fi

# Verificar que las dependencias estén instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

echo "🔧 Iniciando servidor backend (puerto 9000)..."
npm run server:dev &
SERVER_PID=$!

echo "⏳ Esperando que el servidor esté listo..."
sleep 5

# Verificar que el servidor esté funcionando
if curl -s http://localhost:9000/ > /dev/null 2>&1; then
    echo "✅ Servidor backend funcionando en puerto 9000"
else
    echo "❌ Error: El servidor backend no está respondiendo"
    cleanup
fi

echo "🎨 Iniciando frontend (puerto 5173)..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "🎉 ¡ClipChain iniciado exitosamente!"
echo "=========================="
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend:  http://localhost:9000"
echo "🧪 Prueba DB: http://localhost:5173/database-test"
echo ""
echo "💡 Presiona Ctrl+C para detener todos los servicios"
echo ""

# Esperar a que ambos procesos terminen
wait $SERVER_PID $FRONTEND_PID
