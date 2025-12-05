package com.rawson.bank.repository;

import com.rawson.bank.domain.OutboxEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

/*
 Repositorio JPA para OutboxEvent.
*/
public interface OutboxRepository extends JpaRepository<OutboxEvent, Long> {
    List<OutboxEvent> findByProcessedFalse();
}
