# Estado Actual de los Servicios

## ✅ Servicios Funcionando Correctamente

### 1. Keycloak (IAM & OAuth2/JWT)
- **Puerto**: 8080
- **PID**: 23140
- **Estado**: ✅ RUNNING
- **URL Admin**: http://localhost:8080/
- **Credenciales Admin**: 
  - Usuario: `admin`
  - Contraseña: `admin123`

### 2. Frontend React (en proceso de inicio)
- **Puerto**: 3000
- **Estado**: 🔄 COMPILADO (necesita mantener terminal activo)
- **URL**: http://localhost:3000/
- **Configuración**:
  - Integración con Keycloak mediante `@react-keycloak/web`
  - PKCE habilitado (S256)
  - Redirect automático al login de Keycloak
  - Tailwind CSS v3.4.18 configurado

## 📋 Funcionalidad Esperada

### Flujo de Autenticación:

1. **Al acceder a http://localhost:3000/**:
   - El frontend detecta que no hay sesión autenticada
   - Redirige automáticamente a: 
     ```
     http://localhost:8080/realms/rawson-bank/protocol/openid-connect/auth
     ```
   - Muestra el formulario de login de Keycloak

2. **Al autenticarse exitosamente**:
   - Keycloak genera un JWT token
   - Redirige de vuelta a http://localhost:3000/
   - El token se almacena en el navegador
   - La aplicación muestra la interfaz principal

3. **Al acceder a http://localhost:8080/**:
   - Muestra la página de bienvenida de Keycloak
   - Opción "Administration Console" para el panel admin

## 👥 Usuarios de Prueba (Keycloak)

| Usuario | Contraseña | Rol | Descripción |
|---------|-----------|-----|-------------|
| admin | admin123 | admin | Administrador del sistema |
| testuser | password123 | user | Usuario de pruebas principal |
| user | user | user | Usuario estándar (opcional) |

## 🔧 Configuración Técnica

### Keycloak Client: `rawson-bank-frontend`
- **Client ID**: rawson-bank-frontend
- **Client Type**: Public (no requiere client secret)
- **Valid Redirect URIs**: 
  - http://localhost:3000/*
  - http://localhost:3001/*
  - http://localhost:3002/*
- **Web Origins**: 
  - http://localhost:3000
  - http://localhost:3001
  - http://localhost:3002
- **PKCE**: Opcional (S256 habilitado en cliente)
- **Standard Flow**: ✅ Enabled
- **Direct Access Grants**: ✅ Enabled

### Backend Services (Spring Boot)
- **Backend Bank System**: Puerto 8083
- **Ledger Service**: Puerto 8081
- **Orchestrator Service**: Puerto 8082
- **API Gateway**: Puerto 8085
- **Eureka Registry**: Puerto 8761
- **Seguridad**: OAuth2 Resource Server
- **Validación JWT**: Contra Keycloak (puerto 8080)

## ⚠️ Nota Importante

El frontend React necesita que el terminal donde se ejecuta `npm start` permanezca activo. Si el terminal se cierra o se interrumpe:

1. El servidor de desarrollo de React se detiene
2. La aplicación deja de estar disponible en http://localhost:3000/

**Para reiniciar el frontend**:
```bash
cd frontend-bank-system
npm start
```

El servidor tomará aproximadamente 10-15 segundos en compilar y estar listo.

## 📝 Warnings del Frontend (No críticos)

Los siguientes warnings son **normales** y están **suprimidos**:

- ~~Failed to parse source map (archivos de @react-keycloak)~~ → Eliminados con `GENERATE_SOURCEMAP=false`

Solo aparecen warnings menores de ESLint (no críticos).

## 🗄️ Acceso a PostgreSQL

### Base de Datos

El sistema usa PostgreSQL con dos bases de datos:

| Base de datos | Puerto | Usuario | Contraseña | Descripción |
|---------------|--------|---------|------------|-------------|
| bank | 5432 | bank | bank | Datos del sistema bancario |
| keycloak | 5432 | bank | bank | Datos de Keycloak IAM |

### Comandos de Acceso

```bash
# Conectarse a la base de datos 'bank'
docker exec -it postgres-bank psql -U bank -d bank

# Conectarse a la base de datos 'keycloak'
docker exec -it postgres-bank psql -U bank -d keycloak

# Ver todas las tablas
\dt

# Salir
\q
```

### Conexión desde herramientas GUI

**DBeaver, pgAdmin, DataGrip, etc.:**
```
Host: localhost
Port: 5432
Database: bank (o keycloak)
Username: bank
Password: bank
```

**JDBC Connection String:**
```
jdbc:postgresql://localhost:5432/bank?user=bank&password=bank
```

## ✅ Verificación Rápida

Para verificar que todo funciona:

```bash
# 1. Verificar Keycloak
netstat -ano | findstr "8080.*LISTENING"
# Debe mostrar: TCP 0.0.0.0:8080 ... LISTENING 23140

# 2. Verificar Frontend (cuando está activo)
netstat -ano | findstr "3000.*LISTENING"
# Debe mostrar: TCP 0.0.0.0:3000 ... LISTENING <PID>

# 3. Verificar procesos Node.js
tasklist | findstr node.exe
# Debe mostrar: node.exe <PID> ...
```

## 🎯 Próximos Pasos

1. ✅ Mantener el terminal de `npm start` activo
2. ✅ Acceder a http://localhost:3000/ en el navegador
3. ✅ Verificar redirección a login de Keycloak
4. ✅ Autenticarse con uno de los usuarios de prueba
5. ✅ Verificar que se carga correctamente la aplicación

---

**Fecha de actualización**: 6 de diciembre de 2025
**Estado general**: ✅ Sistema configurado y listo para uso
