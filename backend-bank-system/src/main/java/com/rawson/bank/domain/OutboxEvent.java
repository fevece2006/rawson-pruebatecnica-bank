package com.rawson.bank.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

/*
 Entidad Outbox: patron Outbox para publicacion transaccional.
*/
@Entity
@Table(name = "outbox")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OutboxEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String aggregateType;

    @Column(nullable = false)
    private String aggregateId;

    @Column(nullable = false)
    private String eventType;

    @Lob
    @Column(columnDefinition = "text", nullable = false)
    private String payload;

    @Column(nullable = false)
    private OffsetDateTime createdAt;

    @Column(nullable = false)
    private boolean processed;
}
