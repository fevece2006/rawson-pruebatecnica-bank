# Script para configurar el cliente de Keycloak

Write-Host "Configurando cliente de Keycloak..." -ForegroundColor Green

# Obtener token de acceso
$tokenResponse = Invoke-RestMethod -Uri "http://localhost:8080/realms/master/protocol/openid-connect/token" `
    -Method Post `
    -Body @{
        grant_type = 'password'
        client_id = 'admin-cli'
        username = 'admin'
        password = 'admin'
    } `
    -ContentType 'application/x-www-form-urlencoded'

$token = $tokenResponse.access_token
$headers = @{
    Authorization = "Bearer $token"
    'Content-Type' = 'application/json'
}

# Obtener lista de clientes
Write-Host "Obteniendo lista de clientes..." -ForegroundColor Yellow
$clients = Invoke-RestMethod -Uri "http://localhost:8080/admin/realms/rawson-bank/clients" -Headers $headers

# Buscar el cliente rawson-bank-frontend
$client = $clients | Where-Object { $_.clientId -eq 'rawson-bank-frontend' }

if ($client) {
    Write-Host "Cliente encontrado. Actualizando configuración..." -ForegroundColor Yellow
    
    # Actualizar configuración del cliente
    $client.redirectUris = @("*")
    $client.webOrigins = @("*")
    $client.publicClient = $true
    $client.directAccessGrantsEnabled = $true
    $client.standardFlowEnabled = $true
    
    if (-not $client.attributes) {
        $client.attributes = @{}
    }
    $client.attributes.'pkce.code.challenge.method' = 'S256'
    
    # Actualizar cliente
    $clientId = $client.id
    Invoke-RestMethod -Uri "http://localhost:8080/admin/realms/rawson-bank/clients/$clientId" `
        -Method Put `
        -Headers $headers `
        -Body ($client | ConvertTo-Json -Depth 10)
    
    Write-Host "Cliente actualizado exitosamente!" -ForegroundColor Green
    Write-Host "Configuración aplicada:" -ForegroundColor Cyan
    Write-Host "  - Redirect URIs: *" -ForegroundColor Cyan
    Write-Host "  - Web Origins: *" -ForegroundColor Cyan
    Write-Host "  - PKCE habilitado: S256" -ForegroundColor Cyan
} else {
    Write-Host "Cliente no encontrado. Creando nuevo cliente..." -ForegroundColor Yellow
    
    # Crear nuevo cliente
    $newClient = @{
        clientId = 'rawson-bank-frontend'
        enabled = $true
        publicClient = $true
        protocol = 'openid-connect'
        directAccessGrantsEnabled = $true
        standardFlowEnabled = $true
        implicitFlowEnabled = $false
        redirectUris = @("*")
        webOrigins = @("*")
        attributes = @{
            'pkce.code.challenge.method' = 'S256'
        }
    }
    
    Invoke-RestMethod -Uri "http://localhost:8080/admin/realms/rawson-bank/clients" `
        -Method Post `
        -Headers $headers `
        -Body ($newClient | ConvertTo-Json -Depth 10)
    
    Write-Host "Cliente creado exitosamente!" -ForegroundColor Green
}

Write-Host "`nPuedes probar ahora accediendo a http://localhost:3000" -ForegroundColor Green
