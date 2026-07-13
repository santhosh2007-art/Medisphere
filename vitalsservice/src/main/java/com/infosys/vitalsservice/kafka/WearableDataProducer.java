package com.infosys.vitalsservice.kafka;

import com.infosys.vitalsservice.dto.VitalsRequestDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

/**
 * Publishes wearable device vitals readings to Kafka.
 * In a real system this would be called by the wearable device / gateway.
 * Here we expose it through a REST endpoint so it can be tested easily.
 */
@Service
public class WearableDataProducer {

    private static final Logger logger = LoggerFactory.getLogger(WearableDataProducer.class);

    @Autowired
    private KafkaTemplate<String, VitalsRequestDTO> kafkaTemplate;

    @Value("${app.kafka.topic.wearable-vitals}")
    private String topic;

    public void publish(VitalsRequestDTO dto) {

        logger.info("Publishing wearable vitals data for patient {} to topic {}",
                dto.getPatientId(), topic);

        kafkaTemplate.send(topic, dto.getPatientId().toString(), dto);
    }
}
