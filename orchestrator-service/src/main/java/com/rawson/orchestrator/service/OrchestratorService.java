package com.rawson.orchestrator.service;

import com.rawson.orchestrator.domain.TransferSaga;
import com.rawson.orchestrator.dto.TransferRequest;
import com.rawson.orchestrator.repository.TransferSagaRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.time.OffsetDateTime;
import java.util.UUID;

/*
 Servicio que orquesta la Saga de transferencia.
 Llamadas a servicios participantes protegidas por Circuit Breaker.
*/
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

        // Debitar cuenta origen
        webClient.post()
                .uri("http://backend/api/v1/accounts/debit")
                .bodyValue(req)
                .retrieve()
                .bodyToMono(Void.class)
                .block();

        saga.setStatus("DEBITED");
        saga.setUpdatedAt(OffsetDateTime.now());
        repo.save(saga);

        // Acreditar cuenta destino
        webClient.post()
                .uri("http://backend/api/v1/accounts/credit")
                .bodyValue(req)
                .retrieve()
                .bodyToMono(Void.class)
                .block();

        saga.setStatus("COMPLETED");
        saga.setUpdatedAt(OffsetDateTime.now());
        repo.save(saga);

        return saga;
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
}
