# DOCUMENTACIÃ“N TÃ‰CNICA (Resumida)

Arquitectura incluida:
- Outbox pattern (tabla outbox) + Debezium Kafka Connect para publicar events de DB a Kafka.
- Apache Camel para enrutar eventos Kafka y manejo de errores (retries + DLQ).
- Saga Orchestrator (orchestrator-service) que persiste estado de la saga y usa Circuit Breaker (Resilience4j).
- API Gateway (Spring Cloud Gateway) y Service Registry (Eureka).
- Ledger service que consume eventos (transfer.events) y guarda asientos (event sourcing simplificado).

Temas importantes:
- Idempotencia: asegurar consumidores capaces de deduplicar eventos.
- DLQ: mensajes fallidos van a topics de DLQ para anÃ¡lisis.
- Seguridad: integrar Keycloak en Gateway para proteger APIs.
- ProducciÃ³n: usar SagaService persistente o almacenar estado en DB de orchestrator.

Conector Debezium (ejemplo):
backend-bank-system/debezium-connectors/outbox-connector.json

Levantar demo:
  docker compose up --build
