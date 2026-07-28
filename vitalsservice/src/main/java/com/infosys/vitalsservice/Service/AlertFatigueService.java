package com.infosys.vitalsservice.Service;

import com.infosys.vitalsservice.Entity.Alert;
import com.infosys.vitalsservice.Repository.AlertRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class AlertFatigueService {

    @Autowired
    private AlertRepository alertRepository;

    // Configurable suppression window in milliseconds (5 minutes = 300,000 ms)
    private static final long SUPPRESSION_WINDOW_MS = 5 * 60 * 1000;

    /**
     * Checks if a duplicate alert of the same type was created for this patient
     * within the last 5 minutes. Returns true if duplicate should be suppressed.
     */
    public boolean shouldSuppressAlert(String patientId, String alertType) {
        if (patientId == null || alertType == null) return false;

        Date fiveMinutesAgo = new Date(System.currentTimeMillis() - SUPPRESSION_WINDOW_MS);
        List<Alert> recentAlerts = alertRepository.findByPatientIdAndAlertTypeAndCreatedTimeAfter(
                patientId, alertType, fiveMinutesAgo);

        // If recent alert exists for same patient and type, suppress duplicate
        return recentAlerts != null && !recentAlerts.isEmpty();
    }
}
