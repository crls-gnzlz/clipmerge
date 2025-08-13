#!/bin/bash

# ClipChain - Launch Script con Concurrently
# Este script usa concurrently para manejar múltiples procesos

echo "🚀 Iniciando ClipChain con Concurrently..."
echo "=========================================="

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

# Verificar si concurrently está instalado
if ! npm list concurrently > /dev/null 2>&1; then
    echo "📦 Instalando concurrently..."
    npm install --save-dev concurrently
fi

echo "🔧 Iniciando servidor y frontend en paralelo..."
echo ""

# Usar concurrently para ejecutar ambos comandos
npx concurrently \
    --names "Backend,Frontend" \
    --prefix-colors "blue,green" \
    --kill-others \
    "npm run server:dev" \
    "sleep 5 && npm run dev"

echo ""
echo "🎉 ¡ClipChain iniciado exitosamente!"
echo "=========================================="
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend:  http://localhost:9000"
echo "🧪 Prueba DB: http://localhost:5173/database-test"
