# Script para iniciar el frontend con configuracion correcta

Write-Host "=== Iniciando Frontend Bank System ===" -ForegroundColor Cyan

# Detener procesos Node.js existentes del frontend
Write-Host ""
Write-Host "Deteniendo procesos existentes..." -ForegroundColor Yellow
$frontendPath = "D:\Rawson-pruebatecnica-proyecto-bank\rawson-pruebatecnica-bank\frontend-bank-system"
Get-Process -Name node -ErrorAction SilentlyContinue | ForEach-Object {
    try {
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
        Write-Host "  Proceso Node (PID: $($_.Id)) detenido" -ForegroundColor Gray
    } catch {
        Write-Host "  No se pudo detener proceso $($_.Id)" -ForegroundColor Yellow
    }
}

Start-Sleep -Seconds 2

# Cambiar al directorio del frontend
Set-Location $frontendPath

# Verificar que existe el archivo .env
if (Test-Path ".env") {
    Write-Host ""
    Write-Host "OK - Archivo .env encontrado" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Advertencia: No se encontro archivo .env" -ForegroundColor Yellow
}

# Verificar que Keycloak esta corriendo
Write-Host ""
Write-Host "Verificando servicios..." -ForegroundColor Yellow
try {
    $keycloakStatus = Invoke-WebRequest -Uri "http://localhost:8080/realms/rawson-bank" -UseBasicParsing -TimeoutSec 5
    Write-Host "  OK - Keycloak (puerto 8080) - Realm activo" -ForegroundColor Green
} catch {
    Write-Host "  Error - Keycloak (puerto 8080) - No responde" -ForegroundColor Red
}

try {
    $orchestratorStatus = Invoke-WebRequest -Uri "http://localhost:8082/actuator/health" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
    Write-Host "  OK - Orchestrator Service (puerto 8082) - Activo" -ForegroundColor Green
} catch {
    Write-Host "  Advertencia - Orchestrator Service (puerto 8082) - No responde" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Iniciando servidor de desarrollo ===" -ForegroundColor Cyan
Write-Host "URL: http://localhost:3000" -ForegroundColor Green
Write-Host "Presiona Ctrl+C para detener" -ForegroundColor Gray
Write-Host ""

# Iniciar el servidor de desarrollo
npm start
