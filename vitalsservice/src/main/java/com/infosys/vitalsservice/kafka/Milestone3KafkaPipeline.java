package com.infosys.vitalsservice.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infosys.vitalsservice.Entity.Alert;
import com.infosys.vitalsservice.Service.AlertService;
import com.infosys.vitalsservice.Service.AnomalyDetectionEngine;
import com.infosys.vitalsservice.Service.NotificationService;
import com.infosys.vitalsservice.dto.AnomalyEventDTO;
import com.infosys.vitalsservice.dto.VitalSimulatorDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class Milestone3KafkaPipeline {

    private static final Logger logger = LoggerFactory.getLogger(Milestone3KafkaPipeline.class);

    public static final String TOPIC_VITALS_STREAM = "vitals-stream";
    public static final String TOPIC_ANOMALY_DETECTED = "anomaly-detected";
    public static final String TOPIC_ALERT_CREATED = "alert-created";

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    @Autowired
    private AnomalyDetectionEngine anomalyDetectionEngine;

    @Autowired
    private AlertService alertService;

    @Autowired
    private NotificationService notificationService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // ── PRODUCERS ──────────────────────────────────────────

    public void sendToVitalsStream(VitalSimulatorDTO vitals) {
        try {
            String json = objectMapper.writeValueAsString(vitals);
            logger.info("Kafka [PRODUCER] → Publishing to {}: Patient {} HR={} SpO2={}%",
                    TOPIC_VITALS_STREAM, vitals.getPatientId(), vitals.getHeartRate(), vitals.getSpO2());
            kafkaTemplate.send(TOPIC_VITALS_STREAM, vitals.getPatientId(), json);
        } catch (Exception e) {
            logger.error("Error publishing to vitals-stream: {}", e.getMessage());
        }
    }

    public void sendToAnomalyDetected(AnomalyEventDTO anomaly) {
        try {
            String json = objectMapper.writeValueAsString(anomaly);
            logger.info("Kafka [PRODUCER] → Publishing to {}: Patient {} AlertType={} Severity={}",
                    TOPIC_ANOMALY_DETECTED, anomaly.getPatientId(), anomaly.getAlertType(), anomaly.getSeverity());
            kafkaTemplate.send(TOPIC_ANOMALY_DETECTED, anomaly.getPatientId(), json);
        } catch (Exception e) {
            logger.error("Error publishing to anomaly-detected: {}", e.getMessage());
        }
    }

    public void sendToAlertCreated(Alert alert) {
        try {
            String json = objectMapper.writeValueAsString(alert);
            logger.info("Kafka [PRODUCER] → Publishing to {}: AlertId={} AssignedDoctor={}",
                    TOPIC_ALERT_CREATED, alert.getId(), alert.getAssignedDoctor());
            kafkaTemplate.send(TOPIC_ALERT_CREATED, alert.getPatientId(), json);
        } catch (Exception e) {
            logger.error("Error publishing to alert-created: {}", e.getMessage());
        }
    }

    // ── CONSUMERS ──────────────────────────────────────────

    @KafkaListener(topics = TOPIC_VITALS_STREAM, groupId = "milestone3-vitals-group")
    public void consumeVitalsStream(String jsonPayload) {
        try {
            VitalSimulatorDTO vitals = objectMapper.readValue(jsonPayload, VitalSimulatorDTO.class);
            logger.info("Kafka [CONSUMER] ← Received vitals-stream for Patient {}", vitals.getPatientId());

            // Process through Anomaly Detection Engine
            AnomalyEventDTO anomaly = anomalyDetectionEngine.evaluateVitals(vitals);
            if (anomaly != null) {
                logger.warn("⚡ Anomaly/Rule Breach Detected! Patient: {} Alert: {} Severity: {}",
                        anomaly.getPatientId(), anomaly.getAlertType(), anomaly.getSeverity());
                // Forward to anomaly-detected topic
                sendToAnomalyDetected(anomaly);
            }
        } catch (Exception e) {
            logger.error("Error processing vitals-stream message: {}", e.getMessage());
        }
    }

    @KafkaListener(topics = TOPIC_ANOMALY_DETECTED, groupId = "milestone3-anomaly-group")
    public void consumeAnomalyDetected(String jsonPayload) {
        try {
            AnomalyEventDTO anomaly = objectMapper.readValue(jsonPayload, AnomalyEventDTO.class);
            logger.info("Kafka [CONSUMER] ← Received anomaly-detected for Patient {}", anomaly.getPatientId());

            // Process alert creation & fatigue suppression
            Alert createdAlert = alertService.processAnomaly(anomaly);
            if (createdAlert != null) {
                // Forward to alert-created topic
                sendToAlertCreated(createdAlert);
            }
        } catch (Exception e) {
            logger.error("Error processing anomaly-detected message: {}", e.getMessage());
        }
    }

    @KafkaListener(topics = TOPIC_ALERT_CREATED, groupId = "milestone3-notification-group")
    public void consumeAlertCreated(String jsonPayload) {
        try {
            Alert alert = objectMapper.readValue(jsonPayload, Alert.class);
            logger.info("Kafka [CONSUMER] ← Received alert-created for AlertId {}", alert.getId());

            // Trigger Notification Service
            notificationService.handleAlertNotification(alert);
        } catch (Exception e) {
            logger.error("Error processing alert-created message: {}", e.getMessage());
        }
    }
}
