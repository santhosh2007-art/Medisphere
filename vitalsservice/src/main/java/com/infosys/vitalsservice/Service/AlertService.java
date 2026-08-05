package com.infosys.vitalsservice.Service;

import com.infosys.vitalsservice.Entity.Alert;
import com.infosys.vitalsservice.Repository.AlertRepository;
import com.infosys.vitalsservice.dto.AnomalyEventDTO;
import com.infosys.vitalsservice.dto.DashboardMetricsDTO;
import com.infosys.vitalsservice.dto.VitalSimulatorDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Calendar;
import java.util.Date;
import java.util.List;

@Service
public class AlertService {

    private static final Logger logger = LoggerFactory.getLogger(AlertService.class);

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private AlertRoutingService alertRoutingService;

    @Autowired
    private AlertFatigueService alertFatigueService;

    /**
     * Processes an incoming anomaly event.
     * Applies 5-minute duplicate suppression, routes assigned doctor, and saves to MongoDB.
     */
    public Alert processAnomaly(AnomalyEventDTO anomaly) {
        if (anomaly == null) return null;

        String patientId = anomaly.getPatientId();
        String alertType = anomaly.getAlertType();

        // 1. Fatigue Prevention: Check for 5-minute duplicate window
        if (alertFatigueService.shouldSuppressAlert(patientId, alertType)) {
            logger.info("🛡️ [FATIGUE SUPPRESSION] Duplicate alert suppressed for Patient {} Type {}",
                    patientId, alertType);
            return null;
        }

        // 2. Alert Routing: Assign doctor based on alert type
        AlertRoutingService.DoctorAssignment doctor = alertRoutingService.routeDoctor(alertType);

        // 3. Construct Alert Document
        Alert alert = new Alert();
        alert.setPatientId(patientId);
        alert.setPatientName(anomaly.getPatientName());
        alert.setAlertType(alertType);
        alert.setSeverity(anomaly.getSeverity());
        alert.setAiConfidence(anomaly.getAiConfidence());
        alert.setAlertMessage(anomaly.getRuleTriggered());
        alert.setAssignedDoctor(doctor.getDoctorName());
        alert.setDoctorRole(doctor.getRole());
        alert.setStatus("ACTIVE");
        alert.setCreatedTime(new Date());
        alert.setAcknowledged(false);
        alert.setEscalated(false);

        // Snapshot vitals
        VitalSimulatorDTO vitals = anomaly.getVitals();
        if (vitals != null) {
            alert.setHeartRate(vitals.getHeartRate());
            alert.setSpO2(vitals.getSpO2());
            alert.setBodyTemperature(vitals.getBodyTemperature());
            alert.setBloodPressure(vitals.getBloodPressure());
            alert.setActivityState(vitals.getActivityState());
        }

        // Save to MongoDB
        Alert saved = alertRepository.save(alert);
        logger.info("✅ [ALERT CREATED] Saved Alert ID {} for Patient {} Assigned to {}",
                saved.getId(), saved.getPatientId(), saved.getAssignedDoctor());

        return saved;
    }

    public Alert processAnomalyDirect(AnomalyEventDTO anomaly) {
        if (anomaly == null) return null;

        AlertRoutingService.DoctorAssignment doctor = alertRoutingService.routeDoctor(anomaly.getAlertType());

        Alert alert = new Alert();
        alert.setPatientId(anomaly.getPatientId());
        alert.setPatientName(anomaly.getPatientName());
        alert.setAlertType(anomaly.getAlertType());
        alert.setSeverity(anomaly.getSeverity());
        alert.setAiConfidence(anomaly.getAiConfidence());
        alert.setAlertMessage(anomaly.getRuleTriggered());
        alert.setAssignedDoctor(doctor.getDoctorName());
        alert.setDoctorRole(doctor.getRole());
        alert.setStatus("ACTIVE");
        alert.setCreatedTime(new Date());
        alert.setAcknowledged(false);
        alert.setEscalated(false);

        VitalSimulatorDTO vitals = anomaly.getVitals();
        if (vitals != null) {
            alert.setHeartRate(vitals.getHeartRate());
            alert.setSpO2(vitals.getSpO2());
            alert.setBodyTemperature(vitals.getBodyTemperature());
            alert.setBloodPressure(vitals.getBloodPressure());
            alert.setActivityState(vitals.getActivityState());
        }

        return alertRepository.save(alert);
    }

    public Alert acknowledgeAlert(String alertId, String providerName) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found with ID: " + alertId));

        alert.setAcknowledged(true);
        alert.setStatus("ACKNOWLEDGED");
        alert.setAcknowledgedBy(providerName != null ? providerName : "Dr. Specialist");
        alert.setAcknowledgedTime(new Date());

        Alert updated = alertRepository.save(alert);
        logger.info("👍 [ALERT ACKNOWLEDGED] Alert ID {} acknowledged by {}", alertId, alert.getAcknowledgedBy());
        return updated;
    }

    public Alert escalateAlert(String alertId) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found with ID: " + alertId));

        alert.setEscalated(true);
        alert.setStatus("ESCALATED");
        alert.setEscalatedTime(new Date());

        Alert updated = alertRepository.save(alert);
        logger.warn("🚨 [ALERT ESCALATED] Alert ID {} escalated for immediate intervention", alertId);
        return updated;
    }

    public Alert markDoctorVisited(String alertId, String doctorName) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found with ID: " + alertId));

        alert.setDoctorVisitStatus("VISITED");
        alert.setVisitedBy(doctorName != null ? doctorName : "Dr. Specialist");
        alert.setVisitedTime(new Date());

        Alert updated = alertRepository.save(alert);
        logger.info("🩺 [DOCTOR VISITED] Alert ID {} visited by {}", alertId, alert.getVisitedBy());
        return updated;
    }

    public Alert disableAlert(String alertId) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found with ID: " + alertId));

        alert.setStatus("DISABLED");
        alert.setDoctorVisitStatus("DISABLED");
        alert.setDisabledTime(new Date());

        Alert updated = alertRepository.save(alert);
        logger.info("⏸️ [ALERT DISABLED] Alert ID {} resolved & disabled", alertId);
        return updated;
    }

    public List<Alert> getActiveAlerts() {
        seedInitialDemoAlertsIfEmpty();
        return alertRepository.findByStatusOrderByCreatedTimeDesc("ACTIVE");
    }

    public List<Alert> getRecentAlerts() {
        seedInitialDemoAlertsIfEmpty();
        return alertRepository.findTop20ByOrderByCreatedTimeDesc();
    }

    public List<Alert> getPatientAlerts(String patientId) {
        return alertRepository.findByPatientIdOrderByCreatedTimeDesc(patientId);
    }

    private void seedInitialDemoAlertsIfEmpty() {
        if (alertRepository.count() >= 3) return;

        // 1. CARDIAC Alert for Dr. Sarah Jenkins
        Alert a1 = new Alert();
        a1.setPatientId("35f51e3e-66fd-4f87-85ad-affa0dde1156");
        a1.setPatientName("Santhosh Kumar");
        a1.setAlertType("CARDIAC");
        a1.setSeverity("CRITICAL");
        a1.setAiConfidence(94.2);
        a1.setAlertMessage("Resting Tachycardia: Heart rate 158 bpm during REST");
        a1.setAssignedDoctor("Dr. Sarah Jenkins (Cardiologist)");
        a1.setDoctorRole("Cardiologist");
        a1.setStatus("ACTIVE");
        a1.setDoctorVisitStatus("PENDING");
        a1.setHeartRate(158);
        a1.setSpO2(95.0);
        a1.setBodyTemperature(37.2);
        a1.setBloodPressure("142/90");
        a1.setActivityState("REST");
        alertRepository.save(a1);

        // 2. OXYGEN Alert for Dr. Robert Chen
        Alert a2 = new Alert();
        a2.setPatientId("8a719c2d-12ef-45a8-912b-34567890abcd");
        a2.setPatientName("Anitha Ramesh");
        a2.setAlertType("OXYGEN");
        a2.setSeverity("CRITICAL");
        a2.setAiConfidence(92.8);
        a2.setAlertMessage("Oxygen Desaturation: SpO2 dipped to 84.5%");
        a2.setAssignedDoctor("Dr. Robert Chen (Pulmonologist)");
        a2.setDoctorRole("Pulmonologist");
        a2.setStatus("ACTIVE");
        a2.setDoctorVisitStatus("PENDING");
        a2.setHeartRate(108);
        a2.setSpO2(84.5);
        a2.setBodyTemperature(36.9);
        a2.setBloodPressure("128/82");
        a2.setActivityState("WALKING");
        alertRepository.save(a2);

        // 3. BLOOD_PRESSURE Alert for Dr. Elena Rostova
        Alert a3 = new Alert();
        a3.setPatientId("9b820d3e-23fa-56b9-923c-45678901bcde");
        a3.setPatientName("Rajesh Kannan");
        a3.setAlertType("BLOOD_PRESSURE");
        a3.setSeverity("HYPERTENSIVE_CRISIS");
        a3.setAiConfidence(95.1);
        a3.setAlertMessage("Hypertensive Elevation: Blood pressure measured 185/112 mmHg");
        a3.setAssignedDoctor("Dr. Elena Rostova (General Physician)");
        a3.setDoctorRole("General Physician");
        a3.setStatus("ACTIVE");
        a3.setDoctorVisitStatus("PENDING");
        a3.setHeartRate(115);
        a3.setSpO2(96.0);
        a3.setBodyTemperature(37.1);
        a3.setBloodPressure("185/112");
        a3.setActivityState("REST");
        alertRepository.save(a3);

        logger.info("🌱 [DEMO SEED] Initial specialty alerts seeded for Dr. Sarah, Dr. Robert, & Dr. Elena!");
    }

    public DashboardMetricsDTO getDashboardMetrics() {
        DashboardMetricsDTO metrics = new DashboardMetricsDTO();

        Calendar cal = Calendar.getInstance();
        cal.set(Calendar.HOUR_OF_DAY, 0);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        Date startOfToday = cal.getTime();

        long todayCount = alertRepository.countByCreatedTimeAfter(startOfToday);
        long activeCount = alertRepository.countByStatus("ACTIVE");

        metrics.setAlertsToday(todayCount > 0 ? todayCount : 3);
        metrics.setActiveAlerts(activeCount);

        return metrics;
    }
}
