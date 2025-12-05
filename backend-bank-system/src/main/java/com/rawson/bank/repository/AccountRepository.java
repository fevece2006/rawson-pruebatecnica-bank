package com.rawson.bank.repository;

import com.rawson.bank.domain.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

/*
 Repositorio JPA para Account.
*/
public interface AccountRepository extends JpaRepository<Account, Long> {
    Optional<Account> findByAccountNumber(String accountNumber);
}
