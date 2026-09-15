package com.infosys.vitalsservice.Entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "population_outcome_metrics")
public class PopulationOutcomeMetric {
    @Id
    private String id;
    private String period; // e.g. "2026-Q3", "MONTHLY_2026_08"
    private Integer cohortSize;
    private Double estimatedHospitalizationsPrevented; // Modeled projection
    private String methodologyVersion;
    private Date calculatedAt;

    public PopulationOutcomeMetric() {
        this.calculatedAt = new Date();
        this.methodologyVersion = "v1.0-modeled-projection";
    }

    public PopulationOutcomeMetric(String period, Integer cohortSize, Double estimatedHospitalizationsPrevented) {
        this();
        this.period = period;
        this.cohortSize = cohortSize;
        this.estimatedHospitalizationsPrevented = estimatedHospitalizationsPrevented;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPeriod() { return period; }
    public void setPeriod(String period) { this.period = period; }

    public Integer getCohortSize() { return cohortSize; }
    public void setCohortSize(Integer cohortSize) { this.cohortSize = cohortSize; }

    public Double getEstimatedHospitalizationsPrevented() { return estimatedHospitalizationsPrevented; }
    public void setEstimatedHospitalizationsPrevented(Double estimatedHospitalizationsPrevented) {
        this.estimatedHospitalizationsPrevented = estimatedHospitalizationsPrevented;
    }

    public String getMethodologyVersion() { return methodologyVersion; }
    public void setMethodologyVersion(String methodologyVersion) { this.methodologyVersion = methodologyVersion; }

    public Date getCalculatedAt() { return calculatedAt; }
    public void setCalculatedAt(Date calculatedAt) { this.calculatedAt = calculatedAt; }
}
