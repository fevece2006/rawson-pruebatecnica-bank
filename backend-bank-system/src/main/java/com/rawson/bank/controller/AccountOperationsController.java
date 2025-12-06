package com.rawson.bank.controller;

import com.rawson.bank.domain.Account;
import com.rawson.bank.repository.AccountRepository;
import com.rawson.bank.service.AccountService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/*
 Endpoints que el Orchestrator usarÃ¡: debit, credit, compensate (stubs).
*/
@RestController
@RequestMapping("/api/v1/accounts")
public class AccountOperationsController {

    private final AccountService accountService;
    private final AccountRepository accountRepository;

    public AccountOperationsController(AccountService accountService, AccountRepository accountRepository) {
        this.accountService = accountService;
        this.accountRepository = accountRepository;
    }

    @PostMapping("/debit")
    public ResponseEntity<Void> debit(@RequestBody AccountOperationDTO dto) {
        accountRepository.findByAccountNumber(dto.getAccountNumber()).ifPresent(acc -> {
            acc.setBalance(acc.getBalance() - dto.getAmount());
            accountRepository.save(acc);
        });
        return ResponseEntity.ok().build();
    }

    @PostMapping("/credit")
    public ResponseEntity<Void> credit(@RequestBody AccountOperationDTO dto) {
        accountRepository.findByAccountNumber(dto.getAccountNumber()).ifPresent(acc -> {
            acc.setBalance(acc.getBalance() + dto.getAmount());
            accountRepository.save(acc);
        });
        return ResponseEntity.ok().build();
    }

    @PostMapping("/compensate")
    public ResponseEntity<Void> compensate(@RequestBody AccountOperationDTO dto) {
        accountRepository.findByAccountNumber(dto.getAccountNumber()).ifPresent(acc -> {
            acc.setBalance(acc.getBalance() + dto.getAmount());
            accountRepository.save(acc);
        });
        return ResponseEntity.ok().build();
    }

    public static class AccountOperationDTO {
        private String accountNumber;
        private Double amount;
        private String sagaId;
        public String getAccountNumber() { return accountNumber; }
        public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }
        public Double getAmount() { return amount; }
        public void setAmount(Double amount) { this.amount = amount; }
        public String getSagaId() { return sagaId; }
        public void setSagaId(String sagaId) { this.sagaId = sagaId; }
    }
}
