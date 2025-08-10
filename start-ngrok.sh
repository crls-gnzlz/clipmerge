#!/bin/bash

# Script to start ngrok for testing embed functionality
echo "🚀 Starting ngrok for Clipchain embed testing..."
echo "📡 Local server should be running on port 5176"
echo ""

# Check if port 5176 is in use
if ! lsof -ti:5176 > /dev/null 2>&1; then
    echo "❌ Error: No process found on port 5176"
    echo "Please start the development server first with: npm run dev"
    exit 1
fi

echo "✅ Port 5176 is active"
echo "🌐 Starting ngrok tunnel..."
echo ""

# Start ngrok
ngrok http 5176

echo ""
echo "🎯 Once ngrok is running:"
echo "1. Copy the HTTPS URL from ngrok (e.g., https://abc123.ngrok.io)"
echo "2. Go to http://localhost:5176/create"
echo "3. Switch to 'Embed Mode'"
echo "4. The embed code will now use the ngrok URL"
echo "5. Test the embed by copying the code to another website"








