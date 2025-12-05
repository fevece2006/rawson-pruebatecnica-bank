package com.rawson.ledger.service;

import com.rawson.ledger.repository.LedgerEntryRepository;
import com.rawson.ledger.domain.LedgerEntry;
import org.springframework.stereotype.Service;
import java.time.OffsetDateTime;
import java.util.UUID;

/*
 Servicio de ledger simplificado: guarda el payload del evento.
*/
@Service
public class LedgerService {

    private final LedgerEntryRepository repo;

    public LedgerService(LedgerEntryRepository repo) {
        this.repo = repo;
    }

    public void processTransferEvent(String jsonPayload) {
        LedgerEntry entry = LedgerEntry.builder()
                .eventId(UUID.randomUUID().toString())
                .payload(jsonPayload)
                .createdAt(OffsetDateTime.now())
                .build();
        repo.save(entry);
    }
}
