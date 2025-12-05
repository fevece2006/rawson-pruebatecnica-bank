package com.rawson.ledger.kafka;

import com.rawson.ledger.service.LedgerService;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/*
 Consumidor Kafka de eventos de transferencia.
*/
@Component
public class TransferEventsConsumer {

    private final LedgerService ledgerService;

    public TransferEventsConsumer(LedgerService ledgerService) {
        this.ledgerService = ledgerService;
    }

    @KafkaListener(topics = "${kafka.transfer.events.topic:transfer.events}", groupId = "ledger-group")
    public void onTransferEvent(String message) {
        ledgerService.processTransferEvent(message);
    }
}
