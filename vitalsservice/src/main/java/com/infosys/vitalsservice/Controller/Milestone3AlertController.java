package com.infosys.vitalsservice.Controller;

import com.infosys.vitalsservice.Entity.Alert;
import com.infosys.vitalsservice.Service.AlertService;
import com.infosys.vitalsservice.Service.NotificationService;
import com.infosys.vitalsservice.Service.AnomalyDetectionEngine;
import com.infosys.vitalsservice.dto.AnomalyEventDTO;
import com.infosys.vitalsservice.dto.DashboardMetricsDTO;
import com.infosys.vitalsservice.dto.VitalSimulatorDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/vitals/alerts")
@CrossOrigin(origins = "*")
public class Milestone3AlertController {

    @Autowired
    private AlertService alertService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AnomalyDetectionEngine anomalyDetectionEngine;

    @GetMapping("/live")
    public ResponseEntity<List<Alert>> getLiveAlerts() {
        return ResponseEntity.ok(alertService.getRecentAlerts());
    }

    @PostMapping("/trigger-abnormal")
    public ResponseEntity<Alert> triggerAbnormalAlert(@RequestParam(required = false, defaultValue = "CARDIAC") String specialty) {
        String cleanType = (specialty != null && !specialty.trim().isEmpty() && !"ALL".equalsIgnoreCase(specialty)) 
                ? specialty.toUpperCase() : "CARDIAC";

        VitalSimulatorDTO vitals = new VitalSimulatorDTO();
        if ("OXYGEN".equals(cleanType)) {
            vitals.setPatientId("8a719c2d-12ef-45a8-912b-34567890abcd");
            vitals.setName("Anitha Ramesh");
            vitals.setHeartRate(112);
            vitals.setSystolicBp(128);
            vitals.setDiastolicBp(82);
            vitals.setBloodPressure("128/82");
            vitals.setSpO2(83.5); // Severe Hypoxia
            vitals.setBodyTemperature(37.0);
            vitals.setBloodSugar(142.0);
            vitals.setActivityState("WALKING");
            vitals.setIsAbnormal(true);
        } else if ("BLOOD_PRESSURE".equals(cleanType)) {
            vitals.setPatientId("9b820d3e-23fa-56b9-923c-45678901bcde");
            vitals.setName("Rajesh Kannan");
            vitals.setHeartRate(118);
            vitals.setSystolicBp(188);
            vitals.setDiastolicBp(116);
            vitals.setBloodPressure("188/116"); // Hypertensive Crisis
            vitals.setSpO2(95.5);
            vitals.setBodyTemperature(37.2);
            vitals.setBloodSugar(168.0);
            vitals.setActivityState("REST");
            vitals.setIsAbnormal(true);
        } else { // CARDIAC
            vitals.setPatientId("35f51e3e-66fd-4f87-85ad-affa0dde1156");
            vitals.setName("Santhosh Kumar");
            vitals.setHeartRate(164); // High Heart Rate Breach: HR > 130 bpm
            vitals.setSystolicBp(142);
            vitals.setDiastolicBp(90);
            vitals.setBloodPressure("142/90");
            vitals.setSpO2(94.5);
            vitals.setBodyTemperature(37.1);
            vitals.setBloodSugar(125.0);
            vitals.setActivityState("REST");
            vitals.setIsAbnormal(true);
        }

        AnomalyEventDTO anomaly = anomalyDetectionEngine.evaluateVitals(vitals);
        Alert created = alertService.processAnomalyDirect(anomaly);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/active")
    public ResponseEntity<List<Alert>> getActiveAlerts() {
        return ResponseEntity.ok(alertService.getActiveAlerts());
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Alert>> getPatientAlerts(@PathVariable String patientId) {
        return ResponseEntity.ok(alertService.getPatientAlerts(patientId));
    }

    @GetMapping("/metrics")
    public ResponseEntity<DashboardMetricsDTO> getDashboardMetrics() {
        return ResponseEntity.ok(alertService.getDashboardMetrics());
    }

    @PostMapping("/{id}/acknowledge")
    public ResponseEntity<Alert> acknowledgeAlert(
            @PathVariable String id,
            @RequestParam(required = false, defaultValue = "Dr. Specialist") String providerName) {
        Alert updated = alertService.acknowledgeAlert(id, providerName);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/visit")
    public ResponseEntity<Alert> markDoctorVisited(
            @PathVariable String id,
            @RequestParam(required = false, defaultValue = "Dr. Specialist") String doctorName) {
        Alert updated = alertService.markDoctorVisited(id, doctorName);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/disable")
    public ResponseEntity<Alert> disableAlert(@PathVariable String id) {
        Alert updated = alertService.disableAlert(id);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/escalate")
    public ResponseEntity<Alert> escalateAlert(@PathVariable String id) {
        Alert updated = alertService.escalateAlert(id);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/contact")
    public ResponseEntity<Map<String, Object>> contactPatient(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("alertId", id);
        response.put("action", "SIMULATED_PATIENT_CALL");
        response.put("message", "Simulated Telehealth Call initiated with patient. Provider connected.");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/notifications")
    public ResponseEntity<List<String>> getNotificationHistory() {
        return ResponseEntity.ok(notificationService.getNotificationLogs());
    }
}
