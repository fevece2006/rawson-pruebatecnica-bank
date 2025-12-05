package com.rawson.bank.controller;

import com.rawson.bank.domain.Account;
import com.rawson.bank.service.AccountService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/*
 Controlador que crea account + outbox en la misma transacciÃ³n.
 POST /api/v1/accounts/outbox
*/
@RestController
@RequestMapping("/api/v1/accounts")
public class AccountIntegrationController {

    private final AccountService svc;

    public AccountIntegrationController(AccountService svc) {
        this.svc = svc;
    }

    @PostMapping("/outbox")
    public ResponseEntity<Account> createWithOutbox(@RequestBody Account account) {
        Account created = svc.createWithOutbox(account);
        return ResponseEntity.ok(created);
    }
}
