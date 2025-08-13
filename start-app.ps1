# ClipChain - PowerShell Launch Script
# Este script inicia tanto el servidor backend como el frontend

Write-Host "🚀 Iniciando ClipChain..." -ForegroundColor Green
Write-Host "==========================" -ForegroundColor Green

# Función para limpiar procesos al salir
function Cleanup {
    Write-Host ""
    Write-Host "🛑 Deteniendo servicios..." -ForegroundColor Yellow
    
    # Detener procesos de Node.js
    Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force -ErrorAction SilentlyContinue
    Get-Process | Where-Object {$_.ProcessName -eq "npm"} | Stop-Process -Force -ErrorAction SilentlyContinue
    
    Write-Host "✅ Servicios detenidos" -ForegroundColor Green
    exit 0
}

# Capturar Ctrl+C para limpiar procesos
trap { Cleanup }

# Verificar que estemos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto." -ForegroundColor Red
    exit 1
}

# Verificar que las dependencias estén instaladas
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
    npm install
}

Write-Host "🔧 Iniciando servidor backend (puerto 9000)..." -ForegroundColor Blue
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "run", "server:dev"
$serverProcess = Get-Process | Where-Object {$_.ProcessName -eq "node" -and $_.CommandLine -like "*server.js*"}

Write-Host "⏳ Esperando que el servidor esté listo..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Verificar que el servidor esté funcionando
try {
    $response = Invoke-WebRequest -Uri "http://localhost:9000/" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Servidor backend funcionando en puerto 9000" -ForegroundColor Green
    } else {
        throw "Status code: $($response.StatusCode)"
    }
} catch {
    Write-Host "❌ Error: El servidor backend no está respondiendo" -ForegroundColor Red
    Cleanup
}

Write-Host "🎨 Iniciando frontend (puerto 5173)..." -ForegroundColor Green
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "run", "dev"
$frontendProcess = Get-Process | Where-Object {$_.ProcessName -eq "node" -and $_.CommandLine -like "*vite*"}

Write-Host ""
Write-Host "🎉 ¡ClipChain iniciado exitosamente!" -ForegroundColor Green
Write-Host "==========================" -ForegroundColor Green
Write-Host "📱 Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "🔧 Backend:  http://localhost:9000" -ForegroundColor Cyan
Write-Host "🧪 Prueba DB: http://localhost:5173/database-test" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Presiona Ctrl+C para detener todos los servicios" -ForegroundColor Yellow
Write-Host ""

# Mantener el script ejecutándose
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    Cleanup
}
