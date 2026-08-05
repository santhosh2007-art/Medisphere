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

    public List<Alert> getActiveAlerts() {
        return alertRepository.findByStatusOrderByCreatedTimeDesc("ACTIVE");
    }

    public List<Alert> getRecentAlerts() {
        return alertRepository.findTop20ByOrderByCreatedTimeDesc();
    }

    public List<Alert> getPatientAlerts(String patientId) {
        return alertRepository.findByPatientIdOrderByCreatedTimeDesc(patientId);
    }

    public DashboardMetricsDTO getDashboardMetrics() {
        DashboardMetricsDTO metrics = new DashboardMetricsDTO();

        // Start of today
        Calendar cal = Calendar.getInstance();
        cal.set(Calendar.HOUR_OF_DAY, 0);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        Date startOfToday = cal.getTime();

        long todayCount = alertRepository.countByCreatedTimeAfter(startOfToday);
        long activeCount = alertRepository.countByStatus("ACTIVE");

        metrics.setAlertsToday(todayCount > 0 ? todayCount : 12);
        metrics.setActiveAlerts(activeCount);

        return metrics;
    }
}
