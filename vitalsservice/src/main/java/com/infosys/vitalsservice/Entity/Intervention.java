package com.infosys.vitalsservice.Entity;

import java.util.UUID;

public class Intervention {
    private String id;
    private String careplanId;
    private String type; // Medication, Monitoring, Lifestyle, Referral
    private String description;
    private MedicationDetails medicationDetails; // Present if type == Medication
    private String safetyCheckStatus; // Pending, Passed, Failed, Overridden
    private String safetyCheckResultId;
    private String overrideReason;
    private String overriddenBy;
    private String overriddenAt;
    private String sourceRuleId;

    public Intervention() {
        this.id = UUID.randomUUID().toString();
        this.safetyCheckStatus = "Pending";
    }

    public Intervention(String type, String description, MedicationDetails medicationDetails, String sourceRuleId) {
        this.id = UUID.randomUUID().toString();
        this.type = type;
        this.description = description;
        this.medicationDetails = medicationDetails;
        this.safetyCheckStatus = "Medication".equalsIgnoreCase(type) ? "Pending" : "Passed";
        this.sourceRuleId = sourceRuleId;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCareplanId() { return careplanId; }
    public void setCareplanId(String careplanId) { this.careplanId = careplanId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public MedicationDetails getMedicationDetails() { return medicationDetails; }
    public void setMedicationDetails(MedicationDetails medicationDetails) { this.medicationDetails = medicationDetails; }

    public String getSafetyCheckStatus() { return safetyCheckStatus; }
    public void setSafetyCheckStatus(String safetyCheckStatus) { this.safetyCheckStatus = safetyCheckStatus; }

    public String getSafetyCheckResultId() { return safetyCheckResultId; }
    public void setSafetyCheckResultId(String safetyCheckResultId) { this.safetyCheckResultId = safetyCheckResultId; }

    public String getOverrideReason() { return overrideReason; }
    public void setOverrideReason(String overrideReason) { this.overrideReason = overrideReason; }

    public String getOverriddenBy() { return overriddenBy; }
    public void setOverriddenBy(String overriddenBy) { this.overriddenBy = overriddenBy; }

    public String getOverriddenAt() { return overriddenAt; }
    public void setOverriddenAt(String overriddenAt) { this.overriddenAt = overriddenAt; }

    public String getSourceRuleId() { return sourceRuleId; }
    public void setSourceRuleId(String sourceRuleId) { this.sourceRuleId = sourceRuleId; }
}
