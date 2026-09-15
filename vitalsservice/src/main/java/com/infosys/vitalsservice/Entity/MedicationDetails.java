package com.infosys.vitalsservice.Entity;

public class MedicationDetails {
    private String drugName;
    private String drugClass;
    private String dosage;
    private String frequency;
    private String route;

    public MedicationDetails() {}

    public MedicationDetails(String drugName, String drugClass, String dosage, String frequency, String route) {
        this.drugName = drugName;
        this.drugClass = drugClass;
        this.dosage = dosage;
        this.frequency = frequency;
        this.route = route;
    }

    public String getDrugName() { return drugName; }
    public void setDrugName(String drugName) { this.drugName = drugName; }

    public String getDrugClass() { return drugClass; }
    public void setDrugClass(String drugClass) { this.drugClass = drugClass; }

    public String getDosage() { return dosage; }
    public void setDosage(String dosage) { this.dosage = dosage; }

    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }

    public String getRoute() { return route; }
    public void setRoute(String route) { this.route = route; }
}
