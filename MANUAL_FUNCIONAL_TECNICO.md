# MANUAL FUNCIONAL Y TÉCNICO - SISTEMA BANCARIO DISTRIBUIDO

## Tabla de Contenidos
1. [Visión General del Sistema](#1-visión-general-del-sistema)
2. [Arquitectura Técnica](#2-arquitectura-técnica)
3. [Componentes del Sistema](#3-componentes-del-sistema)
4. [Guía de Testing con Postman](#4-guía-de-testing-con-postman)
5. [Flujos de Negocio](#5-flujos-de-negocio)
6. [Monitoreo y Administración](#6-monitoreo-y-administración)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Visión General del Sistema

### 1.1 Descripción Funcional

El **Sistema Bancario Distribuido** es una arquitectura de microservicios diseñada para gestionar operaciones bancarias fundamentales con alta disponibilidad, escalabilidad y resiliencia. El sistema implementa patrones modernos como:

- ✅ **Service Discovery** (Eureka)
- ✅ **API Gateway** (Spring Cloud Gateway)
- ✅ **Event-Driven Architecture** (Apache Kafka)
- ✅ **Saga Pattern** (Apache Camel)
- ✅ **Distributed Transactions**

### 1.2 Funcionalidades Principales

| Funcionalidad | Descripción | Servicio Responsable |
|--------------|-------------|---------------------|
| **Gestión de Cuentas** | Crear, consultar y listar cuentas bancarias | backend-bank-system |
| **Transferencias** | Realizar transferencias entre cuentas con patrón Saga | orchestrator-service |
| **Registro de Ledger** | Registrar todas las transacciones en libro mayor | ledger-service |
| **Enrutamiento** | Enrutar peticiones a servicios correspondientes | api-gateway |
| **Descubrimiento** | Registro y descubrimiento dinámico de servicios | service-registry |

### 1.3 Casos de Uso

#### CU-01: Crear Cuenta Bancaria
**Actor:** Sistema Cliente/Usuario  
**Flujo:**
1. Cliente envía solicitud POST con datos de cuenta
2. Backend valida y persiste en PostgreSQL
3. Retorna cuenta creada con ID único
4. Emite evento a Kafka (opcional)

#### CU-02: Transferencia entre Cuentas
**Actor:** Sistema Cliente/Usuario  
**Flujo:**
1. Cliente solicita transferencia con cuenta origen, destino y monto
2. Orchestrator inicia patrón Saga
3. Debita cuenta origen
4. Acredita cuenta destino
5. Registra en Ledger
6. Si falla algún paso, ejecuta compensación automática

---

## 2. Arquitectura Técnica

### 2.1 Diagrama de Arquitectura

```
┌─────────────────┐
│   Frontend      │
│   (React 18)    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│           API Gateway (Port 8085)                │
│      Spring Cloud Gateway + Load Balancer        │
└────────┬────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│      Service Registry (Eureka - Port 8761)       │
│         Service Discovery & Health Checks        │
└─────────────────┬───────────────────────────────┘
                  │
      ┌───────────┼───────────┬─────────────┐
      ▼           ▼           ▼             ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Backend  │ │ Ledger   │ │Orchestr. │ │  Otros   │
│  :8080   │ │  :8081   │ │  :8082   │ │Services  │
└────┬─────┘ └────┬─────┘ └────┬─────┘ └──────────┘
     │            │            │
     └────────────┼────────────┘
                  ▼
     ┌────────────────────────┐
     │   PostgreSQL :5432     │
     │   Database: bank       │
     └────────────────────────┘
                  │
                  ▼
     ┌────────────────────────┐
     │   Apache Kafka :9092   │
     │   Event Streaming      │
     └────────────────────────┘
                  │
                  ▼
     ┌────────────────────────┐
     │   Zookeeper :2181      │
     │   Kafka Coordinator    │
     └────────────────────────┘
```

### 2.2 Stack Tecnológico

| Componente | Tecnología | Versión |
|-----------|-----------|---------|
| **Backend** | Java | 21 (Eclipse Temurin) |
| **Framework** | Spring Boot | 3.3.3 |
| **Service Discovery** | Spring Cloud Netflix Eureka | 2023.0.3 |
| **API Gateway** | Spring Cloud Gateway | 2023.0.3 |
| **Message Broker** | Apache Kafka | 7.5.0 |
| **Integration** | Apache Camel | 4.0.0 |
| **Database** | PostgreSQL | 15 Alpine |
| **ORM** | Spring Data JPA / Hibernate | 3.3.3 |
| **Build Tool** | Gradle | 8.4 |
| **Containerization** | Docker / Docker Compose | Latest |
| **Frontend** | React | 18 |

### 2.3 Puertos y Endpoints

| Servicio | Puerto | Health Check | Dashboard |
|---------|--------|--------------|-----------|
| **Service Registry** | 8761 | `/actuator/health` | http://localhost:8761 |
| **API Gateway** | 8085 | `/actuator/health` | - |
| **Backend Bank** | 8080 | `/actuator/health` | - |
| **Ledger Service** | 8081 | `/actuator/health` | - |
| **Orchestrator** | 8082 | `/actuator/health` | - |
| **PostgreSQL** | 5432 | - | - |
| **Kafka** | 9092 | - | - |
| **Kafka UI** | 8090 | - | http://localhost:8090 |
| **Zookeeper** | 2181 | - | - |

---

## 3. Componentes del Sistema

### 3.1 Service Registry (Eureka Server)

**Propósito:** Registro y descubrimiento dinámico de microservicios.

**Funciones:**
- ✅ Registro automático de servicios
- ✅ Health checks periódicos
- ✅ Balanceo de carga client-side
- ✅ Dashboard de monitoreo

**Configuración Clave:**
```yaml
server:
  port: 8761

eureka:
  client:
    register-with-eureka: false
    fetch-registry: false
```

**Acceso al Dashboard:**
```
URL: http://localhost:8761
```

### 3.2 API Gateway

**Propósito:** Punto de entrada único para todas las peticiones del sistema.

**Funciones:**
- ✅ Enrutamiento dinámico basado en Service Registry
- ✅ Load balancing automático
- ✅ Rate limiting (configurable)
- ✅ Circuit breaker (Resilience4j)

**Rutas Configuradas:**
```yaml
spring:
  cloud:
    gateway:
      discovery:
        locator:
          enabled: true
          lower-case-service-id: true
```

**Ejemplo de Enrutamiento:**
```
http://localhost:8085/backend-bank-system/api/v1/accounts
    ↓
http://backend-bank-system:8080/api/v1/accounts
```

### 3.3 Backend Bank System

**Propósito:** Servicio principal de gestión de cuentas bancarias.

**Entidades:**

#### Account
```java
{
  "id": Long,
  "accountNumber": String (único),
  "currency": String,
  "balance": Double,
  "ownerId": String
}
```

**Endpoints REST:**

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/accounts` | Listar todas las cuentas |
| POST | `/api/v1/accounts` | Crear nueva cuenta |
| POST | `/api/v1/accounts/debit` | Debitar cuenta (interno) |
| POST | `/api/v1/accounts/credit` | Acreditar cuenta (interno) |
| POST | `/api/v1/accounts/compensate` | Compensar operación (interno) |

**Base de Datos:**
```sql
CREATE TABLE accounts (
    id BIGSERIAL PRIMARY KEY,
    account_number VARCHAR(255) NOT NULL UNIQUE,
    currency VARCHAR(3) NOT NULL,
    balance NUMERIC(15,2) NOT NULL,
    owner_id VARCHAR(255) NOT NULL
);
```

### 3.4 Orchestrator Service

**Propósito:** Coordinar transacciones distribuidas usando patrón Saga.

**Endpoints REST:**

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/v1/transfer/start` | Iniciar transferencia |

**DTO TransferRequest:**
```json
{
  "sagaId": "string (opcional, autogenerado)",
  "fromAccount": "string (número de cuenta origen)",
  "toAccount": "string (número de cuenta destino)",
  "amount": number (monto a transferir)
}
```

**Flujo Saga:**
1. **Inicio:** Validar datos de entrada
2. **Paso 1:** Debitar cuenta origen
3. **Paso 2:** Acreditar cuenta destino
4. **Paso 3:** Registrar en Ledger
5. **Compensación:** Si falla algún paso, revertir operaciones completadas

### 3.5 Ledger Service

**Propósito:** Registro inmutable de todas las transacciones (libro mayor contable).

**Entidades:**

#### LedgerEntry
```java
{
  "id": Long,
  "transactionId": String,
  "accountNumber": String,
  "type": String (DEBIT/CREDIT),
  "amount": Double,
  "timestamp": LocalDateTime,
  "description": String
}
```

### 3.6 Apache Kafka

**Propósito:** Message broker para comunicación asíncrona entre servicios.

**Topics Principales:**
- `account-events` - Eventos de cuenta (crear, actualizar)
- `transfer-events` - Eventos de transferencia
- `ledger-events` - Eventos de registro contable

**Configuración:**
```properties
bootstrap.servers=kafka:29092
replication.factor=1
partitions=1
```

### 3.7 PostgreSQL

**Propósito:** Base de datos relacional compartida.

**Configuración:**
```
Database: bank
User: bank
Password: bank
Port: 5432
```

**Esquemas:**
- `accounts` - Cuentas bancarias
- `ledger_entries` - Registro de transacciones
- `transfer_sagas` - Estado de sagas de transferencia

---

## 4. Guía de Testing con Postman

### 4.1 Preparación

**Colección Postman:** Crear una nueva colección llamada "Banking System"

**Variables de Entorno:**
```json
{
  "gateway_url": "http://localhost:8085",
  "backend_url": "http://localhost:8080",
  "orchestrator_url": "http://localhost:8082",
  "ledger_url": "http://localhost:8081"
}
```

### 4.2 Test Suite Completo

#### TEST 1: Verificar Service Registry

**Request:**
```
GET http://localhost:8761/
Accept: text/html
```

**Validación:**
- Status: 200 OK
- Debe mostrar dashboard de Eureka
- Verificar que aparezcan registrados:
  - BACKEND-BANK-SYSTEM
  - LEDGER-SERVICE
  - ORCHESTRATOR-SERVICE
  - API-GATEWAY

---

#### TEST 2: Health Check de Servicios

**Request 1: Backend Health**
```
GET http://localhost:8080/actuator/health
```

**Response Esperado:**
```json
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP",
      "details": {
        "database": "PostgreSQL",
        "validationQuery": "isValid()"
      }
    },
    "diskSpace": {
      "status": "UP"
    },
    "ping": {
      "status": "UP"
    }
  }
}
```

**Request 2: API Gateway Health**
```
GET http://localhost:8085/actuator/health
```

**Request 3: Orchestrator Health**
```
GET http://localhost:8082/actuator/health
```

---

#### TEST 3: Crear Cuenta Bancaria (Directo)

**Request:**
```http
POST http://localhost:8080/api/v1/accounts
Content-Type: application/json

{
  "accountNumber": "ACC-001",
  "currency": "USD",
  "balance": 1000.00,
  "ownerId": "USER-001"
}
```

**Response Esperado:**
```json
{
  "id": 1,
  "accountNumber": "ACC-001",
  "currency": "USD",
  "balance": 1000.00,
  "ownerId": "USER-001"
}
```

**Validaciones:**
- Status: 200 OK
- Verificar que `id` sea generado automáticamente
- `accountNumber` debe ser único

**Tests en Postman:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Account created successfully", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property("id");
    pm.expect(jsonData.accountNumber).to.eql("ACC-001");
    pm.expect(jsonData.balance).to.eql(1000.00);
});

// Guardar ID para futuros tests
pm.environment.set("account_id", pm.response.json().id);
```

---

#### TEST 4: Crear Cuenta Bancaria (Vía Gateway)

**Request:**
```http
POST http://localhost:8085/backend-bank-system/api/v1/accounts
Content-Type: application/json

{
  "accountNumber": "ACC-002",
  "currency": "USD",
  "balance": 2000.00,
  "ownerId": "USER-002"
}
```

**Validaciones:**
- Status: 200 OK
- Verificar que el Gateway enruta correctamente
- Response debe ser idéntico al test 3

**Tests en Postman:**
```javascript
pm.test("Gateway routing works", function () {
    pm.response.to.have.status(200);
    var jsonData = pm.response.json();
    pm.expect(jsonData.accountNumber).to.eql("ACC-002");
});
```

---

#### TEST 5: Listar Todas las Cuentas

**Request:**
```http
GET http://localhost:8080/api/v1/accounts
Accept: application/json
```

**Response Esperado:**
```json
[
  {
    "id": 1,
    "accountNumber": "ACC-001",
    "currency": "USD",
    "balance": 1000.00,
    "ownerId": "USER-001"
  },
  {
    "id": 2,
    "accountNumber": "ACC-002",
    "currency": "USD",
    "balance": 2000.00,
    "ownerId": "USER-002"
  }
]
```

**Tests en Postman:**
```javascript
pm.test("Returns array of accounts", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.be.an('array');
    pm.expect(jsonData.length).to.be.at.least(2);
});
```

---

#### TEST 6: Crear Múltiples Cuentas (Preparación para Transferencia)

**Request 1: Cuenta Origen**
```http
POST http://localhost:8080/api/v1/accounts
Content-Type: application/json

{
  "accountNumber": "ACC-SENDER-001",
  "currency": "USD",
  "balance": 5000.00,
  "ownerId": "SENDER-USER"
}
```

**Request 2: Cuenta Destino**
```http
POST http://localhost:8080/api/v1/accounts
Content-Type: application/json

{
  "accountNumber": "ACC-RECEIVER-001",
  "currency": "USD",
  "balance": 1000.00,
  "ownerId": "RECEIVER-USER"
}
```

**Guardar Variables:**
```javascript
// En request 1
pm.environment.set("sender_account", "ACC-SENDER-001");
pm.environment.set("sender_balance", 5000.00);

// En request 2
pm.environment.set("receiver_account", "ACC-RECEIVER-001");
pm.environment.set("receiver_balance", 1000.00);
```

---

#### TEST 7: Transferencia entre Cuentas (Saga Exitosa)

**Request:**
```http
POST http://localhost:8082/api/v1/transfer/start
Content-Type: application/json

{
  "fromAccount": "ACC-SENDER-001",
  "toAccount": "ACC-RECEIVER-001",
  "amount": 500.00
}
```

**Response Esperado:**
```json
{
  "id": 1,
  "sagaId": "SAGA-UUID-GENERATED",
  "fromAccount": "ACC-SENDER-001",
  "toAccount": "ACC-RECEIVER-001",
  "amount": 500.00,
  "status": "COMPLETED",
  "createdAt": "2025-12-06T10:30:00",
  "updatedAt": "2025-12-06T10:30:01"
}
```

**Tests en Postman:**
```javascript
pm.test("Transfer completed successfully", function () {
    pm.response.to.have.status(200);
    var jsonData = pm.response.json();
    pm.expect(jsonData.status).to.eql("COMPLETED");
    pm.expect(jsonData.amount).to.eql(500.00);
    
    // Guardar sagaId
    pm.environment.set("saga_id", jsonData.sagaId);
});

pm.test("Saga ID is generated", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property("sagaId");
    pm.expect(jsonData.sagaId).to.not.be.empty;
});
```

---

#### TEST 8: Verificar Saldos Después de Transferencia

**Request 1: Verificar Cuenta Emisora**
```http
GET http://localhost:8080/api/v1/accounts
Accept: application/json
```

**Test:**
```javascript
pm.test("Sender balance decreased", function () {
    var accounts = pm.response.json();
    var sender = accounts.find(acc => acc.accountNumber === "ACC-SENDER-001");
    pm.expect(sender.balance).to.eql(4500.00); // 5000 - 500
});
```

**Request 2: Verificar Cuenta Receptora**
```javascript
pm.test("Receiver balance increased", function () {
    var accounts = pm.response.json();
    var receiver = accounts.find(acc => acc.accountNumber === "ACC-RECEIVER-001");
    pm.expect(receiver.balance).to.eql(1500.00); // 1000 + 500
});
```

---

#### TEST 9: Operación de Débito (Endpoint Interno)

**Request:**
```http
POST http://localhost:8080/api/v1/accounts/debit
Content-Type: application/json

{
  "accountNumber": "ACC-SENDER-001",
  "amount": 100.00,
  "sagaId": "TEST-SAGA-001"
}
```

**Response Esperado:**
```
Status: 200 OK
Body: (vacío)
```

**Tests:**
```javascript
pm.test("Debit operation successful", function () {
    pm.response.to.have.status(200);
});
```

---

#### TEST 10: Operación de Crédito (Endpoint Interno)

**Request:**
```http
POST http://localhost:8080/api/v1/accounts/credit
Content-Type: application/json

{
  "accountNumber": "ACC-RECEIVER-001",
  "amount": 100.00,
  "sagaId": "TEST-SAGA-001"
}
```

**Response Esperado:**
```
Status: 200 OK
Body: (vacío)
```

---

#### TEST 11: Transferencia con Cuenta Inexistente (Fallo Esperado)

**Request:**
```http
POST http://localhost:8082/api/v1/transfer/start
Content-Type: application/json

{
  "fromAccount": "ACC-NONEXISTENT",
  "toAccount": "ACC-RECEIVER-001",
  "amount": 500.00
}
```

**Response Esperado:**
```json
{
  "status": "FAILED",
  "error": "Account not found: ACC-NONEXISTENT"
}
```

**Tests:**
```javascript
pm.test("Transfer fails with invalid account", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.status).to.eql("FAILED");
    pm.expect(jsonData).to.have.property("error");
});
```

---

#### TEST 12: Transferencia con Saldo Insuficiente

**Request:**
```http
POST http://localhost:8082/api/v1/transfer/start
Content-Type: application/json

{
  "fromAccount": "ACC-SENDER-001",
  "toAccount": "ACC-RECEIVER-001",
  "amount": 999999.00
}
```

**Response Esperado:**
```json
{
  "status": "COMPENSATED",
  "error": "Insufficient funds",
  "compensationExecuted": true
}
```

---

### 4.3 Colección Postman Completa (JSON)

```json
{
  "info": {
    "name": "Banking System - Complete Test Suite",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Checks",
      "item": [
        {
          "name": "Service Registry Health",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:8761/actuator/health",
              "protocol": "http",
              "host": ["localhost"],
              "port": "8761",
              "path": ["actuator", "health"]
            }
          }
        },
        {
          "name": "Backend Health",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:8080/actuator/health",
              "protocol": "http",
              "host": ["localhost"],
              "port": "8080",
              "path": ["actuator", "health"]
            }
          }
        },
        {
          "name": "Orchestrator Health",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:8082/actuator/health",
              "protocol": "http",
              "host": ["localhost"],
              "port": "8082",
              "path": ["actuator", "health"]
            }
          }
        }
      ]
    },
    {
      "name": "Account Management",
      "item": [
        {
          "name": "Create Account - Direct",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"accountNumber\": \"ACC-001\",\n  \"currency\": \"USD\",\n  \"balance\": 1000.00,\n  \"ownerId\": \"USER-001\"\n}"
            },
            "url": {
              "raw": "http://localhost:8080/api/v1/accounts",
              "protocol": "http",
              "host": ["localhost"],
              "port": "8080",
              "path": ["api", "v1", "accounts"]
            }
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Status code is 200\", function () {",
                  "    pm.response.to.have.status(200);",
                  "});",
                  "",
                  "pm.test(\"Account created successfully\", function () {",
                  "    var jsonData = pm.response.json();",
                  "    pm.expect(jsonData).to.have.property(\"id\");",
                  "    pm.expect(jsonData.accountNumber).to.eql(\"ACC-001\");",
                  "});"
                ]
              }
            }
          ]
        },
        {
          "name": "Create Account - Via Gateway",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"accountNumber\": \"ACC-002\",\n  \"currency\": \"USD\",\n  \"balance\": 2000.00,\n  \"ownerId\": \"USER-002\"\n}"
            },
            "url": {
              "raw": "http://localhost:8085/backend-bank-system/api/v1/accounts",
              "protocol": "http",
              "host": ["localhost"],
              "port": "8085",
              "path": ["backend-bank-system", "api", "v1", "accounts"]
            }
          }
        },
        {
          "name": "List All Accounts",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:8080/api/v1/accounts",
              "protocol": "http",
              "host": ["localhost"],
              "port": "8080",
              "path": ["api", "v1", "accounts"]
            }
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Returns array of accounts\", function () {",
                  "    var jsonData = pm.response.json();",
                  "    pm.expect(jsonData).to.be.an('array');",
                  "});"
                ]
              }
            }
          ]
        }
      ]
    },
    {
      "name": "Transfers",
      "item": [
        {
          "name": "Prepare - Create Sender Account",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"accountNumber\": \"ACC-SENDER-001\",\n  \"currency\": \"USD\",\n  \"balance\": 5000.00,\n  \"ownerId\": \"SENDER-USER\"\n}"
            },
            "url": {
              "raw": "http://localhost:8080/api/v1/accounts",
              "protocol": "http",
              "host": ["localhost"],
              "port": "8080",
              "path": ["api", "v1", "accounts"]
            }
          }
        },
        {
          "name": "Prepare - Create Receiver Account",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"accountNumber\": \"ACC-RECEIVER-001\",\n  \"currency\": \"USD\",\n  \"balance\": 1000.00,\n  \"ownerId\": \"RECEIVER-USER\"\n}"
            },
            "url": {
              "raw": "http://localhost:8080/api/v1/accounts",
              "protocol": "http",
              "host": ["localhost"],
              "port": "8080",
              "path": ["api", "v1", "accounts"]
            }
          }
        },
        {
          "name": "Execute Transfer",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"fromAccount\": \"ACC-SENDER-001\",\n  \"toAccount\": \"ACC-RECEIVER-001\",\n  \"amount\": 500.00\n}"
            },
            "url": {
              "raw": "http://localhost:8082/api/v1/transfer/start",
              "protocol": "http",
              "host": ["localhost"],
              "port": "8082",
              "path": ["api", "v1", "transfer", "start"]
            }
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Transfer completed\", function () {",
                  "    pm.response.to.have.status(200);",
                  "    var jsonData = pm.response.json();",
                  "    pm.expect(jsonData.status).to.eql(\"COMPLETED\");",
                  "});"
                ]
              }
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 5. Flujos de Negocio

### 5.1 Flujo: Crear Cuenta Bancaria

```
┌─────────┐      ┌──────────┐      ┌──────────┐      ┌────────────┐
│ Cliente │      │ Gateway  │      │ Backend  │      │ PostgreSQL │
└────┬────┘      └────┬─────┘      └────┬─────┘      └─────┬──────┘
     │                │                  │                   │
     │ POST /accounts │                  │                   │
     ├───────────────>│                  │                   │
     │                │  Route           │                   │
     │                ├─────────────────>│                   │
     │                │                  │ INSERT            │
     │                │                  ├──────────────────>│
     │                │                  │                   │
     │                │                  │<──────────────────┤
     │                │                  │ Account + ID      │
     │                │<─────────────────┤                   │
     │<───────────────┤                  │                   │
     │ 200 OK         │                  │                   │
     │ Account Data   │                  │                   │
```

**Pasos:**
1. Cliente envía POST a Gateway
2. Gateway descubre servicio backend vía Eureka
3. Gateway enruta petición a backend
4. Backend valida datos
5. Backend persiste en PostgreSQL
6. PostgreSQL retorna ID generado
7. Backend retorna cuenta completa
8. Gateway retorna respuesta a cliente

### 5.2 Flujo: Transferencia Exitosa (Saga)

```
┌─────────┐   ┌──────────────┐   ┌──────────┐   ┌──────────┐
│ Cliente │   │ Orchestrator │   │ Backend  │   │  Ledger  │
└────┬────┘   └──────┬───────┘   └────┬─────┘   └────┬─────┘
     │               │                 │              │
     │ POST transfer │                 │              │
     ├──────────────>│                 │              │
     │               │ 1. Debit        │              │
     │               ├────────────────>│              │
     │               │                 │              │
     │               │<────────────────┤              │
     │               │ OK              │              │
     │               │                 │              │
     │               │ 2. Credit       │              │
     │               ├────────────────>│              │
     │               │                 │              │
     │               │<────────────────┤              │
     │               │ OK              │              │
     │               │                 │              │
     │               │ 3. Log          │              │
     │               ├────────────────────────────────>│
     │               │                 │              │
     │               │<────────────────────────────────┤
     │               │ OK              │              │
     │               │                 │              │
     │<──────────────┤                 │              │
     │ 200 COMPLETED │                 │              │
```

### 5.3 Flujo: Transferencia Fallida (Compensación)

```
┌─────────┐   ┌──────────────┐   ┌──────────┐
│ Cliente │   │ Orchestrator │   │ Backend  │
└────┬────┘   └──────┬───────┘   └────┬─────┘
     │               │                 │
     │ POST transfer │                 │
     ├──────────────>│                 │
     │               │ 1. Debit        │
     │               ├────────────────>│
     │               │                 │
     │               │<────────────────┤
     │               │ OK              │
     │               │                 │
     │               │ 2. Credit       │
     │               ├────────────────>│
     │               │                 │
     │               │<────────────────┤
     │               │ ERROR (Saldo)   │
     │               │                 │
     │               │ 3. Compensate   │
     │               ├────────────────>│
     │               │ (Reversa Debit) │
     │               │                 │
     │               │<────────────────┤
     │               │ OK              │
     │               │                 │
     │<──────────────┤                 │
     │ 200 COMPENSATED                │
```

---

## 6. Monitoreo y Administración

### 6.1 Eureka Dashboard

**URL:** http://localhost:8761

**Información Disponible:**
- ✅ Servicios registrados
- ✅ Estado de salud de cada servicio
- ✅ Instancias activas
- ✅ Información de replicación

**Captura de Pantalla Típica:**
```
Application         AMIs        Availability Zones    Status
BACKEND-BANK-SYSTEM  n/a   (1)  (1)                   UP (1) - localhost:8080
API-GATEWAY          n/a   (1)  (1)                   UP (1) - localhost:8085
ORCHESTRATOR-SERVICE n/a   (1)  (1)                   UP (1) - localhost:8082
LEDGER-SERVICE       n/a   (1)  (1)                   UP (1) - localhost:8081
```

### 6.2 Kafka UI

**URL:** http://localhost:8090

**Funcionalidades:**
- ✅ Ver topics y particiones
- ✅ Consumir mensajes en tiempo real
- ✅ Producir mensajes de prueba
- ✅ Ver consumer groups
- ✅ Monitorear lag de consumidores
- ✅ Ver configuración de brokers

**Operaciones Comunes:**

**Crear Topic:**
1. Ir a "Topics"
2. Click "Create Topic"
3. Nombre: `test-topic`
4. Partitions: 1
5. Replication Factor: 1

**Enviar Mensaje:**
1. Seleccionar topic
2. Tab "Messages"
3. Click "Produce Message"
4. Key: `test-key`
5. Value: `{"message": "Hello Kafka"}`

**Consumir Mensajes:**
1. Seleccionar topic
2. Tab "Messages"
3. Seleccionar "From beginning"
4. Click "Consume"

### 6.3 PostgreSQL

**Conexión con psql:**
```bash
docker exec -it postgres-bank psql -U bank -d bank
```

**Queries Útiles:**

```sql
-- Ver todas las cuentas
SELECT * FROM accounts;

-- Ver saldo total
SELECT SUM(balance) AS total_balance FROM accounts;

-- Ver cuentas por propietario
SELECT * FROM accounts WHERE owner_id = 'USER-001';

-- Ver últimas transacciones (si existe tabla ledger_entries)
SELECT * FROM ledger_entries ORDER BY timestamp DESC LIMIT 10;

-- Verificar integridad de saldos
SELECT 
    account_number, 
    balance, 
    (SELECT SUM(CASE WHEN type='CREDIT' THEN amount ELSE -amount END) 
     FROM ledger_entries 
     WHERE account_number = a.account_number) AS calculated_balance
FROM accounts a;
```

### 6.4 Docker Commands

**Ver logs en tiempo real:**
```bash
# Todos los servicios
docker-compose logs -f

# Servicio específico
docker-compose logs -f backend-bank-system
docker-compose logs -f kafka-bank
```

**Ver estadísticas de recursos:**
```bash
docker stats
```

**Reiniciar servicio:**
```bash
docker-compose restart backend-bank-system
```

**Reconstruir servicio:**
```bash
docker-compose up -d --build backend-bank-system
```

---

## 7. Troubleshooting

### 7.1 Servicio no se registra en Eureka

**Síntomas:**
- Servicio arranca pero no aparece en dashboard de Eureka
- Logs muestran "DiscoveryClient_XXX - registration status: 404"

**Solución:**
1. Verificar que Eureka esté corriendo:
   ```bash
   docker ps | grep service-registry
   ```

2. Verificar configuración en `application.yml`:
   ```yaml
   eureka:
     client:
       service-url:
         defaultZone: http://service-registry:8761/eureka/
   ```

3. Verificar red Docker:
   ```bash
   docker network inspect rawson-pruebatecnica-bank_default
   ```

### 7.2 Kafka NodeExistsException

**Síntomas:**
- Kafka falla al arrancar
- Error: "NodeExistsException: node already exists"

**Solución:**
```bash
# Detener todo y limpiar volúmenes
docker-compose down -v

# Reiniciar
docker-compose up -d
```

### 7.3 Database "bank" does not exist

**Síntomas:**
- Servicios fallan al conectar a PostgreSQL
- Error: "database bank does not exist"

**Solución:**
Verificar que `docker-compose.yml` tenga:
```yaml
postgres:
  environment:
    POSTGRES_DB: bank  # No "bankdb"
```

Si está mal, corregir y recrear:
```bash
docker-compose down -v
docker-compose up -d postgres
```

### 7.4 Puerto ya en uso

**Síntomas:**
- Error: "Bind for 0.0.0.0:8080 failed: port is already allocated"

**Solución:**
```cmd
# Windows - Ver qué proceso usa el puerto
netstat -ano | findstr :8080

# Matar proceso
taskkill /PID <PID> /F

# O cambiar puerto en docker-compose.yml
ports:
  - "8081:8080"  # Mapea 8081 externo a 8080 interno
```

### 7.5 Servicio en CrashLoopBackOff

**Diagnóstico:**
```bash
# Ver logs del contenedor
docker logs <container_name>

# Ver últimas 100 líneas
docker logs --tail 100 backend-bank-system

# Seguir logs en tiempo real
docker logs -f backend-bank-system
```

**Causas Comunes:**
- Dependencias no iniciadas (usar `depends_on` con healthchecks)
- Configuración incorrecta
- Errores en código Java

---

## 8. Anexos

### 8.1 Variables de Entorno Completas

```bash
# PostgreSQL
POSTGRES_DB=bank
POSTGRES_USER=bank
POSTGRES_PASSWORD=bank

# Kafka
KAFKA_BROKER_ID=1
KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181
KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://kafka:29092,PLAINTEXT_HOST://localhost:9092

# Spring Services
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/bank
SPRING_DATASOURCE_USERNAME=bank
SPRING_DATASOURCE_PASSWORD=bank
KAFKA_BOOTSTRAP_SERVERS=kafka:29092
EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://service-registry:8761/eureka/
```

### 8.2 Curl Examples

```bash
# Health check
curl http://localhost:8080/actuator/health

# Crear cuenta
curl -X POST http://localhost:8080/api/v1/accounts \
  -H "Content-Type: application/json" \
  -d '{"accountNumber":"ACC-CURL-001","currency":"USD","balance":1000.00,"ownerId":"CURL-USER"}'

# Listar cuentas
curl http://localhost:8080/api/v1/accounts

# Transferencia
curl -X POST http://localhost:8082/api/v1/transfer/start \
  -H "Content-Type: application/json" \
  -d '{"fromAccount":"ACC-001","toAccount":"ACC-002","amount":100.00}'
```

### 8.3 Comandos Docker Útiles

```bash
# Ver todos los contenedores
docker ps -a

# Ver volúmenes
docker volume ls

# Limpiar todo (CUIDADO: borra datos)
docker-compose down -v
docker system prune -a

# Ver uso de disco
docker system df

# Inspeccionar contenedor
docker inspect backend-bank-system

# Ejecutar comando en contenedor
docker exec -it backend-bank-system bash

# Ver logs con timestamp
docker-compose logs -f -t backend-bank-system
```

---

## Conclusión

Este manual proporciona una guía completa para entender, operar y testear el Sistema Bancario Distribuido. Para más información, consultar:

- `README.md` - Información general del proyecto
- `TECHNICAL_DOC.md` - Documentación técnica detallada
- `TROUBLESHOOTING.md` - Guía de resolución de problemas
- `INSTRUCCIONES_EJECUCION.md` - Instrucciones de instalación y ejecución

**Contacto y Soporte:**
- GitHub Issues: [Repositorio del proyecto]
- Documentación adicional en `/docs`

---

**Versión:** 1.0  
**Fecha:** Diciembre 2025  
**Autor:** Sistema Bancario Distribuido Team
