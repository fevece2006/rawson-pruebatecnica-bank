package com.rawson.bank;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/*
 Punto de entrada del servicio backend (Accounts).
 Se registra en Eureka para discovery (EnableDiscoveryClient).
*/
@SpringBootApplication
@EnableDiscoveryClient
public class BackendBankSystemApplication {
    public static void main(String[] args) {
        SpringApplication.run(BackendBankSystemApplication.class, args);
    }
}