package com.rawson.bank.domain;

import jakarta.persistence.*;
import lombok.*;

/*
 Entidad Account simple de ejemplo.
 Contiene accountNumber, currency, balance y ownerId.
*/
@Entity
@Table(name = "accounts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String accountNumber;

    @Column(nullable = false)
    private String currency;

    @Column(nullable = false)
    private Double balance;

    @Column(nullable = false)
    private String ownerId;
}
