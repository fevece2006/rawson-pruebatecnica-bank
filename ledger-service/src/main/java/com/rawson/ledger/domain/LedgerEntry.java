package com.rawson.ledger.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

/*
 Entidad LedgerEntry: guarda eventos crudos (simplified event sourcing store).
*/
@Entity
@Table(name = "ledger_entries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LedgerEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String eventId;

    @Lob
    @Column(columnDefinition = "text")
    private String payload;

    private OffsetDateTime createdAt;
}
