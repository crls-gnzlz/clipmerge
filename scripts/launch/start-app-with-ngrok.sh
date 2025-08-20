#!/bin/bash

echo "🚀 Starting Clip Merger with ngrok tunnels..."
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed. Please install it first."
    echo "   Visit: https://ngrok.com/download"
    exit 1
fi

# Check if ngrok.yml exists
if [ ! -f "ngrok.yml" ]; then
    echo "❌ ngrok.yml not found in current directory"
    echo "   Please run this script from the project root directory"
    exit 1
fi

echo "✅ Configuration found. Starting services..."
echo ""

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    kill $FRONTEND_PID $BACKEND_PID $NGROK_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on exit
trap cleanup SIGINT SIGTERM

echo "🌐 Starting ngrok tunnels in background..."
ngrok start --all --config ngrok.yml &
NGROK_PID=$!

echo "⏳ Waiting for ngrok to start..."
sleep 3

echo "🔧 Starting backend server..."
cd server && npm start &
BACKEND_PID=$!
cd ..

echo "⏳ Waiting for backend to start..."
sleep 2

echo "🎨 Starting frontend development server..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ All services started successfully!"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:9000"
echo "   ngrok dashboard: http://localhost:4040"
echo ""
echo "🔄 Services are running. Press Ctrl+C to stop all services."
echo ""

# Wait for all background processes
wait
