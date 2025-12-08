# Script para verificar configuración de Keycloak
Write-Output "Verificando configuración de Keycloak..."

# Obtener token de administrador
$tokenResponse = Invoke-RestMethod -Uri 'http://localhost:8080/realms/master/protocol/openid-connect/token' `
    -Method Post `
    -Body @{
        grant_type='password'
        client_id='admin-cli'
        username='admin'
        password='admin'
    } `
    -ContentType 'application/x-www-form-urlencoded'

$token = $tokenResponse.access_token
$headers = @{
    Authorization = "Bearer $token"
    'Content-Type' = 'application/json'
}

# Obtener lista de clientes
$clients = Invoke-RestMethod -Uri 'http://localhost:8080/admin/realms/rawson-bank/clients' -Headers $headers

# Encontrar el cliente
$client = $clients | Where-Object { $_.clientId -eq 'rawson-bank-frontend' }

if (-not $client) {
    Write-Output "ERROR: Cliente 'rawson-bank-frontend' no encontrado!"
    exit 1
}

# Obtener detalles completos del cliente
$clientDetails = Invoke-RestMethod -Uri "http://localhost:8080/admin/realms/rawson-bank/clients/$($client.id)" -Headers $headers

Write-Output ""
Write-Output "=== CONFIGURACIÓN ACTUAL DEL CLIENTE ==="
Write-Output "Client ID: $($clientDetails.clientId)"
Write-Output "Client Internal ID: $($client.id)"
Write-Output "Enabled: $($clientDetails.enabled)"
Write-Output "Public Client: $($clientDetails.publicClient)"
Write-Output ""
Write-Output "Redirect URIs:"
$clientDetails.redirectUris | ForEach-Object { Write-Output "  - $_" }
Write-Output ""
Write-Output "Web Origins:"
$clientDetails.webOrigins | ForEach-Object { Write-Output "  - $_" }
Write-Output ""
Write-Output "Root URL: $($clientDetails.rootUrl)"
Write-Output "Base URL: $($clientDetails.baseUrl)"
Write-Output "Admin URL: $($clientDetails.adminUrl)"
Write-Output ""
Write-Output "Atributos:"
if ($clientDetails.attributes) {
    $clientDetails.attributes.PSObject.Properties | ForEach-Object {
        $name = $_.Name
        $value = $_.Value
        Write-Output ('  ' + $name + ': ' + $value)
    }
}
}
