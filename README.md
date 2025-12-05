# Rawson-pruebatecnica-bank

Esqueleto monorepo para un Core Bancario demo con:
- backend-bank-system (Spring Boot 3, Java 21)
- frontend-bank-system (React)
- service-registry (Eureka)
- api-gateway (Spring Cloud Gateway)
- orchestrator-service (Saga Orchestrator)
- ledger-service (Event Sourcing consumer)
- docker-compose para Kafka, Zookeeper, Schema Registry, Debezium Connect, Postgres, Keycloak y microservicios

Levantar demo:
  docker compose up --build

Registrar conector Debezium (una vez connect estÃ© arriba):
  curl -X POST -H "Content-Type: application/json" --data @backend-bank-system/debezium-connectors/outbox-connector.json http://localhost:8083/connectors

Probar endpoints:
- Crear cuenta con outbox:
  POST http://localhost:8081/api/v1/accounts/outbox
  Body JSON: {"accountNumber":"ACC-1","currency":"PEN","balance":1000.0,"ownerId":"CLIENT-1"}

- Iniciar transferencia vÃ­a Gateway:
  POST http://localhost:8082/api/v1/transfer/start
  Body JSON: {"fromAccount":"ACC-1","toAccount":"ACC-2","amount":100.0}
