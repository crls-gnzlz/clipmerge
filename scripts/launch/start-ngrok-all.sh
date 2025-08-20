#!/bin/bash

echo "🚀 Starting ngrok with all tunnels..."
echo "📁 Using configuration from ngrok.yml"
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

echo "✅ Starting ngrok with all tunnels..."
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:9000"
echo ""
echo "🌐 ngrok dashboard will be available at: http://localhost:4040"
echo ""

# Start ngrok with all tunnels
ngrok start --all --config ngrok.yml
