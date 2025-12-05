package com.rawson.bank.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rawson.bank.domain.Account;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/*
 Bean que maneja eventos de cuenta consumidos (via Camel).
*/
@Component("accountEventHandler")
@Slf4j
public class AccountEventHandler {

    private final ObjectMapper objectMapper;

    public AccountEventHandler(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public void handle(String body) {
        try {
            Account evt = objectMapper.readValue(body, Account.class);
            log.info("Procesando evento de cuenta para accountNumber={}", evt.getAccountNumber());
            // Aqui se puede enriquecer, notificar, crear ledger, etc.
        } catch (Exception e) {
            log.error("Error procesando evento de cuenta: {}", e.getMessage(), e);
        }
    }
}
