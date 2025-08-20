#!/bin/bash

# Script to start backend, frontend, and ngrok for Clipchain testing

FRONTEND_PORT=5173
BACKEND_PORT=9000

# Start backend server
if ! lsof -ti:$BACKEND_PORT > /dev/null 2>&1; then
  echo "🚀 Starting backend server on port $BACKEND_PORT..."
  (npm run server &)
  sleep 2
else
  echo "✅ Backend already running on port $BACKEND_PORT."
fi

# Start frontend app
if ! lsof -ti:$FRONTEND_PORT > /dev/null 2>&1; then
  echo "🚀 Starting frontend app on port $FRONTEND_PORT..."
  (npm run dev &)
  sleep 2
else
  echo "✅ Frontend already running on port $FRONTEND_PORT."
fi

# Wait for frontend to be available
while ! lsof -ti:$FRONTEND_PORT > /dev/null 2>&1; do
  echo "⏳ Waiting for frontend to start on port $FRONTEND_PORT..."
  sleep 1
done

echo "✅ Port $FRONTEND_PORT is active."
echo "🌐 Starting ngrok tunnel on port $FRONTEND_PORT..."
echo ""

# Start ngrok
ngrok http $FRONTEND_PORT

echo ""
echo "🎯 Once ngrok is running:"
echo "1. Copy the HTTPS URL from ngrok (e.g., https://abc123.ngrok.io)"
echo "2. Go to http://localhost:$FRONTEND_PORT/create"
echo "3. Switch to 'Embed Mode'"
echo "4. The embed code will now use the ngrok URL"
echo "5. Test the embed by copying the code to another website"












