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

## Compilación con Gradle

```bash
# Compilar todos los servicios
./gradlew build

# Compilar sin ejecutar tests
./gradlew build -x test

# Compilar un servicio específico
./gradlew :backend-bank-system:build
```

## Ejecución con Docker Compose

```bash
# Construir y levantar todos los servicios
docker compose up --build

# Levantar en segundo plano
docker compose up --build -d

# Ver logs
docker compose logs -f

# Detener servicios
docker compose down
```

## Puertos de los servicios

| Servicio | Puerto |
|----------|--------|
| Frontend | 3000 |
| Keycloak | 8080 |
| API Gateway | 8082 |
| Backend | 8085 |
| Schema Registry | 8084 |
| Service Registry (Eureka) | 8761 |
| Orchestrator | 8090 |
| Ledger | 8091 |
| Kafka Connect | 8083 |
| Kafka | 9092 / 29092 |
| PostgreSQL | 5432 |
| Zookeeper | 2181 |

## Registrar conector Debezium

Una vez connect esté arriba:
```bash
curl -X POST -H "Content-Type: application/json" \
  --data @backend-bank-system/debezium-connectors/outbox-connector.json \
  http://localhost:8083/connectors
```

## Probar endpoints

### Crear cuenta con outbox
```bash
curl -X POST http://localhost:8085/api/v1/accounts/outbox \
  -H "Content-Type: application/json" \
  -d '{"accountNumber":"ACC-1","currency":"PEN","balance":1000.0,"ownerId":"CLIENT-1"}'
```

### Iniciar transferencia vía Gateway
```bash
curl -X POST http://localhost:8082/api/v1/transfer/start \
  -H "Content-Type: application/json" \
  -d '{"fromAccount":"ACC-1","toAccount":"ACC-2","amount":100.0}'
```

## CI/CD

El proyecto incluye GitHub Actions para integración continua. Ver `.github/workflows/ci.yml`.

Para ejecutar localmente lo mismo que hace el CI:
```bash
./gradlew build
```
