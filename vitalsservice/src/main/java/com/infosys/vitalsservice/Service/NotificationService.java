package com.infosys.vitalsservice.Service;

import com.infosys.vitalsservice.Entity.Alert;
import com.infosys.vitalsservice.Repository.AlertRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    @Autowired
    private AlertRepository alertRepository;

    private final List<String> notificationLogs = new ArrayList<>();

    // Timeout for auto-escalation (2 minutes = 120,000 ms for demo)
    private static final long ESCALATION_TIMEOUT_MS = 2 * 60 * 1000;

    /**
     * Handles incoming alert notifications (simulated push / log history).
     */
    public void handleAlertNotification(Alert alert) {
        if (alert == null) return;

        String msg = String.format("[%s] NOTIFICATION SENT → Patient %s | Severity: %s | Doctor: %s | Message: %s",
                new Date(), alert.getPatientId(), alert.getSeverity(), alert.getAssignedDoctor(), alert.getAlertMessage());

        logger.info("🔔 {}", msg);

        synchronized (notificationLogs) {
            notificationLogs.add(0, msg);
            if (notificationLogs.size() > 50) {
                notificationLogs.remove(notificationLogs.size() - 1);
            }
        }
    }

    public List<String> getNotificationLogs() {
        synchronized (notificationLogs) {
            return new ArrayList<>(notificationLogs);
        }
    }

    /**
     * Background Scheduler: Runs every 30 seconds to check for unacknowledged critical alerts.
     * Auto-escalates alerts that remain ACTIVE past the timeout window (2 minutes).
     */
    @Scheduled(fixedRate = 30000)
    public void checkUnacknowledgedAlertsForEscalation() {
        Date timeoutThreshold = new Date(System.currentTimeMillis() - ESCALATION_TIMEOUT_MS);
        List<Alert> staleAlerts = alertRepository.findByStatusAndCreatedTimeBefore("ACTIVE", timeoutThreshold);

        if (staleAlerts != null && !staleAlerts.isEmpty()) {
            for (Alert alert : staleAlerts) {
                alert.setStatus("ESCALATED");
                alert.setEscalated(true);
                alert.setEscalatedTime(new Date());
                alertRepository.save(alert);

                logger.warn("⏰ [AUTO-ESCALATION TIMEOUT] Alert ID {} for Patient {} auto-escalated to ESCALATED status (Unacknowledged > 2 min)",
                        alert.getId(), alert.getPatientId());
            }
        }
    }
}
