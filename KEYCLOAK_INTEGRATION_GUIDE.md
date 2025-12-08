# 🔐 Guía de Seguridad con Keycloak - Rawson Bank System

## 📋 Tabla de Contenidos
1. [Introducción](#introducción)
2. [Arquitectura de Seguridad](#arquitectura-de-seguridad)
3. [Configuración de Keycloak](#configuración-de-keycloak)
4. [Integración Backend](#integración-backend)
5. [Integración Frontend](#integración-frontend)
6. [Flujo de Autenticación](#flujo-de-autenticación)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Introducción

Este documento describe la implementación de seguridad OAuth 2.0 + JWT utilizando Keycloak para el Rawson Bank System.

### Componentes de Seguridad
- **Keycloak 23.0**: Identity and Access Management (IAM)
- **OAuth 2.0**: Protocolo de autorización
- **JWT (JSON Web Tokens)**: Tokens de autenticación
- **Spring Security**: Protección de endpoints backend
- **React Keycloak**: Integración frontend

---

## 🏗️ Arquitectura de Seguridad

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Frontend  │─────→│   Keycloak   │←────→│  PostgreSQL │
│   (React)   │      │  (Port 8080) │      │             │
└─────────────┘      └──────────────┘      └─────────────┘
       │                     │
       │ JWT Token           │ Validate JWT
       ↓                     ↓
┌─────────────┐      ┌──────────────┐
│ API Gateway │─────→│   Backend    │
│  (Port 8085)│      │ (Port 8082)  │
└─────────────┘      └──────────────┘
```

### Flujo de Autenticación
1. Usuario accede al frontend
2. Redirección a Keycloak para login
3. Keycloak valida credenciales
4. Genera JWT token
5. Frontend almacena token
6. Requests incluyen `Authorization: Bearer <token>`
7. Backend/Gateway validan JWT con Keycloak

---

## ⚙️ Configuración de Keycloak

### 1. Levantar Keycloak

```bash
# Desde el directorio raíz del proyecto
docker-compose up -d keycloak postgres
```

**Acceso Admin Console:**
- URL: http://localhost:8080
- Usuario: `admin`
- Password: `admin`

### 2. Crear Realm `rawson-bank`

**Opción A: Importar configuración automática**
```bash
# El realm se puede importar desde keycloak-realm-export.json
docker cp keycloak-realm-export.json keycloak-bank:/tmp/
docker exec -it keycloak-bank /opt/keycloak/bin/kc.sh import --file /tmp/keycloak-realm-export.json
```

**Opción B: Configuración Manual**

1. Click en "Create Realm"
2. Name: `rawson-bank`
3. Enabled: ON
4. Save

### 3. Configurar Client

**Client ID:** `rawson-bank-frontend`

```json
{
  "clientId": "rawson-bank-frontend",
  "enabled": true,
  "publicClient": true,
  "protocol": "openid-connect",
  "directAccessGrantsEnabled": true,
  "standardFlowEnabled": true,
  "redirectUris": [
    "http://localhost:3000/*",
    "http://localhost:3001/*",
    "http://localhost:3002/*"
  ],
  "webOrigins": ["+"]
}
```

**Pasos:**
1. Clients → Create Client
2. General Settings:
   - Client type: `OpenID Connect`
   - Client ID: `rawson-bank-frontend`
3. Capability config:
   - Client authentication: OFF (public client)
   - Standard flow: ON
   - Direct access grants: ON
4. Login settings:
   - Valid redirect URIs: `http://localhost:3000/*`, `http://localhost:3001/*`, `http://localhost:3002/*`
   - Web origins: `+`

### 4. Crear Roles

Realm Roles → Create Role:

| Role Name           | Descripción                    |
|---------------------|--------------------------------|
| `bank-admin`        | Administrador del sistema      |
| `bank-user`         | Usuario regular                |
| `account-manager`   | Gestión de cuentas             |
| `transaction-manager`| Gestión de transacciones      |

### 5. Crear Usuarios

#### Usuario Admin
```
Username: admin
Email: admin@rawsonbank.com
First Name: Admin
Last Name: Sistema
Email Verified: ON
Password: admin (Temporary: OFF)
Roles: bank-admin, account-manager, transaction-manager
```

#### Usuario Regular
```
Username: user
Email: user@rawsonbank.com
First Name: Usuario
Last Name: Regular
Email Verified: ON
Password: user (Temporary: OFF)
Roles: bank-user
```

#### Usuario de Prueba
```
Username: testuser
Email: testuser@rawsonbank.com
First Name: Test
Last Name: User
Email Verified: ON
Password: test123 (Temporary: OFF)
Roles: bank-user, account-manager
```

**Pasos para crear usuario:**
1. Users → Add User
2. Completar datos
3. Save
4. Tab "Credentials" → Set Password
5. Tab "Role mappings" → Assign roles

---

## 🔧 Integración Backend

### Backend Bank System

**1. Dependencias (build.gradle)**
```gradle
implementation 'org.springframework.boot:spring-boot-starter-security'
implementation 'org.springframework.boot:spring-boot-starter-oauth2-resource-server'
```

**2. SecurityConfig.java**
```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/**").permitAll()
                .requestMatchers("/api/v1/accounts/integration/**").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
            );
        return http.build();
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        String jwkSetUri = "http://keycloak:8080/realms/rawson-bank/protocol/openid-connect/certs";
        return NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build();
    }
}
```

**3. application.yml**
```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://localhost:8080/realms/rawson-bank
          jwk-set-uri: http://localhost:8080/realms/rawson-bank/protocol/openid-connect/certs
```

### API Gateway

**1. Dependencias (build.gradle.kts)**
```kotlin
implementation("org.springframework.boot:spring-boot-starter-security")
implementation("org.springframework.boot:spring-boot-starter-oauth2-resource-server")
```

**2. SecurityConfig.java (WebFlux)**
```java
@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {
    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        http
            .csrf(ServerHttpSecurity.CsrfSpec::disable)
            .authorizeExchange(exchange -> exchange
                .pathMatchers("/actuator/**").permitAll()
                .anyExchange().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtDecoder(jwtDecoder()))
            );
        return http.build();
    }
}
```

---

## 💻 Integración Frontend

### 1. Instalar Dependencias

```bash
cd frontend-bank-system
npm install keycloak-js @react-keycloak/web
```

**package.json**
```json
{
  "dependencies": {
    "keycloak-js": "^23.0.0",
    "@react-keycloak/web": "^3.4.0"
  }
}
```

### 2. Configurar Keycloak Client

**src/keycloak.js**
```javascript
import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8080',
  realm: 'rawson-bank',
  clientId: 'rawson-bank-frontend',
});

export default keycloak;
```

### 3. Configurar Provider

**src/index.js**
```javascript
import { ReactKeycloakProvider } from '@react-keycloak/web';
import keycloak from './keycloak';

const keycloakProviderInitConfig = {
  onLoad: 'login-required',
  checkLoginIframe: false,
};

root.render(
  <ReactKeycloakProvider 
    authClient={keycloak} 
    initOptions={keycloakProviderInitConfig}
  >
    <App />
  </ReactKeycloakProvider>
);
```

### 4. Hook de Autenticación

**src/hooks/useAxiosInterceptor.js**
```javascript
import { useKeycloak } from '@react-keycloak/web';

export const useAxiosInterceptor = () => {
  const { keycloak } = useKeycloak();

  const getAuthConfig = () => {
    if (keycloak?.token) {
      return {
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
        },
      };
    }
    return {};
  };

  return { getAuthConfig, token: keycloak?.token };
};
```

### 5. Uso en Componentes

```javascript
import { useAxiosInterceptor } from '../hooks/useAxiosInterceptor';

function AccountList() {
  const { getAuthConfig } = useAxiosInterceptor();

  const fetchAccounts = async () => {
    const response = await axios.get(
      `${backendUrl}/api/v1/accounts`, 
      getAuthConfig()
    );
    setAccounts(response.data);
  };
}
```

### 6. Obtener Información del Usuario

**src/App.js**
```javascript
import { useKeycloak } from '@react-keycloak/web';

function App() {
  const { keycloak } = useKeycloak();

  const user = {
    username: keycloak.tokenParsed?.preferred_username,
    email: keycloak.tokenParsed?.email,
    name: keycloak.tokenParsed?.name,
    roles: keycloak.tokenParsed?.realm_access?.roles || [],
  };

  const handleLogout = () => {
    keycloak.logout({ redirectUri: window.location.origin });
  };
}
```

---

## 🔄 Flujo de Autenticación Completo

### 1. Login Flow
```
User → Frontend → Keycloak Login Page
         ↓
    Enter credentials
         ↓
    Keycloak validates
         ↓
    Generate JWT + Refresh Token
         ↓
    Redirect to Frontend with tokens
         ↓
    Frontend stores tokens
```

### 2. API Request Flow
```
Frontend Request
    ↓
Add Authorization Header: Bearer <JWT>
    ↓
API Gateway/Backend receives request
    ↓
Extract JWT from header
    ↓
Validate JWT with Keycloak JWK endpoint
    ↓
Check signature, expiration, issuer
    ↓
Extract user roles from JWT claims
    ↓
Authorize based on roles
    ↓
Process request or return 401/403
```

### 3. Token Refresh Flow
```
Access Token expires
    ↓
Keycloak client auto-detects
    ↓
Use Refresh Token to get new Access Token
    ↓
Update stored tokens
    ↓
Retry failed request with new token
```

---

## 🧪 Testing

### 1. Obtener Token con cURL

```bash
curl -X POST http://localhost:8080/realms/rawson-bank/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin" \
  -d "password=admin" \
  -d "grant_type=password" \
  -d "client_id=rawson-bank-frontend"
```

**Respuesta:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 1800,
  "refresh_expires_in": 3600,
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer"
}
```

### 2. Test Endpoint Protegido

```bash
# Reemplazar YOUR_TOKEN con el access_token obtenido
curl -X GET http://localhost:8082/api/v1/accounts \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Decodificar JWT

Visitar: https://jwt.io

Pegar el `access_token` para ver el payload:

```json
{
  "exp": 1733515200,
  "iat": 1733513400,
  "jti": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "iss": "http://localhost:8080/realms/rawson-bank",
  "sub": "12345678-90ab-cdef-1234-567890abcdef",
  "typ": "Bearer",
  "azp": "rawson-bank-frontend",
  "preferred_username": "admin",
  "email": "admin@rawsonbank.com",
  "realm_access": {
    "roles": [
      "bank-admin",
      "account-manager",
      "transaction-manager"
    ]
  }
}
```

### 4. Test Postman

**Configuración:**
1. Authorization Type: `OAuth 2.0`
2. Grant Type: `Password Credentials`
3. Access Token URL: `http://localhost:8080/realms/rawson-bank/protocol/openid-connect/token`
4. Client ID: `rawson-bank-frontend`
5. Username: `admin`
6. Password: `admin`
7. Click "Get New Access Token"

---

## 🐛 Troubleshooting

### Error: "401 Unauthorized"

**Causa:** Token inválido, expirado o no enviado

**Solución:**
```javascript
// Verificar que el token se esté enviando
console.log('Token:', keycloak.token);

// Verificar headers
const config = getAuthConfig();
console.log('Headers:', config.headers);
```

### Error: "CORS policy"

**Causa:** Frontend y backend en diferentes orígenes

**Solución en Backend:**
```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(List.of("http://localhost:3002"));
    configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
    configuration.setAllowedHeaders(List.of("*"));
    configuration.setAllowCredentials(true);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

### Error: "Invalid token issuer"

**Causa:** JWT issuer no coincide con la configuración

**Solución:** Verificar que el `issuer-uri` coincida:
```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://localhost:8080/realms/rawson-bank
```

### Error: "Failed to load JWK"

**Causa:** Backend no puede conectarse a Keycloak

**Solución:**
1. Verificar que Keycloak esté corriendo: `docker ps | grep keycloak`
2. Verificar URL del JWK Set en logs
3. Desde el contenedor backend, hacer ping a keycloak:
   ```bash
   docker exec -it backend-bank curl http://keycloak:8080/realms/rawson-bank
   ```

### Token Expira Muy Rápido

**Solución:** Ajustar en Keycloak:
1. Realm Settings → Tokens
2. Access Token Lifespan: `30 minutes`
3. SSO Session Idle: `30 minutes`
4. Client Settings → Advanced → Access Token Lifespan

---

## 🔒 Seguridad en Producción

### ⚠️ Checklist de Producción

- [ ] Cambiar contraseña de admin de Keycloak
- [ ] Usar HTTPS en todos los servicios
- [ ] Configurar certificados SSL/TLS
- [ ] Usar base de datos externa para Keycloak (no dev mode)
- [ ] Habilitar HTTPS-only para cookies
- [ ] Configurar políticas de contraseñas robustas
- [ ] Implementar rate limiting
- [ ] Configurar captcha en login
- [ ] Habilitar auditoría de eventos
- [ ] Configurar backup de Keycloak DB
- [ ] Usar variables de entorno para secretos
- [ ] Implementar refresh token rotation
- [ ] Configurar token blacklisting
- [ ] Habilitar MFA (Multi-Factor Authentication)

### Ejemplo de Configuración Segura

```yaml
# Production application.yml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: ${KEYCLOAK_ISSUER_URI}
          jwk-set-uri: ${KEYCLOAK_JWK_SET_URI}

# Use environment variables
# KEYCLOAK_ISSUER_URI=https://keycloak.production.com/realms/rawson-bank
# KEYCLOAK_JWK_SET_URI=https://keycloak.production.com/realms/rawson-bank/protocol/openid-connect/certs
```

---

## 📚 Referencias

- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [OAuth 2.0 Specification](https://oauth.net/2/)
- [JWT.io](https://jwt.io/)
- [Spring Security OAuth2](https://docs.spring.io/spring-security/reference/servlet/oauth2/index.html)
- [React Keycloak](https://github.com/react-keycloak/react-keycloak)

---

## 👥 Usuarios de Prueba

| Usuario   | Password | Roles                                        |
|-----------|----------|----------------------------------------------|
| admin     | admin    | bank-admin, account-manager, transaction-manager |
| user      | user     | bank-user                                    |
| testuser  | test123  | bank-user, account-manager                   |

---

**Última actualización:** Diciembre 2025  
**Versión:** 1.0.0
