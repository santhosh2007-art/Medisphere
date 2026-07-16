package com.infosys.explainabilityservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class ExplanationApplication {
    public static void main(String[] args) {
        SpringApplication.run(ExplanationApplication.class, args);
    }
}
