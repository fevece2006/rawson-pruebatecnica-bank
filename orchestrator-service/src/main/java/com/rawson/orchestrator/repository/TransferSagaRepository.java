package com.rawson.orchestrator.repository;

import com.rawson.orchestrator.domain.TransferSaga;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TransferSagaRepository extends JpaRepository<TransferSaga, Long> {
    Optional<TransferSaga> findBySagaId(String sagaId);
}
