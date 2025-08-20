# PowerShell script to start ngrok with all tunnels
Write-Host "🚀 Starting ngrok with all tunnels..." -ForegroundColor Green
Write-Host "📁 Using configuration from ngrok.yml" -ForegroundColor Cyan
Write-Host ""

# Check if ngrok is installed
try {
    $ngrokVersion = ngrok version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "ngrok not found"
    }
} catch {
    Write-Host "❌ ngrok is not installed. Please install it first." -ForegroundColor Red
    Write-Host "   Visit: https://ngrok.com/download" -ForegroundColor Yellow
    exit 1
}

# Check if ngrok.yml exists
if (-not (Test-Path "ngrok.yml")) {
    Write-Host "❌ ngrok.yml not found in current directory" -ForegroundColor Red
    Write-Host "   Please run this script from the project root directory" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Starting ngrok with all tunnels..." -ForegroundColor Green
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "   Backend:  http://localhost:9000" -ForegroundColor White
Write-Host ""
Write-Host "🌐 ngrok dashboard will be available at: http://localhost:4040" -ForegroundColor Cyan
Write-Host ""

# Start ngrok with all tunnels
ngrok start --all --config ngrok.yml
