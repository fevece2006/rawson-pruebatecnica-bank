package com.rawson.bank.camel;

import com.rawson.bank.service.AccountEventHandler;
import org.apache.camel.builder.RouteBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/*
 Rutas Camel:
 - Consume topic Debezium outbox y delega a accountEventHandler
 - Manejo de errores: reintentos + DLQ
*/
@Component
public class AccountCamelRoute extends RouteBuilder {

    @Value("${kafka.bootstrap-servers:localhost:9092}")
    private String kafkaBrokers;

    @Value("${kafka.outbox.topic:dbserver1.bankdb.public.outbox}")
    private String outboxTopic;

    @Value("${kafka.account.events.topic:account.events}")
    private String accountEventsTopic;

    @Value("${kafka.dlq.topic:account.events.dlq}")
    private String dlqTopic;

    @Override
    public void configure() throws Exception {

        onException(Exception.class)
            .maximumRedeliveries(3)
            .redeliveryDelay(5000)
            .handled(true)
            .log("Error procesando mensaje, se enviarÃ¡ a DLQ: ${exception.message}")
            .toD("kafka:${header.dlqTopic}?brokers=" + kafkaBrokers);

        fromF("kafka:%s?brokers=%s&groupId=camel-outbox-group", outboxTopic, kafkaBrokers)
            .routeId("consume-outbox-events")
            .setHeader("dlqTopic", simple(dlqTopic))
            .log("Outbox event recibido: ${body}")
            .to("bean:accountEventHandler?method=handle")
            .toD("kafka:" + accountEventsTopic + "?brokers=" + kafkaBrokers)
            .log("Evento reenviado a topic " + accountEventsTopic);
    }
}
