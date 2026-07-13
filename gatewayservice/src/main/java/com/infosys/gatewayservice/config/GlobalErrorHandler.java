package com.infosys.gatewayservice.config;

import org.springframework.boot.web.reactive.error.ErrorWebExceptionHandler;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class GlobalErrorHandler implements ErrorWebExceptionHandler {

    @Override
    public Mono<Void> handle(ServerWebExchange exchange, Throwable ex) {

        exchange.getResponse().setStatusCode(HttpStatus.SERVICE_UNAVAILABLE);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);

        String response = """
                {
                  "status":503,
                  "message":"Requested service is unavailable"
                }
                """;

        var buffer = exchange.getResponse()
                .bufferFactory()
                .wrap(response.getBytes());

        return exchange.getResponse().writeWith(Mono.just(buffer));
    }
}