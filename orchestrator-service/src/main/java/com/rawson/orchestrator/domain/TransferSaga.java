package com.rawson.orchestrator.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

/*
 Entidad que persiste el estado de una saga de transferencia.
*/
@Entity
@Table(name = "transfer_saga")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransferSaga {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String sagaId;
    private String fromAccount;
    private String toAccount;
    private Double amount;
    private String status;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
