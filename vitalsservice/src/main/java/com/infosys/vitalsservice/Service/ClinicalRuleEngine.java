package com.infosys.vitalsservice.Service;

import com.infosys.vitalsservice.dto.VitalSimulatorDTO;
import org.springframework.stereotype.Service;

@Service
public class ClinicalRuleEngine {

    /**
     * Applies deterministic clinical safety rules to assign exact severity override.
     * Rules:
     * - HR > 150 at REST -> CRITICAL
     * - SpO2 < 85% -> CRITICAL
     * - Temp > 40°C -> EMERGENCY
     * - BP > 180/120 -> HYPERTENSIVE_CRISIS
     * - Otherwise -> WARNING
     */
    public String determineSeverity(VitalSimulatorDTO vitals, String alertType) {
        if (vitals == null) return "WARNING";

        int hr = vitals.getHeartRate() != null ? vitals.getHeartRate() : 75;
        double spo2 = vitals.getSpO2() != null ? vitals.getSpO2() : 98.0;
        double temp = vitals.getBodyTemperature() != null ? vitals.getBodyTemperature() : 37.0;
        int sys = vitals.getSystolicBp() != null ? vitals.getSystolicBp() : 120;
        int dia = vitals.getDiastolicBp() != null ? vitals.getDiastolicBp() : 80;
        String activity = vitals.getActivityState() != null ? vitals.getActivityState().toUpperCase() : "REST";

        // 1. Clinical Rule: BP > 180/120 -> HYPERTENSIVE_CRISIS
        if (sys >= 180 || dia >= 115) {
            return "HYPERTENSIVE_CRISIS";
        }

        // 2. Clinical Rule: Temp > 40°C -> EMERGENCY
        if (temp >= 40.0) {
            return "EMERGENCY";
        }

        // 3. Clinical Rule: SpO2 < 85% -> CRITICAL
        if (spo2 < 85.0) {
            return "CRITICAL";
        }

        // 4. Clinical Rule: HR > 150 at REST -> CRITICAL
        if (hr >= 150 && "REST".equals(activity)) {
            return "CRITICAL";
        }

        // Default Statistical Anomaly Severity
        return "WARNING";
    }
}
