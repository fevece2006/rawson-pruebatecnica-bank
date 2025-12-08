# Script para corregir la configuración PKCE del cliente
Write-Host "Corrigiendo configuración PKCE en Keycloak..."

# Obtener token de administrador
$tokenResponse = Invoke-RestMethod -Uri 'http://localhost:8080/realms/master/protocol/openid-connect/token' -Method Post -Body @{
    grant_type='password'
    client_id='admin-cli'
    username='admin'
    password='admin'
} -ContentType 'application/x-www-form-urlencoded'

$token = $tokenResponse.access_token
$headers = @{
    Authorization = "Bearer $token"
    'Content-Type' = 'application/json'
}

# Obtener lista de clientes
Write-Host "Obteniendo cliente..."
$clients = Invoke-RestMethod -Uri 'http://localhost:8080/admin/realms/rawson-bank/clients' -Headers $headers
$client = $clients | Where-Object { $_.clientId -eq 'rawson-bank-frontend' }

if (-not $client) {
    Write-Host "ERROR: Cliente no encontrado!"
    exit 1
}

# Actualizar configuración del cliente
Write-Host "Actualizando configuración..."
$clientUpdate = @{
    clientId = 'rawson-bank-frontend'
    enabled = $true
    publicClient = $true
    redirectUris = @('http://localhost:3000/*', 'http://localhost:3001/*', 'http://localhost:3002/*')
    webOrigins = @('http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002')
    standardFlowEnabled = $true
    implicitFlowEnabled = $false
    directAccessGrantsEnabled = $true
    attributes = @{
        'pkce.code.challenge.method' = ''
    }
}

$body = $clientUpdate | ConvertTo-Json -Depth 10
Invoke-RestMethod -Uri "http://localhost:8080/admin/realms/rawson-bank/clients/$($client.id)" -Method Put -Headers $headers -Body $body

Write-Host ""
Write-Host "Configuración actualizada exitosamente!"
Write-Host "PKCE: Deshabilitado (opcional en el cliente)"
Write-Host "Redirect URIs: http://localhost:3000/*, 3001/*, 3002/*"
Write-Host "Web Origins: http://localhost:3000, 3001, 3002"
Write-Host ""
Write-Host "Ahora recarga el navegador en http://localhost:3000"
