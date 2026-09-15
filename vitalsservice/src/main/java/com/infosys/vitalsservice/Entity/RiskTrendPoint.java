package com.infosys.vitalsservice.Entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "risk_trend_points")
public class RiskTrendPoint {
    @Id
    private String id;
    private String careplanId;
    private String patientId;
    private String riskPredictionId;
    private Double riskValue;
    private Double baselineRiskValue;
    private Double deltaFromBaseline;
    private Date recordedAt;

    public RiskTrendPoint() {
        this.recordedAt = new Date();
    }

    public RiskTrendPoint(String careplanId, String patientId, String riskPredictionId, Double riskValue, Double baselineRiskValue) {
        this.careplanId = careplanId;
        this.patientId = patientId;
        this.riskPredictionId = riskPredictionId;
        this.riskValue = riskValue;
        this.baselineRiskValue = baselineRiskValue;
        this.deltaFromBaseline = (riskValue != null && baselineRiskValue != null) ? Math.round((riskValue - baselineRiskValue) * 100.0) / 100.0 : 0.0;
        this.recordedAt = new Date();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCareplanId() { return careplanId; }
    public void setCareplanId(String careplanId) { this.careplanId = careplanId; }

    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }

    public String getRiskPredictionId() { return riskPredictionId; }
    public void setRiskPredictionId(String riskPredictionId) { this.riskPredictionId = riskPredictionId; }

    public Double getRiskValue() { return riskValue; }
    public void setRiskValue(Double riskValue) { this.riskValue = riskValue; }

    public Double getBaselineRiskValue() { return baselineRiskValue; }
    public void setBaselineRiskValue(Double baselineRiskValue) { this.baselineRiskValue = baselineRiskValue; }

    public Double getDeltaFromBaseline() { return deltaFromBaseline; }
    public void setDeltaFromBaseline(Double deltaFromBaseline) { this.deltaFromBaseline = deltaFromBaseline; }

    public Date getRecordedAt() { return recordedAt; }
    public void setRecordedAt(Date recordedAt) { this.recordedAt = recordedAt; }
}
