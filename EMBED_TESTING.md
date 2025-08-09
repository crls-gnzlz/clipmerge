# 🎯 Embed Testing Guide

This guide explains how to test the Clipchain embed functionality using ngrok.

## 🚀 Quick Start

### 1. Start the Development Server
```bash
npm run dev
```
This will start the application on `http://localhost:5176`

### 2. Start ngrok Tunnel
```bash
./start-ngrok.sh
```
Or manually:
```bash
ngrok http 5176
```

### 3. Test the Embed Functionality

1. **Open the Create Clip page**: Navigate to `http://localhost:5176/create`
2. **Switch to Embed Mode**: Click the "Embed Mode" toggle
3. **Copy the embed code**: The code will now use the ngrok URL
4. **Test the embed**: Paste the code in any HTML file or website

## 🔗 Example Embed Code

Once ngrok is running, the embed code will look like this:
```html
<iframe 
  src="https://abc123.ngrok.io/embed/llm-tutorial"
  width="640" 
  height="360" 
  frameborder="0" 
  allowfullscreen>
</iframe>
```

## 🎮 Testing Steps

### Step 1: Verify ngrok is running
- Look for the ngrok interface showing the HTTPS URL
- Example: `https://abc123.ngrok.io`

### Step 2: Test the embed page directly
- Visit: `https://abc123.ngrok.io/embed/llm-tutorial`
- You should see the Clipchain player without the header

### Step 3: Test the embed code
1. Create a simple HTML file:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Embed Test</title>
</head>
<body>
    <h1>Clipchain Embed Test</h1>
    <iframe 
        src="https://abc123.ngrok.io/embed/llm-tutorial"
        width="640" 
        height="360" 
        frameborder="0" 
        allowfullscreen>
    </iframe>
</body>
</html>
```

2. Open the HTML file in a browser
3. Verify the player loads and functions correctly

## 🔧 Troubleshooting

### Issue: ngrok not found
```bash
# Install ngrok
npm install -g ngrok
# Or download from https://ngrok.com/
```

### Issue: Port already in use
```bash
# Check what's using the port
lsof -ti:5176
# Kill the process if needed
kill -9 $(lsof -ti:5176)
```

### Issue: Embed not loading
- Check that ngrok is running and the URL is correct
- Verify the chainId exists (e.g., 'llm-tutorial', 'notion-tutorial')
- Check browser console for errors

## 📝 Notes

- The embed URL automatically detects if you're in development mode
- In development, it uses the current hostname (localhost or ngrok)
- In production, it will use `https://clipchain.app/embed/{chainId}`
- The embed page shows the player without the main site header
- All player controls work in the embedded version

## 🎯 Available Test Chains

- `llm-tutorial`: Learn about LLMs
- `notion-tutorial`: Master Notion Basics

## 🔄 Development Workflow

1. Start dev server: `npm run dev`
2. Start ngrok: `./start-ngrok.sh`
3. Test embed: Visit `http://localhost:5176/create` → Embed Mode
4. Copy code and test in external site
5. Iterate and improve!




