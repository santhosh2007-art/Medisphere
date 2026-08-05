package com.infosys.vitalsservice.Entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "alerts")
public class Alert {

    @Id
    private String id;
    private String patientId;
    private String patientName;
    private String alertType;      // CARDIAC, OXYGEN, BLOOD_PRESSURE, TEMPERATURE
    private String severity;       // CRITICAL, EMERGENCY, HYPERTENSIVE_CRISIS, WARNING
    private Double aiConfidence;   // e.g., 92.5
    private String alertMessage;
    private String assignedDoctor; // e.g., Dr. Sarah Jenkins (Cardiologist)
    private String doctorRole;     // Cardiologist, Pulmonologist, etc.
    private String status;         // ACTIVE, ACKNOWLEDGED, ESCALATED, DISABLED
    private String doctorVisitStatus = "PENDING"; // PENDING, VISITED, DISABLED
    private String visitedBy;
    private Date visitedTime;
    private Date disabledTime;
    private Date createdTime;
    private Boolean acknowledged = false;
    private String acknowledgedBy;
    private Date acknowledgedTime;
    private Boolean escalated = false;
    private Date escalatedTime;
    
    // Vitals Snapshot
    private Integer heartRate;
    private Double spO2;
    private Double bodyTemperature;
    private String bloodPressure;
    private String activityState;

    public Alert() {
        this.createdTime = new Date();
        this.status = "ACTIVE";
        this.doctorVisitStatus = "PENDING";
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public String getAlertMessage() {
        return alertMessage;
    }

    public void setAlertMessage(String alertMessage) {
        this.alertMessage = alertMessage;
    }

    public String getAssignedDoctor() {
        return assignedDoctor;
    }

    public void setAssignedDoctor(String assignedDoctor) {
        this.assignedDoctor = assignedDoctor;
    }

    public String getDoctorRole() {
        return doctorRole;
    }

    public void setDoctorRole(String doctorRole) {
        this.doctorRole = doctorRole;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Date getCreatedTime() {
        return createdTime;
    }

    public void setCreatedTime(Date createdTime) {
        this.createdTime = createdTime;
    }

    public Boolean getAcknowledged() {
        return acknowledged;
    }

    public void setAcknowledged(Boolean acknowledged) {
        this.acknowledged = acknowledged;
    }

    public String getAcknowledgedBy() {
        return acknowledgedBy;
    }

    public void setAcknowledgedBy(String acknowledgedBy) {
        this.acknowledgedBy = acknowledgedBy;
    }

    public Date getAcknowledgedTime() {
        return acknowledgedTime;
    }

    public void setAcknowledgedTime(Date acknowledgedTime) {
        this.acknowledgedTime = acknowledgedTime;
    }

    public Boolean getEscalated() {
        return escalated;
    }

    public void setEscalated(Boolean escalated) {
        this.escalated = escalated;
    }

    public Date getEscalatedTime() {
        return escalatedTime;
    }

    public void setEscalatedTime(Date escalatedTime) {
        this.escalatedTime = escalatedTime;
    }

    public Integer getHeartRate() {
        return heartRate;
    }

    public void setHeartRate(Integer heartRate) {
        this.heartRate = heartRate;
    }

    public Double getSpO2() {
        return spO2;
    }

    public void setSpO2(Double spO2) {
        this.spO2 = spO2;
    }

    public Double getBodyTemperature() {
        return bodyTemperature;
    }

    public void setBodyTemperature(Double bodyTemperature) {
        this.bodyTemperature = bodyTemperature;
    }

    public String getBloodPressure() {
        return bloodPressure;
    }

    public void setBloodPressure(String bloodPressure) {
        this.bloodPressure = bloodPressure;
    }

    public String getActivityState() {
        return activityState;
    }

    public void setActivityState(String activityState) {
        this.activityState = activityState;
    }

    public String getDoctorVisitStatus() {
        return doctorVisitStatus;
    }

    public void setDoctorVisitStatus(String doctorVisitStatus) {
        this.doctorVisitStatus = doctorVisitStatus;
    }

    public String getVisitedBy() {
        return visitedBy;
    }

    public void setVisitedBy(String visitedBy) {
        this.visitedBy = visitedBy;
    }

    public Date getVisitedTime() {
        return visitedTime;
    }

    public void setVisitedTime(Date visitedTime) {
        this.visitedTime = visitedTime;
    }

    public Date getDisabledTime() {
        return disabledTime;
    }

    public void setDisabledTime(Date disabledTime) {
        this.disabledTime = disabledTime;
    }
}
