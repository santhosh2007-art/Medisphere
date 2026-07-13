package com.infosys.healthtwinservice.Service;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class VitalsConsumerService {

    @KafkaListener(topics = "wearable-vitals", groupId = "healthtwin-group")
    public void consume(ConsumerRecord<String, String> record) {
        System.out.println("Patient: " + record.key() + " | Vitals: " + record.value());
        // Idha base pannitu HealthTwin update pannalam
    }
}