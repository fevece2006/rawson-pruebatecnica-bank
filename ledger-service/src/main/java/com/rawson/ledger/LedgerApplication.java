package com.rawson.ledger;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/*
 Ledger service: consumidor de transfer.events y persistencia de asientos.
*/
@SpringBootApplication
@EnableDiscoveryClient
public class LedgerApplication {
    public static void main(String[] args) {
        SpringApplication.run(LedgerApplication.class, args);
    }
}
