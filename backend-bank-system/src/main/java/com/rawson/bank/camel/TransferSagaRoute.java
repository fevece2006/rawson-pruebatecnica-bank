package com.rawson.bank.camel;

import org.apache.camel.builder.RouteBuilder;
import org.apache.camel.model.SagaPropagation;
import org.apache.camel.saga.InMemorySagaService;
import org.springframework.stereotype.Component;

/*
 Ruta de ejemplo que muestra un patrón Saga con Camel (demo).
*/
@Component
public class TransferSagaRoute extends RouteBuilder {

    @Override
    public void configure() throws Exception {

        getContext().addService(new InMemorySagaService());

        from("direct:startTransferSaga")
            .routeId("start-transfer-saga")
            .saga()
                .propagation(SagaPropagation.REQUIRED)
            .log("Iniciando saga de transferencia: ${body}")
            .to("direct:debitAccount")
            .to("direct:creditAccount")
            .log("Transferencia completada: ${body}")
        .end();

        from("direct:debitAccount")
            .routeId("debit-account")
            .saga()
                .compensation("direct:compensateDebit")
            .end()
            .log("Debitar cuenta (simulado): ${body}");

        from("direct:compensateDebit")
            .routeId("compensate-debit")
            .log("Compensacion: revertir debito para ${body}");

        from("direct:creditAccount")
            .routeId("credit-account")
            .log("Acreditar cuenta (simulado): ${body}");
    }
}
