package com.infosys.aipredictionservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class AipredictionserviceApplication {
    public static void main(String[] args) {
        SpringApplication.run(AipredictionserviceApplication.class, args);
    }
}
