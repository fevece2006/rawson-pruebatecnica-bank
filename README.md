# Rawson Prueba Técnica - Core Bancario

Monorepo para un Core Bancario demo con arquitectura de microservicios.

## Servicios

- **backend-bank-system**: Servicio principal de cuentas (Spring Boot 3, Java 21)
- **frontend-bank-system**: Interfaz de usuario (React)
- **service-registry**: Eureka Service Registry
- **api-gateway**: Spring Cloud Gateway
- **orchestrator-service**: Saga Orchestrator para transferencias
- **ledger-service**: Event Sourcing consumer para asientos contables

## Infraestructura

- Kafka + Zookeeper
- Schema Registry
- Debezium Connect
- PostgreSQL
- Keycloak

## Requisitos

- Java 21
- Docker y Docker Compose
- Node.js 18+ (para frontend)

## Construcción Local

### Build con Gradle

```bash
# Dar permisos de ejecución al wrapper
chmod +x gradlew

# Compilar todos los servicios
./gradlew clean build

# Compilar sin ejecutar tests
./gradlew clean build -x test

# Compilar un servicio específico
./gradlew :backend-bank-system:bootJar
```

### Ejecutar Tests

```bash
# Ejecutar todos los tests
./gradlew test

# Ejecutar tests de un servicio específico
./gradlew :backend-bank-system:test
```

## Ejecución con Docker Compose

```bash
# Construir imágenes y levantar todos los servicios
docker-compose up --build

# Levantar en segundo plano
docker-compose up --build -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v
```

## Puertos

| Servicio | Puerto |
|----------|--------|
| Frontend | 3000 |
| API Gateway | 8082 |
| Backend Bank System | 8084 |
| Orchestrator | 8090 |
| Ledger | 8091 |
| Service Registry (Eureka) | 8761 |
| Keycloak | 8080 |
| Schema Registry | 8081 |
| Kafka | 9092, 29092 |
| PostgreSQL | 5432 |
| Debezium Connect | 8083 |
| Zookeeper | 2181 |

## Registrar Conector Debezium

Una vez que el servicio de Connect esté arriba:

```bash
curl -X POST -H "Content-Type: application/json" \
  --data @backend-bank-system/debezium-connectors/outbox-connector.json \
  http://localhost:8083/connectors
```

## Endpoints de Prueba

### Crear cuenta con outbox:
```bash
POST http://localhost:8084/api/v1/accounts/outbox
Content-Type: application/json

{
  "accountNumber": "ACC-1",
  "currency": "PEN",
  "balance": 1000.0,
  "ownerId": "CLIENT-1"
}
```

### Iniciar transferencia vía Gateway:
```bash
POST http://localhost:8082/api/v1/transfer/start
Content-Type: application/json

{
  "fromAccount": "ACC-1",
  "toAccount": "ACC-2",
  "amount": 100.0
}
```

### Health Checks:
```bash
# Service Registry
curl http://localhost:8761/actuator/health

# API Gateway
curl http://localhost:8082/actuator/health

# Backend
curl http://localhost:8084/actuator/health
```

## CI/CD

El proyecto incluye un workflow de GitHub Actions (`.github/workflows/ci.yml`) que:

1. Compila el proyecto con Java 21
2. Ejecuta los tests
3. Genera los artefactos (JARs)

El pipeline se ejecuta en:
- Push a `main` o `develop`
- Pull requests a `main` o `develop`

## Estructura del Proyecto

```
.
├── api-gateway/              # Spring Cloud Gateway
├── backend-bank-system/      # Servicio principal
├── frontend-bank-system/     # React UI
├── ledger-service/           # Event sourcing consumer
├── orchestrator-service/     # Saga orchestrator
├── service-registry/         # Eureka server
├── docker-compose.yml        # Orquestación de servicios
├── build.gradle.kts          # Configuración Gradle raíz
├── settings.gradle.kts       # Configuración multi-proyecto
└── .github/workflows/        # CI/CD pipelines
```

## Tecnologías

- **Backend**: Spring Boot 3.2, Java 21, Gradle
- **Frontend**: React, Node.js 18
- **Messaging**: Apache Kafka, Debezium CDC
- **Service Discovery**: Netflix Eureka
- **Gateway**: Spring Cloud Gateway
- **Database**: PostgreSQL
- **Auth**: Keycloak
- **Container**: Docker, Docker Compose
