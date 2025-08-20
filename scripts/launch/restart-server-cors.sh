#!/bin/bash

echo "🔄 Reiniciando servidor con nueva configuración de CORS..."
echo ""

# Verificar si el servidor está corriendo
if pgrep -f "node.*server.js" > /dev/null; then
    echo "🛑 Deteniendo servidor actual..."
    pkill -f "node.*server.js"
    sleep 2
fi

# Limpiar puerto 9000 si está ocupado
if lsof -Pi :9000 -sTCP:LISTEN -t >/dev/null ; then
    echo "🧹 Limpiando puerto 9000..."
    lsof -ti:9000 | xargs kill -9
    sleep 1
fi

echo "🚀 Iniciando servidor con nueva configuración de CORS..."
echo ""

# Ir al directorio del servidor e iniciar
cd server
npm start &
SERVER_PID=$!

echo "⏳ Esperando que el servidor esté listo..."
sleep 3

# Verificar si el servidor está corriendo
if kill -0 $SERVER_PID 2>/dev/null; then
    echo "✅ Servidor iniciado exitosamente en puerto 9000"
    echo ""
    echo "🌐 URLs disponibles:"
    echo "   Backend: http://localhost:9000"
    echo "   API:     http://localhost:9000/api"
    echo ""
    echo "🧪 Para probar CORS, abre: scripts/tools/test-cors.html"
    echo ""
    echo "📝 Logs del servidor (Ctrl+C para detener):"
    echo ""
    
    # Mostrar logs del servidor
    wait $SERVER_PID
else
    echo "❌ Error al iniciar el servidor"
    exit 1
fi
