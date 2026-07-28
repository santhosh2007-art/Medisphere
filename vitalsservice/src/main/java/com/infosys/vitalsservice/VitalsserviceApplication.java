package com.infosys.vitalsservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class VitalsserviceApplication {

	public static void main(String[] args) {
        SpringApplication.run(VitalsserviceApplication.class, args);
	}

}
