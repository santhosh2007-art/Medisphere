package com.infosys.vitalsservice.Entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Document(collection = "safety_check_results")
public class SafetyCheckResult {
    @Id
    private String id;
    private String patientId;
    private String severity; // None, Minor, Moderate, Major, Contraindicated
    private List<String> warnings = new ArrayList<>();
    private Date checkedAt;
    private String source;

    public SafetyCheckResult() {
        this.checkedAt = new Date();
        this.source = "Clinical Drug Interaction Service v1.0";
    }

    public SafetyCheckResult(String patientId, String severity, List<String> warnings) {
        this();
        this.patientId = patientId;
        this.severity = severity;
        this.warnings = warnings != null ? warnings : new ArrayList<>();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public List<String> getWarnings() { return warnings; }
    public void setWarnings(List<String> warnings) { this.warnings = warnings; }

    public Date getCheckedAt() { return checkedAt; }
    public void setCheckedAt(Date checkedAt) { this.checkedAt = checkedAt; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
}
