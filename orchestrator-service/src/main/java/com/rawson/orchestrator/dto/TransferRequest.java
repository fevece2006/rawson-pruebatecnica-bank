package com.rawson.orchestrator.dto;

import lombok.*;

/*
 DTO para solicitudes de transferencia.
*/
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransferRequest {
    private String sagaId;
    private String fromAccount;
    private String toAccount;
    private Double amount;
}
