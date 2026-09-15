package com.infosys.vitalsservice.Entity;

import java.util.UUID;

public class Goal {
    private String id;
    private String careplanId;
    private String description;
    private String metric;
    private String targetValue;
    private String targetDate;
    private Integer targetWindowWeeks;
    private String sourceRuleId;

    public Goal() {
        this.id = UUID.randomUUID().toString();
    }

    public Goal(String description, String metric, String targetValue, Integer targetWindowWeeks, String sourceRuleId) {
        this.id = UUID.randomUUID().toString();
        this.description = description;
        this.metric = metric;
        this.targetValue = targetValue;
        this.targetWindowWeeks = targetWindowWeeks;
        this.sourceRuleId = sourceRuleId;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCareplanId() { return careplanId; }
    public void setCareplanId(String careplanId) { this.careplanId = careplanId; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getMetric() { return metric; }
    public void setMetric(String metric) { this.metric = metric; }

    public String getTargetValue() { return targetValue; }
    public void setTargetValue(String targetValue) { this.targetValue = targetValue; }

    public String getTargetDate() { return targetDate; }
    public void setTargetDate(String targetDate) { this.targetDate = targetDate; }

    public Integer getTargetWindowWeeks() { return targetWindowWeeks; }
    public void setTargetWindowWeeks(Integer targetWindowWeeks) { this.targetWindowWeeks = targetWindowWeeks; }

    public String getSourceRuleId() { return sourceRuleId; }
    public void setSourceRuleId(String sourceRuleId) { this.sourceRuleId = sourceRuleId; }
}
