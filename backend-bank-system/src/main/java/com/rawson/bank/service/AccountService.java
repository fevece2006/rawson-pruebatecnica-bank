package com.rawson.bank.service;

import com.rawson.bank.domain.Account;
import com.rawson.bank.repository.AccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/*
 Servicio de dominio para Account. Incluye create simple y createWithOutbox.
*/
@Service
public class AccountService {

    private final AccountRepository repo;
    private final OutboxService outboxService;

    public AccountService(AccountRepository repo, OutboxService outboxService) {
        this.repo = repo;
        this.outboxService = outboxService;
    }

    public List<Account> findAll() {
        return repo.findAll();
    }

    public Account create(Account account) {
        account.setId(null);
        return repo.save(account);
    }

    @Transactional
    public Account createWithOutbox(Account account) {
        account.setId(null);
        Account created = repo.save(account);
        outboxService.publishEventTransactional("Account", created.getId().toString(), "account.created", created);
        return created;
    }
}
