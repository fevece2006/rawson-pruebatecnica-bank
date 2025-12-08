# Script para mantener el frontend corriendo
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Iniciando Frontend React (Puerto 3000)" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Navegar al directorio del frontend
Set-Location "d:\Rawson-pruebatecnica-proyecto-bank\rawson-pruebatecnica-bank\frontend-bank-system"

Write-Host "Directorio actual: $(Get-Location)" -ForegroundColor Yellow
Write-Host ""

# Verificar que package.json existe
if (Test-Path ".\package.json") {
    Write-Host "[OK] package.json encontrado" -ForegroundColor Green
} else {
    Write-Host "[ERROR] package.json no encontrado" -ForegroundColor Red
    exit 1
}

# Verificar que node_modules existe
if (Test-Path ".\node_modules") {
    Write-Host "[OK] node_modules encontrado" -ForegroundColor Green
} else {
    Write-Host "[ADVERTENCIA] node_modules no encontrado. Ejecutando npm install..." -ForegroundColor Yellow
    npm install
}

Write-Host ""
Write-Host "Iniciando servidor de desarrollo..." -ForegroundColor Cyan
Write-Host "El frontend estará disponible en: http://localhost:3000/" -ForegroundColor Green
Write-Host ""
Write-Host "NOTA: Este terminal debe permanecer ABIERTO" -ForegroundColor Yellow
Write-Host "      Para detener el servidor, presiona Ctrl+C" -ForegroundColor Yellow
Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Configurar variables de entorno
$env:BROWSER = "none"
$env:GENERATE_SOURCEMAP = "false"

# Iniciar npm start
npm start
