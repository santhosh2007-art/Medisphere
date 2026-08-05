package com.infosys.vitalsservice.Service;

import com.infosys.vitalsservice.dto.VitalSimulatorDTO;
import com.infosys.vitalsservice.kafka.Milestone3KafkaPipeline;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class VitalsPollerScheduler {

    private static final Logger logger = LoggerFactory.getLogger(VitalsPollerScheduler.class);

    private static final String PYTHON_SIMULATOR_URL = "http://localhost:5000/vitals";

    @Autowired
    private Milestone3KafkaPipeline kafkaPipeline;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Periodically polls the Python Vital Simulator REST API every 10 seconds.
     * Validates vital ranges and forwards valid telemetry to Kafka `vitals-stream`.
     */
    @Scheduled(fixedRate = 10000)
    public void pollPythonVitalSimulator() {
        try {
            VitalSimulatorDTO[] vitalsArray = restTemplate.getForObject(PYTHON_SIMULATOR_URL, VitalSimulatorDTO[].class);
            if (vitalsArray == null || vitalsArray.length == 0) {
                return;
            }

            for (VitalSimulatorDTO vitals : vitalsArray) {
                if (validateVitalRanges(vitals)) {
                    kafkaPipeline.sendToVitalsStream(vitals);
                } else {
                    logger.warn("⚠️ [RANGE VALIDATION FAILED] Rejected out-of-bounds reading for Patient {}",
                            vitals.getPatientId());
                }
            }
        } catch (Exception e) {
            // Python simulator might be offline or initializing - log gracefully
            logger.debug("Python Vital Simulator polling standby ({})", e.getMessage());
        }
    }

    /**
     * Validates physiological plausibility ranges.
     */
    private boolean validateVitalRanges(VitalSimulatorDTO v) {
        if (v == null || v.getPatientId() == null) return false;

        int hr = v.getHeartRate() != null ? v.getHeartRate() : 0;
        double spo2 = v.getSpO2() != null ? v.getSpO2() : 0.0;
        double temp = v.getBodyTemperature() != null ? v.getBodyTemperature() : 0.0;
        int sys = v.getSystolicBp() != null ? v.getSystolicBp() : 0;

        boolean hrValid = hr >= 30 && hr <= 220;
        boolean spo2Valid = spo2 >= 70.0 && spo2 <= 100.0;
        boolean tempValid = temp >= 34.0 && temp <= 43.0;
        boolean bpValid = sys >= 60 && sys <= 240;

        return hrValid && spo2Valid && tempValid && bpValid;
    }
}
