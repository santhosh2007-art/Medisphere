package com.infosys.vitalsservice.dto;

public class AnomalyEventDTO {
    private String patientId;
    private String patientName;
    private String alertType;      // CARDIAC, OXYGEN, BLOOD_PRESSURE, TEMPERATURE
    private String severity;       // CRITICAL, EMERGENCY, HYPERTENSIVE_CRISIS, WARNING
    private Double aiConfidence;   // e.g. 92.5
    private String ruleTriggered;  // Description of statistical or clinical rule
    private VitalSimulatorDTO vitals;
    private Long timestamp;

    public AnomalyEventDTO() {
        this.timestamp = System.currentTimeMillis();
    }

    public String getPatientId() {
        return patientId;
    }

    public void setPatientId(String patientId) {
        this.patientId = patientId;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public String getAlertType() {
        return alertType;
    }

    public void setAlertType(String alertType) {
        this.alertType = alertType;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public Double getAiConfidence() {
        return aiConfidence;
    }

    public void setAiConfidence(Double aiConfidence) {
        this.aiConfidence = aiConfidence;
    }

    public String getRuleTriggered() {
        return ruleTriggered;
    }

    public void setRuleTriggered(String ruleTriggered) {
        this.ruleTriggered = ruleTriggered;
    }

    public VitalSimulatorDTO getVitals() {
        return vitals;
    }

    public void setVitals(VitalSimulatorDTO vitals) {
        this.vitals = vitals;
    }

    public Long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Long timestamp) {
        this.timestamp = timestamp;
    }
}
