# APACHE CAMEL, KAFKA Y PATRÓN SAGA - GUÍA DE IMPLEMENTACIÓN

## Tabla de Contenidos
1. [Introducción](#1-introducción)
2. [Apache Kafka en el Proyecto](#2-apache-kafka-en-el-proyecto)
3. [Apache Camel en el Proyecto](#3-apache-camel-en-el-proyecto)
4. [Patrón Saga](#4-patrón-saga)
5. [Integración Completa](#5-integración-completa)
6. [Ejemplos Prácticos](#6-ejemplos-prácticos)
7. [Configuración y Troubleshooting](#7-configuración-y-troubleshooting)

---

## 1. Introducción

### 1.1 ¿Por qué Apache Camel, Kafka y Saga?

En arquitecturas de microservicios distribuidos, necesitamos:

| Problema | Solución | Tecnología |
|----------|----------|------------|
| **Comunicación Asíncrona** | Message Broker robusto | Apache Kafka |
| **Integración de Servicios** | Framework de enrutamiento y transformación | Apache Camel |
| **Transacciones Distribuidas** | Patrón de consistencia eventual | Saga Pattern |

### 1.2 Arquitectura de Mensajería

```
┌─────────────────────────────────────────────────────────────┐
│                    APACHE KAFKA (Message Broker)            │
│                                                             │
│  Topics:                                                    │
│  ├── account.events           (Eventos de cuentas)        │
│  ├── transfer.events          (Eventos de transferencias)  │
│  ├── ledger.events            (Eventos de libro mayor)     │
│  └── outbox                   (Patrón Outbox CDC)          │
└─────────────────────────────────────────────────────────────┘
         ▲                    ▲                    ▲
         │                    │                    │
         │ Produce/Consume    │ Produce/Consume    │ Produce/Consume
         │                    │                    │
┌────────┴─────────┐  ┌───────┴────────┐  ┌───────┴────────┐
│  Backend Service │  │ Ledger Service │  │ Orchestrator   │
│                  │  │                │  │                │
│  Apache Camel    │  │ Apache Camel   │  │ Saga Pattern   │
│  Routes          │  │ Routes         │  │ Compensation   │
└──────────────────┘  └────────────────┘  └────────────────┘
```

---

## 2. Apache Kafka en el Proyecto

### 2.1 ¿Qué es Apache Kafka?

**Apache Kafka** es una plataforma de streaming distribuida que permite:
- ✅ Publicar y suscribirse a streams de eventos
- ✅ Almacenar streams de forma duradera y tolerante a fallos
- ✅ Procesar streams en tiempo real

### 2.2 Configuración de Kafka

#### docker-compose.yml
```yaml
zookeeper:
  image: confluentinc/cp-zookeeper:7.5.0
  container_name: zookeeper-bank
  environment:
    ZOOKEEPER_CLIENT_PORT: 2181
    ZOOKEEPER_TICK_TIME: 2000
  ports:
    - "2181:2181"
  volumes:
    - zookeeper-data:/var/lib/zookeeper/data
    - zookeeper-log:/var/lib/zookeeper/log

kafka:
  image: confluentinc/cp-kafka:7.5.0
  container_name: kafka-bank
  depends_on:
    - zookeeper
  ports:
    - "9092:9092"
  environment:
    KAFKA_BROKER_ID: 1
    KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
    KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:29092,PLAINTEXT_HOST://localhost:9092
    KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
    KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT
    KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
  volumes:
    - kafka-data:/var/lib/kafka/data

kafka-ui:
  image: provectuslabs/kafka-ui:latest
  container_name: kafka-ui
  ports:
    - "8090:8080"
  environment:
    KAFKA_CLUSTERS_0_NAME: bank-cluster
    KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS: kafka:29092
    KAFKA_CLUSTERS_0_ZOOKEEPER: zookeeper:2181
```

### 2.3 Topics en el Proyecto

| Topic | Propósito | Producer | Consumer |
|-------|-----------|----------|----------|
| `account.events` | Eventos de ciclo de vida de cuentas (crear, actualizar) | backend-bank-system | ledger-service, otros |
| `transfer.events` | Eventos de transferencias iniciadas/completadas | orchestrator-service | ledger-service |
| `ledger.events` | Registro de transacciones en libro mayor | ledger-service | analytics-service (futuro) |
| `dbserver1.bankdb.public.outbox` | Change Data Capture (CDC) con Debezium | PostgreSQL (CDC) | backend-bank-system |
| `account.events.dlq` | Dead Letter Queue para mensajes fallidos | backend-bank-system | monitoring |

### 2.4 Modelo de Mensajes

#### Account Event
```json
{
  "eventId": "uuid-v4",
  "eventType": "ACCOUNT_CREATED",
  "timestamp": "2025-12-06T10:30:00Z",
  "aggregateId": "ACC-001",
  "payload": {
    "accountNumber": "ACC-001",
    "currency": "USD",
    "balance": 1000.00,
    "ownerId": "USER-001"
  },
  "metadata": {
    "correlationId": "req-123",
    "causationId": "cmd-456",
    "userId": "admin"
  }
}
```

#### Transfer Event
```json
{
  "eventId": "uuid-v4",
  "eventType": "TRANSFER_COMPLETED",
  "timestamp": "2025-12-06T10:35:00Z",
  "sagaId": "SAGA-001",
  "payload": {
    "fromAccount": "ACC-001",
    "toAccount": "ACC-002",
    "amount": 500.00,
    "status": "COMPLETED"
  }
}
```

### 2.5 Configuración Spring Kafka

#### application.yml
```yaml
spring:
  kafka:
    bootstrap-servers: kafka:29092
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
      acks: all
      retries: 3
      properties:
        enable.idempotence: true
    consumer:
      group-id: backend-bank-system-group
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer
      auto-offset-reset: earliest
      enable-auto-commit: false
      properties:
        spring.json.trusted.packages: "*"

kafka:
  bootstrap-servers: ${KAFKA_BOOTSTRAP_SERVERS:localhost:9092}
  outbox:
    topic: dbserver1.bankdb.public.outbox
  account:
    events:
      topic: account.events
  dlq:
    topic: account.events.dlq
```

### 2.6 Uso de Kafka (Código Ejemplo)

#### Productor Kafka
```java
package com.rawson.bank.service;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class AccountEventPublisher {

    private final KafkaTemplate<String, AccountEvent> kafkaTemplate;

    public AccountEventPublisher(KafkaTemplate<String, AccountEvent> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishAccountCreated(Account account) {
        AccountEvent event = AccountEvent.builder()
            .eventId(UUID.randomUUID().toString())
            .eventType("ACCOUNT_CREATED")
            .timestamp(OffsetDateTime.now())
            .aggregateId(account.getAccountNumber())
            .payload(account)
            .build();

        kafkaTemplate.send("account.events", account.getAccountNumber(), event);
    }
}
```

#### Consumidor Kafka
```java
package com.rawson.ledger.kafka;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class AccountEventConsumer {

    private final LedgerService ledgerService;

    public AccountEventConsumer(LedgerService ledgerService) {
        this.ledgerService = ledgerService;
    }

    @KafkaListener(topics = "account.events", groupId = "ledger-service-group")
    public void consumeAccountEvent(AccountEvent event) {
        switch (event.getEventType()) {
            case "ACCOUNT_CREATED":
                ledgerService.recordAccountCreation(event);
                break;
            case "ACCOUNT_UPDATED":
                ledgerService.recordAccountUpdate(event);
                break;
            default:
                log.warn("Unknown event type: {}", event.getEventType());
        }
    }
}
```

---

## 3. Apache Camel en el Proyecto

### 3.1 ¿Qué es Apache Camel?

**Apache Camel** es un framework de integración open-source que implementa Enterprise Integration Patterns (EIP). Proporciona:

- ✅ **Routing**: Enrutamiento de mensajes entre sistemas
- ✅ **Transformation**: Transformación de datos
- ✅ **Mediation**: Mediación entre protocolos
- ✅ **Error Handling**: Manejo robusto de errores
- ✅ **Saga Pattern**: Soporte nativo para transacciones distribuidas

### 3.2 Dependencias de Camel

#### build.gradle
```gradle
dependencies {
    // Apache Camel Spring Boot Starter
    implementation 'org.apache.camel.springboot:camel-spring-boot-starter:4.0.0'
    
    // Componente Kafka
    implementation 'org.apache.camel.springboot:camel-kafka-starter:4.0.0'
    
    // Soporte para Saga Pattern
    implementation 'org.apache.camel:camel-saga:4.0.0'
}
```

### 3.3 Rutas Camel en el Proyecto

#### 3.3.1 AccountCamelRoute.java

**Propósito:** Consumir eventos del topic Outbox (CDC) y republicarlos a topics específicos.

```java
package com.rawson.bank.camel;

import com.rawson.bank.service.AccountEventHandler;
import org.apache.camel.builder.RouteBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class AccountCamelRoute extends RouteBuilder {

    @Value("${kafka.bootstrap-servers:localhost:9092}")
    private String kafkaBrokers;

    @Value("${kafka.outbox.topic:dbserver1.bankdb.public.outbox}")
    private String outboxTopic;

    @Value("${kafka.account.events.topic:account.events}")
    private String accountEventsTopic;

    @Value("${kafka.dlq.topic:account.events.dlq}")
    private String dlqTopic;

    @Override
    public void configure() throws Exception {

        // Manejo global de errores
        onException(Exception.class)
            .maximumRedeliveries(3)      // Reintentar 3 veces
            .redeliveryDelay(5000)        // Esperar 5 segundos entre reintentos
            .handled(true)                 // Marcar como manejado
            .log("Error procesando mensaje, se enviará a DLQ: ${exception.message}")
            .toD("kafka:${header.dlqTopic}?brokers=" + kafkaBrokers);

        // Ruta principal: Consumir Outbox → Procesar → Republicar
        fromF("kafka:%s?brokers=%s&groupId=camel-outbox-group", 
              outboxTopic, kafkaBrokers)
            .routeId("consume-outbox-events")
            .setHeader("dlqTopic", simple(dlqTopic))
            .log("Outbox event recibido: ${body}")
            .to("bean:accountEventHandler?method=handle")  // Procesar con Spring Bean
            .toD("kafka:" + accountEventsTopic + "?brokers=" + kafkaBrokers)
            .log("Evento reenviado a topic " + accountEventsTopic);
    }
}
```

**Flujo de Datos:**
```
PostgreSQL Outbox Table (CDC)
    ↓
Debezium Connector
    ↓
Kafka Topic: dbserver1.bankdb.public.outbox
    ↓
Camel Route: consume-outbox-events
    ↓
AccountEventHandler (Business Logic)
    ↓
Kafka Topic: account.events
    ↓
Ledger Service (Consumer)
```

#### 3.3.2 TransferSagaRoute.java

**Propósito:** Implementar patrón Saga para transferencias con compensación automática.

```java
package com.rawson.bank.camel;

import org.apache.camel.builder.RouteBuilder;
import org.apache.camel.saga.InMemorySagaService;
import org.springframework.stereotype.Component;

@Component
public class TransferSagaRoute extends RouteBuilder {

    @Override
    public void configure() throws Exception {

        // Configurar servicio de Saga en memoria
        getContext().addService(new InMemorySagaService());

        // Ruta principal de Saga
        from("direct:startTransferSaga")
            .routeId("start-transfer-saga")
            .saga()  // Iniciar coordinación de Saga
            .log("Iniciando saga de transferencia: ${body}")
            .to("direct:debitAccount")    // Paso 1: Debitar
            .to("direct:creditAccount")   // Paso 2: Acreditar
            .log("Transferencia completada: ${body}")
        .end();

        // Paso 1: Debitar cuenta (con compensación)
        from("direct:debitAccount")
            .routeId("debit-account")
            .saga()
                .compensation("direct:compensateDebit")  // Definir ruta de compensación
            .end()
            .log("Debitar cuenta (simulado): ${body}");

        // Compensación: Revertir débito
        from("direct:compensateDebit")
            .routeId("compensate-debit")
            .log("Compensación: revertir débito para ${body}");

        // Paso 2: Acreditar cuenta
        from("direct:creditAccount")
            .routeId("credit-account")
            .log("Acreditar cuenta (simulado): ${body}");
    }
}
```

### 3.4 Componentes Camel Utilizados

| Componente | Descripción | Uso en Proyecto |
|------------|-------------|-----------------|
| **kafka** | Productor/Consumidor Kafka | Consumir outbox, publicar eventos |
| **direct** | Comunicación síncrona in-memory | Invocar rutas internas |
| **saga** | Patrón Saga nativo | Coordinación de transacciones distribuidas |
| **bean** | Invocar Spring Beans | Procesar lógica de negocio |
| **log** | Logging de mensajes | Debugging y auditoría |

### 3.5 Enterprise Integration Patterns (EIP) Implementados

#### Content-Based Router
```java
from("kafka:account.events")
    .choice()
        .when(simple("${body.eventType} == 'ACCOUNT_CREATED'"))
            .to("direct:handleAccountCreation")
        .when(simple("${body.eventType} == 'ACCOUNT_UPDATED'"))
            .to("direct:handleAccountUpdate")
        .otherwise()
            .to("direct:handleUnknownEvent")
    .end();
```

#### Dead Letter Channel
```java
errorHandler(deadLetterChannel("kafka:account.events.dlq")
    .maximumRedeliveries(3)
    .redeliveryDelay(5000)
    .logStackTrace(true));
```

#### Idempotent Consumer (Evitar duplicados)
```java
from("kafka:account.events")
    .idempotentConsumer(header("eventId"), 
                        MemoryIdempotentRepository.memoryIdempotentRepository())
    .to("bean:accountService?method=processEvent");
```

---

## 4. Patrón Saga

### 4.1 ¿Qué es el Patrón Saga?

**Saga** es un patrón de diseño para gestionar **transacciones distribuidas** en arquitecturas de microservicios. Dado que no podemos usar ACID tradicional (BEGIN/COMMIT/ROLLBACK), Saga proporciona **consistencia eventual** mediante:

- ✅ **Secuencia de transacciones locales**: Cada servicio ejecuta su transacción
- ✅ **Compensaciones**: Si falla un paso, se ejecutan acciones de compensación
- ✅ **Coordinación**: Orquestador o coreografía

### 4.2 Tipos de Saga

#### Saga Orquestada (Orchestration)
```
┌──────────────────┐
│  Orchestrator    │  ← Controla el flujo
└────────┬─────────┘
         │
    ┌────┴─────┬─────────┬─────────┐
    ▼          ▼         ▼         ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│Service1│ │Service2│ │Service3│ │Service4│
└────────┘ └────────┘ └────────┘ └────────┘
```

**Ventajas:**
- ✅ Flujo centralizado y fácil de entender
- ✅ Control explícito de compensaciones
- ✅ Más fácil de depurar

**Desventajas:**
- ❌ Acoplamiento con el orquestador
- ❌ Punto único de fallo

#### Saga Coreografiada (Choreography)
```
┌────────┐   Event   ┌────────┐   Event   ┌────────┐
│Service1├──────────>│Service2├──────────>│Service3│
└────────┘           └────────┘           └────────┘
     ▲                    │                    │
     └────────────────────┴────────────────────┘
           Events de Compensación
```

**Ventajas:**
- ✅ Desacoplamiento total
- ✅ Sin punto único de fallo

**Desventajas:**
- ❌ Flujo difuso, difícil de rastrear
- ❌ Debugging complejo

### 4.3 Saga en el Proyecto (Orquestada)

Usamos **Saga Orquestada** con `orchestrator-service` como coordinador.

#### Estado de Saga

```java
package com.rawson.orchestrator.domain;

@Entity
@Table(name = "transfer_sagas")
@Getter
@Setter
@Builder
public class TransferSaga {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String sagaId;

    private String fromAccount;
    private String toAccount;
    private Double amount;

    @Column(nullable = false)
    private String status;  // STARTED, DEBITED, COMPLETED, FAILED, COMPENSATED

    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
```

#### OrchestratorService.java

```java
package com.rawson.orchestrator.service;

import com.rawson.orchestrator.domain.TransferSaga;
import com.rawson.orchestrator.dto.TransferRequest;
import com.rawson.orchestrator.repository.TransferSagaRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.time.OffsetDateTime;
import java.util.UUID;

@Service
public class OrchestratorService {

    private final TransferSagaRepository repo;
    private final WebClient webClient;

    public OrchestratorService(TransferSagaRepository repo, WebClient.Builder webClientBuilder) {
        this.repo = repo;
        this.webClient = webClientBuilder.build();
    }

    @CircuitBreaker(name = "orchestratorCB", fallbackMethod = "fallbackStartTransfer")
    public TransferSaga startTransfer(TransferRequest req) {
        String sagaId = req.getSagaId() == null ? UUID.randomUUID().toString() : req.getSagaId();

        // Crear Saga
        TransferSaga saga = TransferSaga.builder()
                .sagaId(sagaId)
                .fromAccount(req.getFromAccount())
                .toAccount(req.getToAccount())
                .amount(req.getAmount())
                .status("STARTED")
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        saga = repo.save(saga);

        try {
            // PASO 1: Debitar cuenta origen
            webClient.post()
                    .uri("http://backend-bank-system/api/v1/accounts/debit")
                    .bodyValue(buildOperationDTO(req))
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block();

            saga.setStatus("DEBITED");
            saga.setUpdatedAt(OffsetDateTime.now());
            repo.save(saga);

            // PASO 2: Acreditar cuenta destino
            webClient.post()
                    .uri("http://backend-bank-system/api/v1/accounts/credit")
                    .bodyValue(buildOperationDTO(req))
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block();

            saga.setStatus("COMPLETED");
            saga.setUpdatedAt(OffsetDateTime.now());
            repo.save(saga);

        } catch (Exception ex) {
            // COMPENSACIÓN: Revertir débito
            compensate(saga, req);
            throw ex;
        }

        return saga;
    }

    private void compensate(TransferSaga saga, TransferRequest req) {
        if ("DEBITED".equals(saga.getStatus())) {
            // Revertir débito
            webClient.post()
                    .uri("http://backend-bank-system/api/v1/accounts/compensate")
                    .bodyValue(buildOperationDTO(req))
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block();

            saga.setStatus("COMPENSATED");
            saga.setUpdatedAt(OffsetDateTime.now());
            repo.save(saga);
        }
    }

    public TransferSaga fallbackStartTransfer(TransferRequest req, Throwable ex) {
        TransferSaga saga = TransferSaga.builder()
                .sagaId(req.getSagaId())
                .fromAccount(req.getFromAccount())
                .toAccount(req.getToAccount())
                .amount(req.getAmount())
                .status("FAILED")
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();
        repo.save(saga);
        return saga;
    }

    private AccountOperationDTO buildOperationDTO(TransferRequest req) {
        AccountOperationDTO dto = new AccountOperationDTO();
        dto.setAccountNumber(req.getFromAccount());
        dto.setAmount(req.getAmount());
        dto.setSagaId(req.getSagaId());
        return dto;
    }
}
```

### 4.4 Máquina de Estados de Saga

```
     START
       │
       ▼
   [STARTED] ──┐
       │       │
       │ Debit │ Error
       ▼       │
  [DEBITED]◄───┘
       │       │
       │Credit │ Error → Compensate
       ▼       │             │
 [COMPLETED]   └─────────────▼
                        [COMPENSATED]
                             │
                             ▼
                         [FAILED]
```

### 4.5 Camel Saga vs Orquestador Manual

| Aspecto | Camel Saga | Orquestador Manual |
|---------|------------|--------------------|
| **Coordinación** | Automática | Manual (código explícito) |
| **Compensación** | Declarativa (.compensation()) | Programática (try/catch) |
| **Estado** | Gestionado por Camel | Gestionado en base de datos |
| **Complejidad** | Baja | Media-Alta |
| **Uso en Proyecto** | TransferSagaRoute (demo) | OrchestratorService (producción) |

---

## 5. Integración Completa

### 5.1 Flujo End-to-End: Transferencia con Saga

```
┌──────────┐
│  Cliente │
└────┬─────┘
     │ POST /api/v1/transfer/start
     ▼
┌─────────────────────┐
│ OrchestratorService │
└──────────┬──────────┘
           │
           │ 1. Crear Saga (STARTED)
           │    ↓ Save to DB
           │
           │ 2. POST /api/v1/accounts/debit
           ▼
┌──────────────────────────┐
│ Backend-Bank-System      │
│  AccountOperationsCtrl   │
└──────────┬───────────────┘
           │
           │ Debit Account
           │ Update Balance
           ▼
       PostgreSQL
           │
           │ 3. Return OK
           ▼
┌─────────────────────┐
│ OrchestratorService │  → Update Saga (DEBITED)
└──────────┬──────────┘
           │
           │ 4. POST /api/v1/accounts/credit
           ▼
┌──────────────────────────┐
│ Backend-Bank-System      │
│  AccountOperationsCtrl   │
└──────────┬───────────────┘
           │
           │ Credit Account
           │ Update Balance
           ▼
       PostgreSQL
           │
           │ 5. Return OK
           ▼
┌─────────────────────┐
│ OrchestratorService │  → Update Saga (COMPLETED)
└──────────┬──────────┘
           │
           │ 6. Publish Event to Kafka
           ▼
┌────────────────────┐
│  Kafka: transfer-  │
│  events            │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│  Ledger Service    │  → Record in Ledger
└────────────────────┘
```

### 5.2 Flujo con Compensación (Error en Crédito)

```
1. STARTED → Debit OK → DEBITED
2. DEBITED → Credit FAIL → Exception
3. Exception → Compensate (Revert Debit)
4. COMPENSATED → FAILED
```

### 5.3 Patrón Outbox con Camel

**Problema:** Garantizar que eventos se publiquen a Kafka solo si la transacción en DB tiene éxito.

**Solución:** Outbox Pattern + Change Data Capture (CDC)

```
┌──────────────────────────────────────────────────────────┐
│                  Backend-Bank-System                      │
│                                                           │
│  1. Transaction {                                        │
│       INSERT INTO accounts (...)                         │
│       INSERT INTO outbox (event_type, payload, ...)      │
│     }                                                     │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
              ┌────────────────┐
              │  PostgreSQL    │
              │                │
              │  Table: outbox │
              └────────┬───────┘
                       │
                       │ CDC (Change Data Capture)
                       ▼
              ┌────────────────┐
              │  Debezium      │
              │  Connector     │
              └────────┬───────┘
                       │
                       │ Publish Change
                       ▼
              ┌────────────────────┐
              │  Kafka Topic:      │
              │  dbserver1.outbox  │
              └────────┬───────────┘
                       │
                       │ Consume
                       ▼
              ┌──────────────────────┐
              │  Camel Route:        │
              │  AccountCamelRoute   │
              └────────┬─────────────┘
                       │
                       │ Process & Republish
                       ▼
              ┌────────────────────┐
              │  Kafka Topic:      │
              │  account.events    │
              └────────────────────┘
```

---

## 6. Ejemplos Prácticos

### 6.1 Crear una Nueva Ruta Camel

#### Ejemplo: Ruta para procesar eventos de transferencia

```java
package com.rawson.ledger.camel;

import org.apache.camel.builder.RouteBuilder;
import org.springframework.stereotype.Component;

@Component
public class TransferEventRoute extends RouteBuilder {

    @Override
    public void configure() throws Exception {

        // Manejo de errores
        onException(Exception.class)
            .maximumRedeliveries(3)
            .redeliveryDelay(5000)
            .handled(true)
            .log("Error: ${exception.message}")
            .to("kafka:ledger.events.dlq");

        // Ruta principal
        from("kafka:transfer.events?groupId=ledger-transfer-group")
            .routeId("process-transfer-events")
            .log("Transfer event received: ${body}")
            .choice()
                .when(simple("${body.status} == 'COMPLETED'"))
                    .to("bean:ledgerService?method=recordTransfer")
                .when(simple("${body.status} == 'FAILED'"))
                    .to("bean:alertService?method=notifyFailedTransfer")
            .end()
            .log("Transfer event processed successfully");
    }
}
```

### 6.2 Implementar Saga con Camel

#### Ejemplo: Saga para proceso de aprobación de préstamo

```java
package com.rawson.loan.camel;

import org.apache.camel.builder.RouteBuilder;
import org.apache.camel.saga.InMemorySagaService;
import org.springframework.stereotype.Component;

@Component
public class LoanApprovalSaga extends RouteBuilder {

    @Override
    public void configure() throws Exception {

        getContext().addService(new InMemorySagaService());

        from("direct:startLoanApproval")
            .routeId("loan-approval-saga")
            .saga()
            .log("Starting loan approval for: ${body}")
            .to("direct:checkCreditScore")
            .to("direct:reserveFunds")
            .to("direct:createLoanAccount")
            .log("Loan approved: ${body}")
        .end();

        from("direct:checkCreditScore")
            .saga()
                .compensation("direct:undoCreditCheck")
            .end()
            .to("bean:creditService?method=checkScore")
            .log("Credit score checked");

        from("direct:reserveFunds")
            .saga()
                .compensation("direct:releaseFunds")
            .end()
            .to("bean:fundService?method=reserve")
            .log("Funds reserved");

        from("direct:createLoanAccount")
            .saga()
                .compensation("direct:deleteLoanAccount")
            .end()
            .to("bean:loanService?method=createAccount")
            .log("Loan account created");

        // Compensaciones
        from("direct:undoCreditCheck")
            .log("Compensation: Undo credit check");

        from("direct:releaseFunds")
            .to("bean:fundService?method=release")
            .log("Compensation: Release funds");

        from("direct:deleteLoanAccount")
            .to("bean:loanService?method=deleteAccount")
            .log("Compensation: Delete loan account");
    }
}
```

### 6.3 Testing con Kafka y Camel

#### Test de Ruta Camel
```java
package com.rawson.bank.camel;

import org.apache.camel.CamelContext;
import org.apache.camel.ProducerTemplate;
import org.apache.camel.test.spring.junit5.CamelSpringBootTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@CamelSpringBootTest
@SpringBootTest
public class AccountCamelRouteTest {

    @Autowired
    private CamelContext camelContext;

    @Autowired
    private ProducerTemplate producerTemplate;

    @Test
    public void testOutboxEventProcessing() {
        String eventJson = "{\"eventType\":\"ACCOUNT_CREATED\",\"payload\":{...}}";
        
        producerTemplate.sendBody("direct:startOutboxProcessing", eventJson);
        
        // Verificar que se publicó a Kafka
        // Assertions...
    }
}
```

---

## 7. Configuración y Troubleshooting

### 7.1 Configuración de Resilience4j para Saga

#### application.yml
```yaml
resilience4j:
  circuitbreaker:
    instances:
      orchestratorCB:
        register-health-indicator: true
        sliding-window-size: 10
        minimum-number-of-calls: 5
        permitted-number-of-calls-in-half-open-state: 3
        automatic-transition-from-open-to-half-open-enabled: true
        wait-duration-in-open-state: 10s
        failure-rate-threshold: 50
        event-consumer-buffer-size: 10
```

### 7.2 Monitoreo de Kafka

#### Ver Logs de Camel
```bash
docker logs -f backend-bank-system | grep "Camel"
```

#### Ver Topics y Mensajes en Kafka UI
```
1. Abrir http://localhost:8090
2. Ir a "Topics"
3. Seleccionar "account.events"
4. Ver mensajes en tiempo real
```

### 7.3 Troubleshooting Común

#### Error: Kafka no conecta
```bash
# Verificar que Kafka esté corriendo
docker ps | grep kafka

# Ver logs de Kafka
docker logs kafka-bank

# Verificar conectividad desde contenedor
docker exec -it backend-bank-system bash
telnet kafka 29092
```

#### Error: Saga no compensa
```java
// Asegurarse de que InMemorySagaService esté registrado
getContext().addService(new InMemorySagaService());

// Verificar que las compensaciones estén definidas
.saga()
    .compensation("direct:compensate")  // ← Debe estar presente
.end()
```

#### Error: Mensajes duplicados en Kafka
```java
// Implementar Idempotent Consumer
from("kafka:account.events")
    .idempotentConsumer(
        header("eventId"),
        MemoryIdempotentRepository.memoryIdempotentRepository()
    )
    .to("bean:accountService");
```

### 7.4 Mejores Prácticas

#### 1. Siempre usar Dead Letter Queue (DLQ)
```java
onException(Exception.class)
    .maximumRedeliveries(3)
    .handled(true)
    .to("kafka:my-topic.dlq");
```

#### 2. Idempotencia en operaciones
```java
@Transactional
public void processEvent(AccountEvent event) {
    if (eventRepository.existsByEventId(event.getEventId())) {
        log.warn("Event already processed: {}", event.getEventId());
        return; // Evitar duplicados
    }
    // Procesar evento
    eventRepository.save(event);
}
```

#### 3. Timeouts en Saga
```java
@CircuitBreaker(name = "orchestratorCB")
public TransferSaga startTransfer(TransferRequest req) {
    // Configurar timeout
    webClient.post()
        .uri("http://backend/api/v1/accounts/debit")
        .bodyValue(req)
        .retrieve()
        .bodyToMono(Void.class)
        .timeout(Duration.ofSeconds(5))  // ← Timeout explícito
        .block();
}
```

#### 4. Logging detallado en Camel
```java
from("kafka:account.events")
    .log("Received: ${body}")
    .log("Headers: ${headers}")
    .to("bean:service")
    .log("Processed successfully");
```

---

## Conclusión

Este documento proporciona una guía completa sobre:
- ✅ Configuración y uso de **Apache Kafka** como message broker
- ✅ Implementación de rutas con **Apache Camel** para integración
- ✅ Aplicación del **Patrón Saga** para transacciones distribuidas
- ✅ Ejemplos prácticos de implementación
- ✅ Troubleshooting y mejores prácticas

Para más información:
- Apache Kafka: https://kafka.apache.org/documentation/
- Apache Camel: https://camel.apache.org/manual/
- Saga Pattern: https://microservices.io/patterns/data/saga.html

---

**Versión:** 1.0  
**Fecha:** Diciembre 2025  
**Autor:** Sistema Bancario Distribuido Team
