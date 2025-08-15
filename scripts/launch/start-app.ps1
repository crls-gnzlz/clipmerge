# ClipChain - Script Principal de Lanzamiento para Windows
# Este script inicia la aplicación completa con verificaciones previas

param(
    [switch]$Quick,
    [switch]$Dev,
    [switch]$Help
)

# Colores para output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"
$White = "White"

# Función para logging
function Write-Log {
    param([string]$Message, [string]$Color = $White)
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] $Message" -ForegroundColor $Color
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

# Función para verificar si un puerto está en uso
function Test-PortInUse {
    param([int]$Port)
    try {
        $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        return $connection -ne $null
    }
    catch {
        return $false
    }
}

# Función para limpiar procesos en puertos específicos
function Clear-Ports {
    $ports = @(3000, 9000, 5173)
    
    foreach ($port in $ports) {
        if (Test-PortInUse -Port $port) {
            Write-Log "Puerto $port está en uso. Limpiando procesos..." $Blue
            try {
                Get-NetTCPConnection -LocalPort $port | ForEach-Object {
                    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
                }
                Start-Sleep -Seconds 1
            }
            catch {
                Write-Warning "No se pudo limpiar el puerto $port"
            }
        }
    }
}

# Función para verificar dependencias
function Test-Dependencies {
    Write-Log "Verificando dependencias..." $Blue
    
    # Verificar Node.js
    try {
        $nodeVersion = node --version 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Node.js no está instalado. Por favor instala Node.js primero."
            exit 1
        }
        Write-Log "Node.js encontrado: $nodeVersion" $Green
    }
    catch {
        Write-Error "Node.js no está instalado. Por favor instala Node.js primero."
        exit 1
    }
    
    # Verificar npm
    try {
        $npmVersion = npm --version 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Error "npm no está instalado. Por favor instala npm primero."
            exit 1
        }
        Write-Log "npm encontrado: $npmVersion" $Green
    }
    catch {
        Write-Error "npm no está instalado. Por favor instala npm primero."
        exit 1
    }
    
    Write-Success "Dependencias verificadas"
}

# Función para verificar si las dependencias de npm están instaladas
function Test-NpmDependencies {
    Write-Log "Verificando dependencias de npm..." $Blue
    
    if (-not (Test-Path "node_modules")) {
        Write-Log "Instalando dependencias de npm..." $Blue
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Error instalando dependencias de npm"
            exit 1
        }
    }
    
    Write-Success "Dependencias de npm verificadas"
}

# Función para iniciar el servidor backend
function Start-Backend {
    Write-Log "Iniciando servidor backend..." $Blue
    
    if (Test-PortInUse -Port 9000) {
        Write-Warning "Puerto 9000 ya está en uso. Limpiando..."
        Clear-Ports
    }
    
    # Iniciar backend en background
    Start-Process -FilePath "npm" -ArgumentList "run", "server:dev" -WindowStyle Hidden
    $backendProcess = Get-Process | Where-Object { $_.ProcessName -eq "node" -and $_.CommandLine -like "*server.js*" } | Select-Object -First 1
    
    # Esperar a que el backend esté listo
    Write-Log "Esperando a que el backend esté listo..." $Blue
    $attempts = 0
    $maxAttempts = 30
    
    while ($attempts -lt $maxAttempts) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:9000/api/health" -TimeoutSec 1 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                Write-Success "Backend iniciado correctamente en puerto 9000"
                break
            }
        }
        catch {
            # Ignorar errores de conexión
        }
        
        $attempts++
        Start-Sleep -Seconds 1
        
        if ($attempts -eq $maxAttempts) {
            Write-Error "Backend no respondió después de $maxAttempts intentos"
            if ($backendProcess) {
                Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
            }
            exit 1
        }
    }
}

# Función para iniciar el frontend
function Start-Frontend {
    Write-Log "Iniciando frontend..." $Blue
    
    if (Test-PortInUse -Port 5173) {
        Write-Warning "Puerto 5173 ya está en uso. Limpiando..."
        Clear-Ports
    }
    
    # Iniciar frontend
    npm run dev
}

# Función para mostrar ayuda
function Show-Help {
    Write-Host @"
ClipChain Launcher - Scripts de lanzamiento para Windows

Uso:
    .\start-app.ps1              # Lanzamiento completo con verificaciones
    .\start-app.ps1 -Quick       # Inicio rápido sin verificaciones extensas
    .\start-app.ps1 -Dev         # Modo desarrollo con verificaciones básicas
    .\start-app.ps1 -Help        # Mostrar esta ayuda

Opciones:
    -Quick    Inicio rápido para desarrollo
    -Dev      Modo desarrollo con verificaciones básicas
    -Help     Mostrar esta ayuda

Ejemplos:
    .\start-app.ps1              # Lanzamiento completo
    .\start-app.ps1 -Quick       # Desarrollo rápido
    .\start-app.ps1 -Dev         # Desarrollo con verificaciones
"@ -ForegroundColor $Blue
}

# Función principal
function Main {
    # Mostrar banner
    Write-Host @"
╔══════════════════════════════════════════════════════════════╗
║                    ClipChain Launcher                        ║
║                                                              ║
║  Iniciando aplicación completa...                           ║
╚══════════════════════════════════════════════════════════════╝
"@ -ForegroundColor $Blue
    
    # Verificar que estamos en el directorio correcto
    if (-not (Test-Path "package.json")) {
        Write-Error "No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto."
        exit 1
    }
    
    # Verificaciones previas
    Test-Dependencies
    Test-NpmDependencies
    
    # Limpiar puertos si es necesario
    Clear-Ports
    
    # Iniciar servicios
    Start-Backend
    Start-Frontend
}

# Función de inicio rápido
function Start-Quick {
    Write-Host "🚀 ClipChain - Inicio Rápido" -ForegroundColor $Blue
    
    # Limpiar puertos
    Write-Log "Limpiando puertos..." $Blue
    Clear-Ports
    
    # Iniciar backend
    Write-Log "Iniciando backend..." $Blue
    Start-Process -FilePath "npm" -ArgumentList "run", "server:dev" -WindowStyle Hidden
    
    # Esperar backend
    Write-Log "Esperando backend..." $Blue
    Start-Sleep -Seconds 3
    
    # Iniciar frontend
    Write-Log "Iniciando frontend..." $Blue
    npm run dev
}

# Función de modo desarrollo
function Start-Dev {
    Write-Host "🚀 ClipChain - Modo Desarrollo" -ForegroundColor $Blue
    
    # Verificaciones básicas
    Test-Dependencies
    Test-NpmDependencies
    
    # Limpiar puertos
    Write-Log "Limpiando puertos..." $Blue
    Clear-Ports
    
    # Iniciar backend
    Write-Log "Iniciando backend..." $Blue
    Start-Process -FilePath "npm" -ArgumentList "run", "server:dev" -WindowStyle Hidden
    
    # Esperar backend
    Write-Log "Esperando backend..." $Blue
    Start-Sleep -Seconds 5
    
    # Verificar backend
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:9000/api/health" -TimeoutSec 1 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Success "Backend listo"
        }
    }
    catch {
        Write-Warning "Backend no responde, pero continuando..."
    }
    
    # Iniciar frontend
    Write-Log "Iniciando frontend..." $Blue
    npm run dev
}

# Manejo de parámetros
if ($Help) {
    Show-Help
    exit 0
}

if ($Quick) {
    Start-Quick
}
elseif ($Dev) {
    Start-Dev
}
else {
    Main
}
