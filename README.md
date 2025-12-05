# Rawson-pruebatecnica-bank

Esqueleto monorepo para un Core Bancario demo con:
- backend-bank-system (Spring Boot 3, Java 21)
- frontend-bank-system (React)
- service-registry (Eureka)
- api-gateway (Spring Cloud Gateway)
- orchestrator-service (Saga Orchestrator)
- ledger-service (Event Sourcing consumer)
- docker-compose para Kafka, Zookeeper, Schema Registry, Debezium Connect, Postgres, Keycloak y microservicios

## Requisitos

- Java 21
- Docker y Docker Compose
- Gradle (incluido via wrapper)

## Build local

Compilar todos los servicios Java:

```bash
./gradlew clean build
```

Compilar un servicio específico:

```bash
./gradlew :backend-bank-system:build
./gradlew :ledger-service:build
./gradlew :orchestrator-service:build
./gradlew :service-registry:build
./gradlew :api-gateway:build
```

## Levantar con Docker Compose

```bash
docker-compose up --build
```

Este comando compilará y levantará todos los servicios.

## Servicios y puertos

| Servicio         | Puerto |
|-----------------|--------|
| service-registry | 8761   |
| api-gateway      | 8085   |
| backend          | 8081   |
| orchestrator     | 8090   |
| ledger           | 8091   |
| frontend         | 3000   |
| keycloak         | 8080   |
| postgres         | 5432   |
| kafka            | 9092   |
| schema-registry  | 8084   |

## Health checks

Todos los servicios Java exponen endpoints de actuator:

```bash
curl http://localhost:8761/actuator/health
curl http://localhost:8085/actuator/health
curl http://localhost:8081/actuator/health
```

## Registrar conector Debezium

Una vez que el servicio connect esté arriba:

```bash
curl -X POST -H "Content-Type: application/json" \
  --data @backend-bank-system/debezium-connectors/outbox-connector.json \
  http://localhost:8083/connectors
```

## Probar endpoints

Crear cuenta con outbox:

```bash
curl -X POST http://localhost:8081/api/v1/accounts/outbox \
  -H "Content-Type: application/json" \
  -d '{"accountNumber":"ACC-1","currency":"PEN","balance":1000.0,"ownerId":"CLIENT-1"}'
```

Iniciar transferencia vía Gateway:

```bash
curl -X POST http://localhost:8085/api/v1/transfer/start \
  -H "Content-Type: application/json" \
  -d '{"fromAccount":"ACC-1","toAccount":"ACC-2","amount":100.0}'
```
