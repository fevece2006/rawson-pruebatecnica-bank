# 📊 Guía Detallada de Servicios y Puertos

## 🗄️ Capa de Datos

### PostgreSQL (Puerto 5432)

**¿Qué es?**
- Base de datos relacional principal del sistema

**¿Para qué sirve?**
- Almacena todas las entidades del dominio: cuentas bancarias, transacciones, sagas, ledger entries
- Gestiona dos bases de datos separadas:
  - `bank`: Datos de la aplicación bancaria
  - `keycloak`: Datos de autenticación y usuarios

**¿Con quién se conecta?**
- **Backend Bank System** (8083) → Lee/escribe cuentas, transacciones
- **Ledger Service** (8081) → Lee/escribe entradas del libro contable
- **Orchestrator Service** (8082) → Lee/escribe estado de sagas
- **Keycloak** (8080) → Lee/escribe usuarios, roles, sesiones

**¿Cómo se conecta?**
- Protocolo: JDBC (Java Database Connectivity)
- URL de conexión: `jdbc:postgresql://postgres-bank:5432/bank`
- Autenticación: Usuario `bank` / Contraseña `bank`
- Dentro de Docker: Hostname `postgres-bank`
- Desde host (DBeaver, pgAdmin): `localhost:5432`

**Tablas principales:**
```sql
-- Database: bank
accounts              -- Cuentas bancarias
ledger_entries        -- Registro contable (double-entry)
saga_instances        -- Estado de sagas (transferencias)
transactions          -- Historial de transacciones

-- Database: keycloak
user_entity           -- Usuarios
realm                 -- Configuración de realms
client                -- Clientes OAuth2
```

**Acceso:**
- Línea de comandos: `docker exec -it postgres-bank psql -U bank -d bank`
- pgAdmin: http://localhost:5050
- DBeaver: localhost:5432

---

## 📨 Capa de Mensajería

### Zookeeper (Puerto 2181)

**¿Qué es?**
- Servicio de coordinación distribuida para Kafka

**¿Para qué sirve?**
- Gestiona metadata de Kafka (brokers, topics, particiones)
- Coordina elección de líderes de particiones
- Mantiene configuración del cluster de Kafka
- Sincroniza estado entre brokers (aunque aquí solo hay uno)

**¿Con quién se conecta?**
- **Kafka** (9092) → Kafka consulta y actualiza metadata constantemente
- **Kafka UI** (8090) → Lee metadata para mostrar en la interfaz

**¿Cómo se conecta?**
- Protocolo: Cliente ZooKeeper nativo
- Endpoint interno: `zookeeper:2181`
- Endpoint externo: `localhost:2181`

**No tiene interfaz web directa**, pero se puede inspeccionar mediante:
- Kafka UI: http://localhost:8090
- Comandos ZooKeeper CLI desde el contenedor

---

### Kafka (Puerto 9092)

**¿Qué es?**
- Message broker (intermediario de mensajes) basado en eventos

**¿Para qué sirve?**
- Transmisión asíncrona de eventos entre microservicios
- Implementación del patrón Event-Driven Architecture
- Desacoplamiento de servicios productores y consumidores
- Garantiza entrega de mensajes y orden de procesamiento

**Topics (canales de mensajes):**
```
account-events          → Eventos de creación/modificación de cuentas
saga-commands           → Comandos para orquestación de sagas
saga-events             → Eventos de estado de sagas
ledger-events           → Eventos de entradas contables
transfer-events         → Eventos de transferencias
```

**¿Con quién se conecta?**

**Productores (envían mensajes):**
- **Backend Bank System** (8083) → Publica eventos de cuentas y transacciones
- **Orchestrator Service** (8082) → Publica comandos de saga
- **Ledger Service** (8081) → Publica eventos de ledger

**Consumidores (reciben mensajes):**
- **Backend Bank System** (8083) → Escucha comandos de saga
- **Orchestrator Service** (8082) → Escucha eventos de saga
- **Ledger Service** (8081) → Escucha eventos de transacciones

**¿Cómo se conecta?**
- Protocolo: Kafka Native Protocol
- Bootstrap servers interno: `kafka:29092`
- Bootstrap servers externo: `localhost:9092`
- Configuración en Spring Boot:
  ```yaml
  spring:
    kafka:
      bootstrap-servers: kafka:29092
  ```

**Acceso:**
- Kafka UI: http://localhost:8090
- CLI desde contenedor: `docker exec -it kafka-bank kafka-topics --list --bootstrap-server localhost:9092`

---

### Kafka UI (Puerto 8090)

**¿Qué es?**
- Interfaz web para gestión y monitoreo de Kafka

**¿Para qué sirve?**
- Visualizar topics, particiones, offsets
- Ver mensajes en tiempo real
- Monitorear consumers y producers
- Gestionar configuración de topics
- Debugging de flujos de mensajes

**¿Con quién se conecta?**
- **Kafka** (9092) → Lee/escribe datos de topics y brokers
- **Zookeeper** (2181) → Lee metadata del cluster

**¿Cómo se conecta?**
- Protocolo: Kafka Native Protocol + ZooKeeper Protocol
- Configuración:
  ```yaml
  KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS: kafka:29092
  KAFKA_CLUSTERS_0_ZOOKEEPER: zookeeper:2181
  ```

**Acceso:**
- URL: http://localhost:8090
- No requiere autenticación (modo desarrollo)

**Funcionalidades:**
- Ver mensajes de topics en tiempo real
- Crear/eliminar topics
- Ver configuración de consumers
- Monitorear lag de consumidores
- Ver particiones y réplicas

---

## 🔐 Capa de Seguridad

### Keycloak (Puerto 8080)

**¿Qué es?**
- Identity and Access Management (IAM) server
- Servidor OAuth2/OpenID Connect

**¿Para qué sirve?**
- Autenticación de usuarios (login/logout)
- Autorización basada en roles (RBAC)
- Emisión y validación de JWT tokens
- Single Sign-On (SSO)
- Gestión de usuarios, roles y permisos

**Conceptos clave:**
```
Realm: rawson-bank              → Contenedor de usuarios y clientes
Client: rawson-bank-frontend    → Aplicación React registrada
Users: testuser, admin          → Usuarios de prueba
Roles: user, admin              → Permisos asignados
```

**¿Con quién se conecta?**

**Base de datos:**
- **PostgreSQL** (5432) → Almacena usuarios, sesiones, configuración
  - Database: `keycloak`
  - Conexión: `jdbc:postgresql://postgres:5432/keycloak`

**Clientes OAuth2:**
- **Frontend React** (3000) → Solicita tokens de acceso
  - Flow: Authorization Code + PKCE
  - Redirect URI: http://localhost:3000/*

**Resource Servers (validan tokens):**
- **Backend Bank System** (8083) → Valida JWT en cada request
- **Ledger Service** (8081) → Valida JWT
- **Orchestrator Service** (8082) → Valida JWT
- **API Gateway** (8085) → Valida JWT y enruta

**¿Cómo se conecta?**

**Flujo de autenticación:**
1. Frontend redirige a: `http://localhost:8080/realms/rawson-bank/protocol/openid-connect/auth`
2. Usuario ingresa credenciales
3. Keycloak valida y emite token JWT
4. Frontend usa token en header: `Authorization: Bearer <token>`
5. Backend valida token contra: `http://keycloak:8080/realms/rawson-bank`

**Endpoints importantes:**
```
http://localhost:8080/realms/rawson-bank                    → Configuración del realm
http://localhost:8080/realms/rawson-bank/.well-known/...    → Metadata OAuth2
http://localhost:8080/admin                                  → Admin Console
```

**Acceso:**
- Admin Console: http://localhost:8080/admin
- Credenciales: admin / admin
- Realm público: http://localhost:8080/realms/rawson-bank

---

## 🎯 Capa de Descubrimiento

### Service Registry - Eureka (Puerto 8761)

**¿Qué es?**
- Service registry y discovery server (Netflix Eureka)

**¿Para qué sirve?**
- Registro dinámico de microservicios
- Descubrimiento de servicios (service discovery)
- Health checking de instancias
- Load balancing automático
- Permite comunicación entre servicios sin hardcodear IPs

**¿Con quién se conecta?**

**Servicios que se registran (Eureka Clients):**
- **Backend Bank System** (8083) → Se registra como `BACKEND-BANK-SYSTEM`
- **Ledger Service** (8081) → Se registra como `LEDGER-SERVICE`
- **Orchestrator Service** (8082) → Se registra como `ORCHESTRATOR-SERVICE`
- **API Gateway** (8085) → Se registra como `API-GATEWAY` y consulta otros servicios

**¿Cómo se conecta?**
- Protocolo: HTTP REST
- URL de registro: `http://service-registry:8761/eureka/`
- Heartbeat: Cada 30 segundos los servicios envían señal de vida

**Configuración en servicios:**
```yaml
eureka:
  client:
    serviceUrl:
      defaultZone: http://service-registry:8761/eureka/
```

**Beneficios:**
- API Gateway puede encontrar servicios dinámicamente
- Si un servicio se cae, Eureka lo marca como DOWN
- Si un servicio tiene múltiples instancias, Eureka balancea carga

**Acceso:**
- Dashboard: http://localhost:8761
- Ver servicios registrados: http://localhost:8761/eureka/apps
- No requiere autenticación

---

## 🚪 Capa de Enrutamiento

### API Gateway (Puerto 8085)

**¿Qué es?**
- Gateway de entrada único para todos los microservicios
- Spring Cloud Gateway

**¿Para qué sirve?**
- Punto de entrada único (single entry point)
- Enrutamiento de peticiones a microservicios
- Filtros globales (logging, CORS, autenticación)
- Load balancing entre instancias
- Circuit breaker patterns

**¿Con quién se conecta?**

**Descubrimiento:**
- **Eureka** (8761) → Consulta servicios registrados para enrutar

**Enrutamiento a:**
- **Backend Bank System** (8083) → `/api/accounts/**`, `/api/transactions/**`
- **Ledger Service** (8081) → `/api/ledger/**`
- **Orchestrator Service** (8082) → `/api/sagas/**`, `/api/transfers/**`

**Clientes:**
- **Frontend React** (3000) → Todas las API calls van a `http://localhost:8085`

**¿Cómo se conecta?**

**Configuración de rutas (ejemplo):**
```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: backend-route
          uri: lb://BACKEND-BANK-SYSTEM   # Load balanced desde Eureka
          predicates:
            - Path=/api/accounts/**
        - id: ledger-route
          uri: lb://LEDGER-SERVICE
          predicates:
            - Path=/api/ledger/**
```

**Flujo de petición:**
1. Frontend → `GET http://localhost:8085/api/accounts`
2. Gateway consulta Eureka → ¿Dónde está BACKEND-BANK-SYSTEM?
3. Eureka responde → `backend-bank-system:8083`
4. Gateway enruta → `http://backend-bank-system:8083/api/accounts`
5. Gateway devuelve respuesta al Frontend

**Acceso:**
- Health: http://localhost:8085/actuator/health
- Routes: http://localhost:8085/actuator/gateway/routes

---

## 💼 Capa de Negocio

### Backend Bank System (Puerto 8083)

**¿Qué es?**
- Microservicio principal de lógica de negocio bancaria

**¿Para qué sirve?**
- Gestión de cuentas bancarias (CRUD)
- Procesamiento de transacciones
- Validación de reglas de negocio
- Exposición de API REST

**Endpoints principales:**
```
GET    /api/accounts           → Listar cuentas
POST   /api/accounts           → Crear cuenta
GET    /api/accounts/{id}      → Obtener cuenta
POST   /api/transactions       → Registrar transacción
GET    /api/transactions       → Listar transacciones
```

**¿Con quién se conecta?**

**Base de datos:**
- **PostgreSQL** (5432) → Lee/escribe en database `bank`
  - Tablas: `accounts`, `transactions`

**Mensajería:**
- **Kafka** (9092) → Publica eventos:
  - Topic `account-events` → Cuando se crea/modifica cuenta
  - Topic `transaction-events` → Cuando se procesa transacción
- Consume eventos:
  - Topic `saga-commands` → Recibe comandos de orquestador

**Registro:**
- **Eureka** (8761) → Se registra como `BACKEND-BANK-SYSTEM`

**Seguridad:**
- **Keycloak** (8080) → Valida JWT tokens en cada request

**Enrutamiento:**
- **API Gateway** (8085) → Recibe peticiones enrutadas desde `/api/accounts/**`

**¿Cómo se conecta?**

**Tecnologías:**
- Spring Boot 3.3.3
- Spring Data JPA → PostgreSQL
- Spring Kafka → Kafka
- Spring Security OAuth2 → Keycloak
- Eureka Client → Service Registry

**Configuración:**
```yaml
spring:
  datasource:
    url: jdbc:postgresql://postgres:5432/bank
  kafka:
    bootstrap-servers: kafka:29092
eureka:
  client:
    serviceUrl:
      defaultZone: http://service-registry:8761/eureka/
```

**Acceso:**
- Direct: http://localhost:8083/api/accounts
- Via Gateway: http://localhost:8085/api/accounts
- Health: http://localhost:8083/actuator/health

---

### Ledger Service (Puerto 8081)

**¿Qué es?**
- Microservicio de contabilidad (double-entry bookkeeping)

**¿Para qué sirve?**
- Registro contable de todas las operaciones
- Implementación de contabilidad por partida doble
- Auditoría y trazabilidad de transacciones
- Balance y reporting financiero

**Conceptos contables:**
```
Debit (Débito)   → Aumenta activos, disminuye pasivos
Credit (Crédito) → Disminuye activos, aumenta pasivos

Ejemplo de transferencia:
  Cuenta A (débito):  -$100
  Cuenta B (crédito): +$100
  Balance total: $0 (debe cuadrar siempre)
```

**Endpoints principales:**
```
POST   /api/ledger/entries     → Crear entrada contable
GET    /api/ledger/entries     → Listar entradas
GET    /api/ledger/balance     → Obtener balance
```

**¿Con quién se conecta?**

**Base de datos:**
- **PostgreSQL** (5432) → Lee/escribe en database `bank`
  - Tabla: `ledger_entries` (id, account_id, amount, type, timestamp)

**Mensajería:**
- **Kafka** (9092) → Consume eventos:
  - Topic `transaction-events` → Escucha transacciones para registrar en ledger
- Publica eventos:
  - Topic `ledger-events` → Notifica entradas registradas

**Registro:**
- **Eureka** (8761) → Se registra como `LEDGER-SERVICE`

**Seguridad:**
- **Keycloak** (8080) → Valida JWT tokens

**¿Cómo se conecta?**

**Flujo de procesamiento:**
1. Backend procesa transacción → Publica a `transaction-events`
2. Ledger consume evento → Crea entradas de débito y crédito
3. Ledger guarda en PostgreSQL → Tabla `ledger_entries`
4. Ledger publica a `ledger-events` → Notifica registro completo

**Acceso:**
- Direct: http://localhost:8081/api/ledger
- Via Gateway: http://localhost:8085/api/ledger
- Health: http://localhost:8081/actuator/health

---

### Orchestrator Service (Puerto 8082)

**¿Qué es?**
- Microservicio de orquestación de sagas

**¿Para qué sirve?**
- Coordinación de transacciones distribuidas
- Implementación del patrón Saga
- Manejo de compensaciones en caso de fallo
- Garantizar consistencia eventual

**Patrón Saga:**
```
Transferencia entre cuentas:
1. Reservar fondos cuenta origen
2. Acreditar fondos cuenta destino
3. Confirmar transferencia
4. Actualizar ledger

Si falla paso 3:
→ Compensar: Liberar fondos reservados
→ Compensar: Revertir acreditación
```

**Estados de Saga:**
```
STARTED      → Saga iniciada
IN_PROGRESS  → Ejecutando pasos
COMPLETED    → Todos los pasos OK
COMPENSATING → Revertiendo cambios
FAILED       → Falló y se compensó
```

**Endpoints principales:**
```
POST   /api/sagas/transfer     → Iniciar saga de transferencia
GET    /api/sagas/{id}         → Estado de saga
GET    /api/sagas              → Listar sagas
```

**¿Con quién se conecta?**

**Base de datos:**
- **PostgreSQL** (5432) → Lee/escribe en database `bank`
  - Tabla: `saga_instances` (id, state, steps, created_at, updated_at)

**Orquestación:**
- **Backend Bank System** (8083) → Envía comandos de saga via Kafka
- **Ledger Service** (8081) → Coordina registro contable

**Mensajería:**
- **Kafka** (9092) → Publica comandos:
  - Topic `saga-commands` → Envía pasos de saga a ejecutar
- Consume eventos:
  - Topic `saga-events` → Recibe resultados de pasos

**Registro:**
- **Eureka** (8761) → Se registra como `ORCHESTRATOR-SERVICE`

**¿Cómo se conecta?**

**Flujo de Saga (Transferencia):**
```
1. Frontend → POST /api/sagas/transfer {from: A, to: B, amount: 100}
2. Orchestrator crea saga → Estado: STARTED
3. Orchestrator publica comando → Topic: saga-commands
   {type: "RESERVE_FUNDS", account: A, amount: 100}
4. Backend consume comando → Reserva fondos
5. Backend publica evento → Topic: saga-events
   {type: "FUNDS_RESERVED", success: true}
6. Orchestrator consume evento → Avanza saga
7. Orchestrator publica siguiente comando...
   (continúa hasta completar o compensar)
```

**Tecnologías:**
- Spring Boot
- Apache Camel (orquestación)
- Spring State Machine (gestión de estados)

**Acceso:**
- Direct: http://localhost:8082/api/sagas
- Via Gateway: http://localhost:8085/api/sagas
- Health: http://localhost:8082/actuator/health

---

## 🎨 Capa de Presentación

### Frontend React (Puerto 3000)

**¿Qué es?**
- Aplicación web SPA (Single Page Application) en React

**¿Para qué sirve?**
- Interfaz de usuario para operaciones bancarias
- Login/logout de usuarios
- Gestión de cuentas y transacciones
- Monitoreo de sagas

**Componentes principales:**
```
AccountList      → Lista de cuentas
CreateAccount    → Formulario de nueva cuenta
Transfer         → Formulario de transferencia
SagaMonitor      → Monitor de estado de sagas
Login            → Integración con Keycloak
```

**¿Con quién se conecta?**

**Autenticación:**
- **Keycloak** (8080) → Login OAuth2 + PKCE
  - Auth URL: `http://localhost:8080/realms/rawson-bank/protocol/openid-connect/auth`
  - Token URL: `http://localhost:8080/realms/rawson-bank/protocol/openid-connect/token`

**API Backend:**
- **API Gateway** (8085) → Todas las llamadas API
  - Base URL: `http://localhost:8082` (Orchestrator directo)
  - Alternativa: `http://localhost:8085` (Via Gateway)

**¿Cómo se conecta?**

**Configuración (.env):**
```env
REACT_APP_BACKEND_URL=http://localhost:8082
REACT_APP_ORCHESTRATOR_URL=http://localhost:8082
REACT_APP_API_GATEWAY_URL=http://localhost:8085

REACT_APP_KEYCLOAK_URL=http://localhost:8080
REACT_APP_KEYCLOAK_REALM=rawson-bank
REACT_APP_KEYCLOAK_CLIENT_ID=rawson-bank-frontend
```

**Flujo de autenticación:**
```
1. Usuario accede → http://localhost:3000
2. App detecta no hay token → Redirige a Keycloak
3. Usuario ingresa credenciales en Keycloak
4. Keycloak valida → Genera token JWT
5. Keycloak redirige → http://localhost:3000?code=xxx
6. App intercambia código por token
7. App guarda token → localStorage
8. App hace requests con → Authorization: Bearer <token>
```

**Tecnologías:**
- React 18
- @react-keycloak/web (autenticación)
- Axios (HTTP client)
- React Router (navegación)
- Tailwind CSS (estilos)

**Acceso:**
- URL: http://localhost:3000
- Requiere npm start en modo desarrollo

---

## 🔍 Servicios Adicionales

### pgAdmin (Puerto 5050) - OPCIONAL

**¿Qué es?**
- Herramienta web de administración de PostgreSQL

**¿Para qué sirve?**
- Gestión visual de bases de datos
- Ejecución de queries SQL
- Administración de tablas, índices, usuarios
- Visualización de datos
- Backup y restore

**¿Con quién se conecta?**
- **PostgreSQL** (5432) → Gestiona databases `bank` y `keycloak`

**¿Cómo se conecta?**
- Protocolo: PostgreSQL Wire Protocol
- Host: `postgres-bank` (dentro de Docker)
- Port: 5432
- Usuario/Password: bank / bank

**Configuración en pgAdmin:**
```
General:
  Name: Bank Database

Connection:
  Host: postgres-bank
  Port: 5432
  Maintenance database: postgres
  Username: bank
  Password: bank
```

**Acceso:**
- URL: http://localhost:5050
- Credenciales: admin@admin.com / admin

**Nota:** Este servicio NO está en docker-compose.yml, se levanta manualmente.

---

## 📊 Diagrama de Conexiones

```
┌─────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (3000)                             │
│                     React + Keycloak OAuth2                          │
└────────────┬────────────────────────────────────────────┬───────────┘
             │                                             │
             │ HTTP + JWT                                  │ OAuth2
             ↓                                             ↓
┌────────────────────────┐                    ┌────────────────────────┐
│   API GATEWAY (8085)   │                    │   KEYCLOAK (8080)      │
│   Spring Cloud Gateway │                    │   IAM + OAuth2 Server  │
└────────┬───────────────┘                    └───────────┬────────────┘
         │ Eureka Discovery                               │ JDBC
         ↓                                                 ↓
┌────────────────────────┐                    ┌────────────────────────┐
│ SERVICE REGISTRY (8761)│                    │   POSTGRESQL (5432)    │
│      Eureka Server     │                    │   bank + keycloak DBs  │
└────────┬───────────────┘                    └───────────┬────────────┘
         │                                                 │
         │ Registration                                    │ JDBC
         ↓                                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│                        MICROSERVICIOS                                │
├─────────────────┬─────────────────┬─────────────────┬───────────────┤
│  BACKEND (8083) │  LEDGER (8081)  │ ORCHESTRATOR    │               │
│  Cuentas + Txs  │  Contabilidad   │    (8082)       │               │
│                 │  Double-Entry   │  Sagas + Camel  │               │
└────────┬────────┴────────┬────────┴────────┬────────┘               │
         │                 │                 │                         │
         │ Kafka Events    │                 │                         │
         └─────────────────┼─────────────────┘                         │
                           ↓                                           │
                ┌────────────────────────┐                             │
                │     KAFKA (9092)       │                             │
                │   Message Broker       │                             │
                └────────┬───────────────┘                             │
                         │                                             │
                         ↓                                             │
                ┌────────────────────────┐                             │
                │   ZOOKEEPER (2181)     │                             │
                │   Kafka Coordination   │                             │
                └────────────────────────┘                             │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    HERRAMIENTAS DE GESTIÓN                           │
├────────────────────────┬────────────────────────────────────────────┤
│   KAFKA UI (8090)      │        pgAdmin (5050)                      │
│   Monitor de Kafka     │        Admin PostgreSQL                    │
└────────────────────────┴────────────────────────────────────────────┘
```

---

## 🔗 Matriz de Conexiones

| Servicio | Puerto | Conecta con | Protocolo | Propósito |
|----------|--------|-------------|-----------|-----------|
| Frontend | 3000 | Keycloak (8080) | OAuth2/OIDC | Autenticación |
| Frontend | 3000 | API Gateway (8085) | HTTP REST | API calls |
| Frontend | 3000 | Orchestrator (8082) | HTTP REST | API calls directas |
| Keycloak | 8080 | PostgreSQL (5432) | JDBC | Persistencia usuarios |
| API Gateway | 8085 | Eureka (8761) | HTTP REST | Service discovery |
| API Gateway | 8085 | Backend (8083) | HTTP REST | Enrutamiento |
| API Gateway | 8085 | Ledger (8081) | HTTP REST | Enrutamiento |
| API Gateway | 8085 | Orchestrator (8082) | HTTP REST | Enrutamiento |
| Backend | 8083 | PostgreSQL (5432) | JDBC | Persistencia cuentas |
| Backend | 8083 | Kafka (9092) | Kafka Protocol | Eventos |
| Backend | 8083 | Eureka (8761) | HTTP REST | Registro servicio |
| Backend | 8083 | Keycloak (8080) | HTTP REST | Validación JWT |
| Ledger | 8081 | PostgreSQL (5432) | JDBC | Persistencia ledger |
| Ledger | 8081 | Kafka (9092) | Kafka Protocol | Eventos contables |
| Ledger | 8081 | Eureka (8761) | HTTP REST | Registro servicio |
| Orchestrator | 8082 | PostgreSQL (5432) | JDBC | Persistencia sagas |
| Orchestrator | 8082 | Kafka (9092) | Kafka Protocol | Comandos saga |
| Orchestrator | 8082 | Eureka (8761) | HTTP REST | Registro servicio |
| Kafka | 9092 | Zookeeper (2181) | ZooKeeper | Coordinación |
| Kafka UI | 8090 | Kafka (9092) | Kafka Protocol | Monitoreo |
| Kafka UI | 8090 | Zookeeper (2181) | ZooKeeper | Metadata |
| pgAdmin | 5050 | PostgreSQL (5432) | PostgreSQL | Administración |

---

## 🎯 Resumen por Capas

### Capa 1: Presentación
- **Frontend (3000)**: Interfaz de usuario

### Capa 2: Gateway & Seguridad
- **API Gateway (8085)**: Enrutamiento y filtros
- **Keycloak (8080)**: Autenticación y autorización

### Capa 3: Descubrimiento
- **Eureka (8761)**: Service registry

### Capa 4: Negocio
- **Backend Bank System (8083)**: Cuentas y transacciones
- **Ledger Service (8081)**: Contabilidad
- **Orchestrator Service (8082)**: Sagas y orquestación

### Capa 5: Mensajería
- **Kafka (9092)**: Message broker
- **Zookeeper (2181)**: Coordinación de Kafka

### Capa 6: Datos
- **PostgreSQL (5432)**: Base de datos relacional

### Capa 7: Herramientas
- **Kafka UI (8090)**: Gestión de Kafka
- **pgAdmin (5050)**: Gestión de PostgreSQL

---

## 📝 Orden de Inicialización

1. **PostgreSQL** (5432) - Base de datos fundamental
2. **Zookeeper** (2181) - Coordinación de Kafka
3. **Kafka** (9092) - Message broker
4. **Eureka** (8761) - Service registry
5. **Keycloak** (8080) - IAM (depende de PostgreSQL)
6. **Backend Services** (8083, 8081, 8082) - Microservicios (dependen de todos los anteriores)
7. **API Gateway** (8085) - Enrutamiento (depende de Eureka)
8. **Kafka UI** (8090) - Herramienta (depende de Kafka)
9. **Frontend** (3000) - Interfaz (depende de todo lo demás)
10. **pgAdmin** (5050) - Opcional (depende de PostgreSQL)

Este orden está configurado en `docker-compose.yml` mediante `depends_on` y `healthcheck`.
