package com.infosys.vitalsservice.kafka;

import com.infosys.vitalsservice.Service.VitalsService;
import com.infosys.vitalsservice.dto.VitalsRequestDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Listens to the wearable device vitals topic and persists every
 * incoming reading into MongoDB, simulating a real-time ingestion pipeline.
 */
@Component
public class WearableDataConsumer {

    private static final Logger logger = LoggerFactory.getLogger(WearableDataConsumer.class);

    @Autowired
    private VitalsService vitalsService;

    @KafkaListener(topics = "${app.kafka.topic.wearable-vitals}", groupId = "${spring.kafka.consumer.group-id}")
    public void consume(VitalsRequestDTO dto) {

        logger.info("Received wearable vitals data for patient {}", dto.getPatientId());

        vitalsService.save(dto);
    }
}
