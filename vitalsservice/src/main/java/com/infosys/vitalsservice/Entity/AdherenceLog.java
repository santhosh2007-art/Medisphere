package com.infosys.vitalsservice.Entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "adherence_logs")
public class AdherenceLog {
    @Id
    private String id;
    private String careplanId;
    private String interventionId;
    private String type; // MedicationTaken, MonitoringReading
    private Date loggedAt;
    private Date expectedAt;
    private String value;
    private String status; // OnTime, Late, Missed

    public AdherenceLog() {
        this.loggedAt = new Date();
    }

    public AdherenceLog(String careplanId, String interventionId, String type, Date expectedAt, String value, String status) {
        this.careplanId = careplanId;
        this.interventionId = interventionId;
        this.type = type;
        this.loggedAt = new Date();
        this.expectedAt = expectedAt;
        this.value = value;
        this.status = status;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCareplanId() { return careplanId; }
    public void setCareplanId(String careplanId) { this.careplanId = careplanId; }

    public String getInterventionId() { return interventionId; }
    public void setInterventionId(String interventionId) { this.interventionId = interventionId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Date getLoggedAt() { return loggedAt; }
    public void setLoggedAt(Date loggedAt) { this.loggedAt = loggedAt; }

    public Date getExpectedAt() { return expectedAt; }
    public void setExpectedAt(Date expectedAt) { this.expectedAt = expectedAt; }

    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
