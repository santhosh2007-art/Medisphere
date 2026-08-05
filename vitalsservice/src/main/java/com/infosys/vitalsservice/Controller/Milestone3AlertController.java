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
    public ResponseEntity<Alert> triggerAbnormalAlert() {
        VitalSimulatorDTO vitals = new VitalSimulatorDTO();
        vitals.setPatientId("35f51e3e-66fd-4f87-85ad-affa0dde1156");
        vitals.setName("Santhosh Kumar");
        vitals.setHeartRate(158);
        vitals.setSystolicBp(185);
        vitals.setDiastolicBp(112);
        vitals.setBloodPressure("185/112");
        vitals.setSpO2(84.5);
        vitals.setBodyTemperature(39.5);
        vitals.setBloodSugar(165.0);
        vitals.setActivityState("REST");
        vitals.setIsAbnormal(true);

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
