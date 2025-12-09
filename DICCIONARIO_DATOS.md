# 📚 DICCIONARIO DE DATOS - SISTEMA BANCARIO

## 📋 Información General

**Base de Datos:** PostgreSQL 15  
**Nombre de BD:** `bank`  
**Charset:** UTF-8  
**Motor:** PostgreSQL  
**Puerto:** 5432  
**Usuario:** bank  
**Contraseña:** bank  

---

## 📊 TABLAS DE LA BASE DE DATOS

### 1. ACCOUNTS (Cuentas Bancarias)

**Descripción:** Almacena la información de las cuentas bancarias de los clientes.

**Propósito:** Gestión de cuentas bancarias, saldos y operaciones financieras.

**Servicio responsable:** Backend Bank System (Puerto 8083)

| Campo | Tipo | Nulo | Clave | Único | Descripción |
|-------|------|------|-------|-------|-------------|
| `id` | BIGSERIAL | NO | PK | SÍ | Identificador único autoincremental de la cuenta |
| `account_number` | VARCHAR(255) | NO | - | SÍ | Número de cuenta único (formato libre) |
| `currency` | VARCHAR(3) | NO | - | NO | Código de moneda ISO 4217 (ej: USD, EUR, ARS) |
| `balance` | DOUBLE PRECISION | NO | - | NO | Saldo actual de la cuenta |
| `owner_id` | VARCHAR(255) | NO | - | NO | Identificador del propietario (ID de usuario Keycloak) |

**Índices:**
- PRIMARY KEY: `id`
- UNIQUE INDEX: `account_number`
- INDEX: `owner_id` (para búsquedas por propietario)

**Constraints:**
- `account_number` debe ser único
- `balance` no puede ser nulo
- `currency` no puede ser nulo
- `owner_id` no puede ser nulo

**Ejemplo de registro:**
```sql
INSERT INTO accounts (account_number, currency, balance, owner_id)
VALUES ('ACC-2024-001', 'USD', 1500.00, 'user-uuid-123');
```

**Relaciones:**
- **owner_id** → Referencia lógica a usuarios en Keycloak (no hay FK física)

---

### 2. OUTBOX (Patrón Transactional Outbox)

**Descripción:** Tabla para implementar el patrón Transactional Outbox, garantizando la publicación de eventos a Kafka de manera atómica con las operaciones de base de datos.

**Propósito:** Garantizar consistencia entre las operaciones de base de datos y la publicación de eventos a Kafka mediante CDC (Change Data Capture) con Debezium.

**Servicio responsable:** Backend Bank System (Puerto 8083)

| Campo | Tipo | Nulo | Clave | Único | Descripción |
|-------|------|------|-------|-------|-------------|
| `id` | BIGSERIAL | NO | PK | SÍ | Identificador único autoincremental del evento |
| `aggregate_type` | VARCHAR(255) | NO | - | NO | Tipo de agregado (ej: "Account", "Transaction") |
| `aggregate_id` | VARCHAR(255) | NO | - | NO | ID del agregado afectado |
| `event_type` | VARCHAR(255) | NO | - | NO | Tipo de evento (ej: "AccountCreated", "BalanceUpdated") |
| `payload` | TEXT | NO | - | NO | Contenido del evento en formato JSON |
| `created_at` | TIMESTAMP WITH TIME ZONE | NO | - | NO | Fecha y hora de creación del evento |
| `processed` | BOOLEAN | NO | - | NO | Indica si el evento ya fue procesado por Debezium |

**Índices:**
- PRIMARY KEY: `id`
- INDEX: `processed` (para filtrar eventos pendientes)
- INDEX: `created_at` (para ordenamiento temporal)
- INDEX: `aggregate_id` (para búsqueda por agregado)

**Constraints:**
- Todos los campos son `NOT NULL`
- `payload` debe contener JSON válido

**Ejemplo de registro:**
```sql
INSERT INTO outbox (aggregate_type, aggregate_id, event_type, payload, created_at, processed)
VALUES (
  'Account',
  'ACC-2024-001',
  'AccountCreated',
  '{"accountNumber":"ACC-2024-001","currency":"USD","balance":1500.00,"ownerId":"user-123"}',
  NOW(),
  FALSE
);
```

**Flujo de procesamiento:**
1. Backend inserta evento en `outbox` en la misma transacción que modifica `accounts`
2. Debezium detecta el cambio vía PostgreSQL logical replication
3. Debezium publica el evento al topic Kafka `dbserver1.bankdb.public.outbox`
4. Consumidores Kafka procesan el evento
5. El campo `processed` se marca como `TRUE` (opcional, para auditoría)

**Relaciones:**
- **aggregate_id** → Referencia lógica a `accounts.account_number` u otras entidades

---

### 3. LEDGER_ENTRIES (Asientos Contables)

**Descripción:** Almacena todos los eventos y transacciones del sistema en formato de registro contable. Implementa un patrón simplificado de Event Sourcing.

**Propósito:** Auditoría completa, trazabilidad de todas las operaciones, reconstrucción del estado del sistema, contabilidad de doble entrada.

**Servicio responsable:** Ledger Service (Puerto 8081)

| Campo | Tipo | Nulo | Clave | Único | Descripción |
|-------|------|------|-------|-------|-------------|
| `id` | BIGSERIAL | NO | PK | SÍ | Identificador único autoincremental de la entrada |
| `event_id` | VARCHAR(255) | SÍ | - | NO | Identificador único del evento que generó esta entrada |
| `payload` | TEXT | SÍ | - | NO | Contenido completo del evento en formato JSON |
| `created_at` | TIMESTAMP WITH TIME ZONE | SÍ | - | NO | Fecha y hora de creación de la entrada |

**Índices:**
- PRIMARY KEY: `id`
- INDEX: `event_id` (para búsqueda por evento)
- INDEX: `created_at` (para consultas temporales)

**Estructura del payload (JSON):**
```json
{
  "eventType": "TransactionProcessed",
  "accountNumber": "ACC-2024-001",
  "transactionId": "TXN-2024-0001",
  "amount": 500.00,
  "type": "DEBIT",
  "timestamp": "2024-12-08T10:30:00Z",
  "balance": 1000.00
}
```

**Ejemplo de registro:**
```sql
INSERT INTO ledger_entries (event_id, payload, created_at)
VALUES (
  'evt-uuid-12345',
  '{"eventType":"TransactionProcessed","accountNumber":"ACC-2024-001","amount":500.00,"type":"DEBIT"}',
  NOW()
);
```

**Flujo de procesamiento:**
1. Backend publica evento a topic Kafka `transaction-events`
2. Ledger Service consume el evento
3. Ledger Service crea entrada en `ledger_entries` con el payload completo
4. Ledger Service publica confirmación a topic `ledger-events`

**Características especiales:**
- **Inmutabilidad:** Los registros NUNCA se modifican o eliminan
- **Append-only:** Solo se agregan nuevos registros
- **Auditoría completa:** Permite reconstruir el estado completo del sistema
- **Event Sourcing:** Cada cambio en el sistema genera una nueva entrada

**Relaciones:**
- **event_id** → Puede correlacionarse con eventos de Kafka
- **payload** → Contiene referencias a `account_number` u otros identificadores

---

### 4. TRANSFER_SAGA (Estado de Sagas de Transferencia)

**Descripción:** Almacena el estado de las transacciones distribuidas (sagas) para transferencias entre cuentas, implementando el patrón Saga Orquestado.

**Propósito:** Coordinación de transacciones distribuidas, manejo de compensaciones, garantizar consistencia eventual entre microservicios.

**Servicio responsable:** Orchestrator Service (Puerto 8082)

| Campo | Tipo | Nulo | Clave | Único | Descripción |
|-------|------|------|-------|-------|-------------|
| `id` | BIGSERIAL | NO | PK | SÍ | Identificador único autoincremental de la saga |
| `saga_id` | VARCHAR(255) | SÍ | - | NO | Identificador único de la saga (UUID) |
| `from_account` | VARCHAR(255) | SÍ | - | NO | Número de cuenta origen de la transferencia |
| `to_account` | VARCHAR(255) | SÍ | - | NO | Número de cuenta destino de la transferencia |
| `amount` | DOUBLE PRECISION | SÍ | - | NO | Monto de la transferencia |
| `status` | VARCHAR(50) | SÍ | - | NO | Estado actual de la saga |
| `created_at` | TIMESTAMP WITH TIME ZONE | SÍ | - | NO | Fecha y hora de inicio de la saga |
| `updated_at` | TIMESTAMP WITH TIME ZONE | SÍ | - | NO | Fecha y hora de última actualización |

**Índices:**
- PRIMARY KEY: `id`
- UNIQUE INDEX: `saga_id` (recomendado para evitar duplicados)
- INDEX: `status` (para filtrar por estado)
- INDEX: `created_at` (para consultas temporales)
- INDEX: `from_account` (para búsqueda por cuenta origen)
- INDEX: `to_account` (para búsqueda por cuenta destino)

**Valores permitidos para `status`:**

| Estado | Descripción |
|--------|-------------|
| `STARTED` | Saga iniciada, esperando ejecución |
| `IN_PROGRESS` | Saga en ejecución, pasos intermedios |
| `DEBITED` | Fondos debitados de cuenta origen |
| `CREDITED` | Fondos acreditados en cuenta destino |
| `COMPLETED` | Saga completada exitosamente |
| `FAILED` | Saga falló, requiere compensación |
| `COMPENSATING` | Ejecutando pasos de compensación |
| `COMPENSATED` | Compensación completada, saga revertida |

**Máquina de estados:**
```
STARTED → IN_PROGRESS → DEBITED → CREDITED → COMPLETED
                ↓           ↓          ↓
              FAILED → COMPENSATING → COMPENSATED
```

**Ejemplo de registro:**
```sql
INSERT INTO transfer_saga (saga_id, from_account, to_account, amount, status, created_at, updated_at)
VALUES (
  'saga-uuid-12345',
  'ACC-2024-001',
  'ACC-2024-002',
  500.00,
  'STARTED',
  NOW(),
  NOW()
);
```

**Flujo de procesamiento (Transferencia exitosa):**
1. Orchestrator crea saga con status `STARTED`
2. Publica comando a Kafka `saga-commands` → Debitar cuenta origen
3. Backend procesa débito → Responde a `saga-events`
4. Orchestrator actualiza status a `DEBITED`
5. Publica comando a Kafka → Acreditar cuenta destino
6. Backend procesa crédito → Responde a `saga-events`
7. Orchestrator actualiza status a `CREDITED`
8. Orchestrator actualiza status a `COMPLETED`

**Flujo de compensación (Transferencia fallida):**
1. Saga en estado `DEBITED` (fondos ya debitados)
2. Falla acreditación en cuenta destino
3. Orchestrator actualiza status a `FAILED`
4. Orchestrator inicia compensación → status `COMPENSATING`
5. Publica comando de compensación → Revertir débito
6. Backend revierte operación
7. Orchestrator actualiza status a `COMPENSATED`

**Relaciones:**
- **from_account** → Referencia lógica a `accounts.account_number`
- **to_account** → Referencia lógica a `accounts.account_number`
- **saga_id** → Correlacionado con eventos en topics Kafka `saga-commands` y `saga-events`

---

## 🔗 DIAGRAMA DE RELACIONES

```
┌─────────────────┐
│    ACCOUNTS     │
│  (Cuentas)      │
│ PK: id          │
│ UK: acc_number  │
└────────┬────────┘
         │
         │ owner_id (lógico)
         │ ↓ Keycloak users
         │
         ├─────────────────┐
         │                 │
         ↓                 ↓
┌─────────────────┐ ┌──────────────────┐
│     OUTBOX      │ │  TRANSFER_SAGA   │
│  (Eventos CDC)  │ │  (Orquestación)  │
│ PK: id          │ │ PK: id           │
│ aggregate_id → │ │ from_account →   │
│                 │ │ to_account →     │
└────────┬────────┘ └──────────────────┘
         │
         │ event_id (lógico)
         ↓
┌─────────────────┐
│ LEDGER_ENTRIES  │
│  (Auditoría)    │
│ PK: id          │
│ event_id        │
└─────────────────┘
```

**Notas sobre relaciones:**
- Las relaciones son **lógicas**, no hay foreign keys físicas
- Esto permite mayor flexibilidad en arquitectura de microservicios
- La integridad referencial se maneja a nivel de aplicación
- Los eventos de Kafka sirven como mecanismo de sincronización

---

## 📈 VOLUMETRÍA Y ESTIMACIONES

### Crecimiento esperado:

| Tabla | Registros/día | Registros/mes | Registros/año | Tamaño estimado/año |
|-------|---------------|---------------|---------------|---------------------|
| `accounts` | 10 | 300 | 3,600 | ~500 KB |
| `outbox` | 100 | 3,000 | 36,000 | ~10 MB |
| `ledger_entries` | 200 | 6,000 | 72,000 | ~50 MB |
| `transfer_saga` | 50 | 1,500 | 18,000 | ~5 MB |
| **TOTAL** | **360** | **10,800** | **129,600** | **~65 MB** |

### Consideraciones de mantenimiento:

**Tabla `outbox`:**
- Considerar purga de registros procesados después de 30 días
- Implementar archivado de eventos antiguos
- Monitorear crecimiento para evitar degradación de performance

**Tabla `ledger_entries`:**
- **NUNCA ELIMINAR** registros (auditoría legal)
- Considerar particionamiento por fecha después de 1M de registros
- Implementar compresión de payload JSON antiguo

**Tabla `transfer_saga`:**
- Purgar sagas completadas después de 90 días (retener fallidas)
- Archivar histórico para análisis de métricas
- Índices en `status` y `created_at` para performance

---

## 🔒 SEGURIDAD Y PERMISOS

### Permisos recomendados por servicio:

**Backend Bank System:**
```sql
GRANT SELECT, INSERT, UPDATE ON accounts TO backend_user;
GRANT SELECT, INSERT ON outbox TO backend_user;
```

**Ledger Service:**
```sql
GRANT SELECT, INSERT ON ledger_entries TO ledger_user;
-- READ-ONLY, nunca UPDATE ni DELETE
```

**Orchestrator Service:**
```sql
GRANT SELECT, INSERT, UPDATE ON transfer_saga TO orchestrator_user;
GRANT SELECT ON accounts TO orchestrator_user; -- Solo lectura
```

### Auditoría:
- Habilitar PostgreSQL audit logging para tablas críticas
- Monitorear intentos de DELETE o UPDATE en `ledger_entries`
- Alertas sobre modificaciones masivas en `accounts.balance`

---

## 📝 SCRIPTS DE MANTENIMIENTO

### Limpieza de tabla OUTBOX (eventos procesados > 30 días):
```sql
DELETE FROM outbox
WHERE processed = TRUE
  AND created_at < NOW() - INTERVAL '30 days';
```

### Análisis de sagas fallidas:
```sql
SELECT saga_id, from_account, to_account, amount, status, created_at
FROM transfer_saga
WHERE status IN ('FAILED', 'COMPENSATING', 'COMPENSATED')
  AND created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

### Reporte de transacciones por cuenta:
```sql
SELECT 
  payload::json->>'accountNumber' as account_number,
  COUNT(*) as total_transactions,
  SUM((payload::json->>'amount')::numeric) as total_amount
FROM ledger_entries
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY payload::json->>'accountNumber'
ORDER BY total_amount DESC;
```

### Verificación de integridad de saldos:
```sql
-- Comparar saldo en accounts vs suma de movimientos en ledger
SELECT 
  a.account_number,
  a.balance as current_balance,
  COALESCE(SUM(
    CASE 
      WHEN l.payload::json->>'type' = 'CREDIT' THEN (l.payload::json->>'amount')::numeric
      WHEN l.payload::json->>'type' = 'DEBIT' THEN -(l.payload::json->>'amount')::numeric
      ELSE 0
    END
  ), 0) as calculated_balance
FROM accounts a
LEFT JOIN ledger_entries l ON l.payload::json->>'accountNumber' = a.account_number
GROUP BY a.id, a.account_number, a.balance
HAVING a.balance != COALESCE(SUM(
  CASE 
    WHEN l.payload::json->>'type' = 'CREDIT' THEN (l.payload::json->>'amount')::numeric
    WHEN l.payload::json->>'type' = 'DEBIT' THEN -(l.payload::json->>'amount')::numeric
    ELSE 0
  END
), 0);
```

---

## 🔧 CONFIGURACIÓN DE BASE DE DATOS

### Parámetros PostgreSQL recomendados:

```ini
# postgresql.conf

# Conexiones
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB

# Replicación lógica para Debezium
wal_level = logical
max_wal_senders = 10
max_replication_slots = 10

# Performance
random_page_cost = 1.1  # Para SSD
effective_io_concurrency = 200

# Logging
log_statement = 'mod'  # Log INSERT, UPDATE, DELETE
log_duration = on
log_min_duration_statement = 1000  # Log queries > 1s
```

### Configuración Debezium CDC:

**Slot de replicación:**
```sql
SELECT pg_create_logical_replication_slot('debezium', 'pgoutput');
```

**Publicación para outbox:**
```sql
CREATE PUBLICATION dbserver1_pub FOR TABLE outbox;
```

**Verificar replicación:**
```sql
SELECT * FROM pg_replication_slots WHERE slot_name = 'debezium';
SELECT * FROM pg_publication_tables WHERE pubname = 'dbserver1_pub';
```

---

## 📊 QUERIES DE MONITOREO

### Tamaño de tablas:
```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY size_bytes DESC;
```

### Índices no utilizados:
```sql
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  pg_size_pretty(pg_relation_size(indexrelid)) AS size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;
```

### Actividad de tablas (inserts/updates/deletes):
```sql
SELECT 
  schemaname,
  relname as table_name,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes,
  n_live_tup as live_rows,
  n_dead_tup as dead_rows,
  last_autovacuum,
  last_autoanalyze
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_tup_ins + n_tup_upd + n_tup_del DESC;
```

### Conexiones activas por servicio:
```sql
SELECT 
  application_name,
  state,
  COUNT(*) as connections
FROM pg_stat_activity
WHERE datname = 'bank'
GROUP BY application_name, state
ORDER BY connections DESC;
```

---

## 📚 REFERENCIAS

**Patrones implementados:**
- **Transactional Outbox:** Garantiza publicación de eventos consistente
- **Event Sourcing (simplificado):** Todas las transacciones se registran en ledger
- **Saga Pattern (Orchestrated):** Coordinación de transacciones distribuidas
- **CQRS (implícito):** Separación entre escritura (backend) y lectura (ledger)

**Documentación relacionada:**
- `SERVICIOS_Y_PUERTOS.md` → Arquitectura de servicios
- `GUIA_CAMEL_KAFKA_SAGA.md` → Implementación de Saga Pattern
- `TECHNICAL_DOC.md` → Documentación técnica completa

**Tecnologías:**
- PostgreSQL 15
- Debezium 2.1 (CDC - Change Data Capture)
- Apache Kafka 7.5.0
- Spring Boot 3.3.3 + JPA/Hibernate

---

## 📞 SOPORTE Y CONTACTO

Para consultas sobre la estructura de datos:
- Revisar código fuente en `*/src/main/java/*/domain/*.java`
- Consultar configuración JPA en `*/src/main/resources/application.yml`
- Verificar estado actual: `docker exec -it postgres-bank psql -U bank -d bank`

**Comandos útiles:**
```bash
# Listar todas las tablas
\dt

# Describir estructura de tabla
\d+ accounts

# Ver índices de una tabla
\di+ accounts

# Ver tamaño de base de datos
\l+
```

---

**Última actualización:** 8 de Diciembre de 2025  
**Versión del documento:** 1.0  
**Base de datos:** PostgreSQL 15 (bank)  
**Tablas documentadas:** 4 (accounts, outbox, ledger_entries, transfer_saga)
