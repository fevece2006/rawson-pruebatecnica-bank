# Configuración de Keycloak para Rawson Bank

## Realm: rawson-bank

### 1. Crear Realm
1. Acceder a Keycloak Admin Console: http://localhost:8080
2. Usuario: `admin` / Contraseña: `admin`
3. Crear nuevo realm llamado `rawson-bank`

### 2. Crear Client para Frontend
- **Client ID**: `rawson-bank-frontend`
- **Client Protocol**: `openid-connect`
- **Access Type**: `public`
- **Valid Redirect URIs**: 
  - `http://localhost:3000/*`
  - `http://localhost:3001/*`
  - `http://localhost:3002/*`
- **Web Origins**: `+` (permite todos los orígenes válidos)
- **Direct Access Grants Enabled**: ON

### 3. Crear Roles
Crear los siguientes realm roles:
- `bank-admin` - Administrador del sistema bancario
- `bank-user` - Usuario regular del sistema
- `account-manager` - Gestión de cuentas
- `transaction-manager` - Gestión de transacciones

### 4. Crear Usuarios

#### Usuario Admin
- **Username**: `admin`
- **Email**: `admin@rawsonbank.com`
- **First Name**: `Admin`
- **Last Name**: `Sistema`
- **Email Verified**: ON
- **Password**: `admin` (Temporary: OFF)
- **Roles**: 
  - `bank-admin`
  - `account-manager`
  - `transaction-manager`

#### Usuario Regular
- **Username**: `user`
- **Email**: `user@rawsonbank.com`
- **First Name**: `Usuario`
- **Last Name**: `Regular`
- **Email Verified**: ON
- **Password**: `user` (Temporary: OFF)
- **Roles**: 
  - `bank-user`

#### Usuario de Prueba
- **Username**: `testuser`
- **Email**: `testuser@rawsonbank.com`
- **First Name**: `Test`
- **Last Name**: `User`
- **Email Verified**: ON
- **Password**: `test123` (Temporary: OFF)
- **Roles**: 
  - `bank-user`
  - `account-manager`

### 5. Configurar Token Settings
En Client `rawson-bank-frontend`:
- **Access Token Lifespan**: 30 minutos
- **SSO Session Idle**: 30 minutos
- **SSO Session Max**: 10 horas
- **Client Session Idle**: 30 minutos
- **Client Session Max**: 10 horas

### 6. Configurar Mappers (Opcional)
Agregar mappers personalizados para incluir información adicional en el JWT:
- User roles
- Email
- Full name
- User attributes

### 7. Verificar Endpoints
- **Issuer**: `http://localhost:8080/realms/rawson-bank`
- **Authorization**: `http://localhost:8080/realms/rawson-bank/protocol/openid-connect/auth`
- **Token**: `http://localhost:8080/realms/rawson-bank/protocol/openid-connect/token`
- **JWK Set**: `http://localhost:8080/realms/rawson-bank/protocol/openid-connect/certs`
- **UserInfo**: `http://localhost:8080/realms/rawson-bank/protocol/openid-connect/userinfo`

## Importar Configuración (Alternativa)

Para facilitar la configuración, se puede exportar el realm completo desde Keycloak y guardarlo como `keycloak-realm-export.json`.

### Comando para importar:
```bash
docker exec -it keycloak-bank /opt/keycloak/bin/kc.sh import --file /opt/keycloak/data/import/realm-export.json
```

## Pruebas

### Test de autenticación con cURL:
```bash
# Obtener token
curl -X POST http://localhost:8080/realms/rawson-bank/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin" \
  -d "password=admin" \
  -d "grant_type=password" \
  -d "client_id=rawson-bank-frontend"
```

### Test de endpoint protegido:
```bash
# Usar el access_token obtenido
curl -X GET http://localhost:8082/api/v1/accounts \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Seguridad en Producción

⚠️ **IMPORTANTE**: Estas configuraciones son para desarrollo. En producción:

1. Cambiar contraseñas de admin
2. Usar HTTPS
3. Configurar certificados SSL
4. Ajustar tiempos de sesión
5. Habilitar captcha
6. Configurar políticas de contraseñas robustas
7. Implementar rate limiting
8. Usar base de datos externa para Keycloak (no en memoria)
