package com.rawson.bank.controller;

import com.rawson.bank.domain.Account;
import com.rawson.bank.service.AccountService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/*
 Controlador REST bÃ¡sico para Accounts.
*/
@RestController
@RequestMapping("/api/v1/accounts")
public class AccountController {

    private final AccountService svc;

    public AccountController(AccountService svc) {
        this.svc = svc;
    }

    @GetMapping
    public ResponseEntity<List<Account>> list() {
        return ResponseEntity.ok(svc.findAll());
    }

    @PostMapping
    public ResponseEntity<Account> create(@RequestBody Account account) {
        Account created = svc.create(account);
        return ResponseEntity.ok(created);
    }
}
