package com.infosys.vitalsservice.Service;

import com.infosys.vitalsservice.dto.AnomalyEventDTO;
import com.infosys.vitalsservice.dto.VitalSimulatorDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class AnomalyDetectionEngine {

    @Autowired
    private ClinicalRuleEngine clinicalRuleEngine;

    private final Random random = new Random();

    /**
     * Evaluates incoming vital signs against statistical thresholds & clinical rules.
     * Returns an AnomalyEventDTO if an anomaly or rule breach occurs, otherwise returns null.
     */
    public AnomalyEventDTO evaluateVitals(VitalSimulatorDTO vitals) {
        if (vitals == null) return null;

        int hr = vitals.getHeartRate() != null ? vitals.getHeartRate() : 75;
        double spo2 = vitals.getSpO2() != null ? vitals.getSpO2() : 98.0;
        double temp = vitals.getBodyTemperature() != null ? vitals.getBodyTemperature() : 37.0;
        int sys = vitals.getSystolicBp() != null ? vitals.getSystolicBp() : 120;
        int dia = vitals.getDiastolicBp() != null ? vitals.getDiastolicBp() : 80;
        String activity = vitals.getActivityState() != null ? vitals.getActivityState().toUpperCase() : "REST";

        boolean isRestingTachycardia = (hr > 140 && "REST".equals(activity)) || hr > 155;
        boolean isHypoxia = spo2 < 90.0;
        boolean isHighFever = temp > 38.8;
        boolean isHypertension = sys > 175 || dia > 108;
        boolean isAbnormalFlag = Boolean.TRUE.equals(vitals.getIsAbnormal());

        // Check if any statistical or clinical anomaly is present
        if (!isRestingTachycardia && !isHypoxia && !isHighFever && !isHypertension && !isAbnormalFlag) {
            return null; // Normal vital reading
        }

        AnomalyEventDTO anomaly = new AnomalyEventDTO();
        anomaly.setPatientId(vitals.getPatientId());
        anomaly.setPatientName(vitals.getName() != null ? vitals.getName() : "Patient " + vitals.getPatientId());
        anomaly.setVitals(vitals);

        // Generate simulated AI Confidence Score between 88.0% and 95.5%
        double confidence = 88.0 + (random.nextDouble() * 7.5);
        anomaly.setAiConfidence(Math.round(confidence * 10.0) / 10.0);

        // Classify Alert Type
        if (isRestingTachycardia) {
            anomaly.setAlertType("CARDIAC");
            anomaly.setRuleTriggered("Resting Tachycardia: Heart rate " + hr + " bpm during " + activity);
        } else if (isHypoxia) {
            anomaly.setAlertType("OXYGEN");
            anomaly.setRuleTriggered("Oxygen Desaturation: SpO2 dipped to " + spo2 + "%");
        } else if (isHypertension) {
            anomaly.setAlertType("BLOOD_PRESSURE");
            anomaly.setRuleTriggered("Hypertensive Elevation: Blood pressure measured " + sys + "/" + dia + " mmHg");
        } else if (isHighFever) {
            anomaly.setAlertType("TEMPERATURE");
            anomaly.setRuleTriggered("Hyperthermia: Body temperature rose to " + temp + "°C");
        } else {
            anomaly.setAlertType("CARDIAC");
            anomaly.setRuleTriggered("Biometric Anomaly: Abnormal telemetry reading detected");
        }

        // Apply Clinical Rule Engine Overrides for Severity
        String severity = clinicalRuleEngine.determineSeverity(vitals, anomaly.getAlertType());
        anomaly.setSeverity(severity);

        return anomaly;
    }
}
