package com.infosys.vitalsservice.dto;

public class DashboardMetricsDTO {
    private long alertsToday;
    private int wearablesOnline;
    private String avgResponseTime;
    private long activeAlerts;
    private double precisionRate;      // e.g. 89.4%
    private double falseAlertRate;     // e.g. 2.1%
    private String simulatorStatus;    // CONNECTED / DISCONNECTED

    public DashboardMetricsDTO() {
        this.wearablesOnline = 3;
        this.avgResponseTime = "1.8 min";
        this.precisionRate = 89.4;
        this.falseAlertRate = 2.1;
        this.simulatorStatus = "CONNECTED";
    }

    public long getAlertsToday() {
        return alertsToday;
    }

    public void setAlertsToday(long alertsToday) {
        this.alertsToday = alertsToday;
    }

    public int getWearablesOnline() {
        return wearablesOnline;
    }

    public void setWearablesOnline(int wearablesOnline) {
        this.wearablesOnline = wearablesOnline;
    }

    public String getAvgResponseTime() {
        return avgResponseTime;
    }

    public void setAvgResponseTime(String avgResponseTime) {
        this.avgResponseTime = avgResponseTime;
    }

    public long getActiveAlerts() {
        return activeAlerts;
    }

    public void setActiveAlerts(long activeAlerts) {
        this.activeAlerts = activeAlerts;
    }

    public double getPrecisionRate() {
        return precisionRate;
    }

    public void setPrecisionRate(double precisionRate) {
        this.precisionRate = precisionRate;
    }

    public double getFalseAlertRate() {
        return falseAlertRate;
    }

    public void setFalseAlertRate(double falseAlertRate) {
        this.falseAlertRate = falseAlertRate;
    }

    public String getSimulatorStatus() {
        return simulatorStatus;
    }

    public void setSimulatorStatus(String simulatorStatus) {
        this.simulatorStatus = simulatorStatus;
    }
}
