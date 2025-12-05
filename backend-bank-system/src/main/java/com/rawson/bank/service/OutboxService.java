package com.rawson.bank.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rawson.bank.domain.OutboxEvent;
import com.rawson.bank.repository.OutboxRepository;
import org.springframework.stereotype.Service;
import java.time.OffsetDateTime;

/*
 Servicio que escribe eventos en la tabla outbox dentro de la misma transacciÃ³n.
*/
@Service
public class OutboxService {

    private final OutboxRepository repo;
    private final ObjectMapper objectMapper;

    public OutboxService(OutboxRepository repo, ObjectMapper objectMapper) {
        this.repo = repo;
        this.objectMapper = objectMapper;
    }

    public void publishEventTransactional(String aggregateType, String aggregateId, String eventType, Object payload) {
        try {
            String json = objectMapper.writeValueAsString(payload);
            OutboxEvent out = OutboxEvent.builder()
                    .aggregateType(aggregateType)
                    .aggregateId(aggregateId)
                    .eventType(eventType)
                    .payload(json)
                    .createdAt(OffsetDateTime.now())
                    .processed(false)
                    .build();
            repo.save(out);
        } catch (Exception e) {
            throw new RuntimeException("Error serializando evento outbox", e);
        }
    }
}
