package com.infosys.vitalsservice.Entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Document(collection = "careplans")
public class Careplan {
    @Id
    private String id;
    private String patientId;
    private String riskPredictionId;
    private String status; // Draft, ProviderReview, Approved, Active, Completed, Cancelled
    private List<Goal> goals = new ArrayList<>();
    private List<Intervention> interventions = new ArrayList<>();
    private Date createdAt;
    private String createdBy;
    private String approvedBy;
    private Date approvedAt;
    private String signatureHash;
    private Integer version;
    private String ruleSetVersion;

    public Careplan() {
        this.status = "Draft";
        this.createdAt = new Date();
        this.version = 1;
        this.ruleSetVersion = "v1.0.0";
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }

    public String getRiskPredictionId() { return riskPredictionId; }
    public void setRiskPredictionId(String riskPredictionId) { this.riskPredictionId = riskPredictionId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public List<Goal> getGoals() { return goals; }
    public void setGoals(List<Goal> goals) { this.goals = goals; }

    public List<Intervention> getInterventions() { return interventions; }
    public void setInterventions(List<Intervention> interventions) { this.interventions = interventions; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }

    public Date getApprovedAt() { return approvedAt; }
    public void setApprovedAt(Date approvedAt) { this.approvedAt = approvedAt; }

    public String getSignatureHash() { return signatureHash; }
    public void setSignatureHash(String signatureHash) { this.signatureHash = signatureHash; }

    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }

    public String getRuleSetVersion() { return ruleSetVersion; }
    public void setRuleSetVersion(String ruleSetVersion) { this.ruleSetVersion = ruleSetVersion; }
}
