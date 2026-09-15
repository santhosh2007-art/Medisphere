package com.infosys.vitalsservice.Service;

import com.infosys.vitalsservice.Entity.Careplan;
import com.infosys.vitalsservice.Entity.Goal;
import com.infosys.vitalsservice.Entity.Intervention;
import com.infosys.vitalsservice.Entity.MedicationDetails;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CareplanRuleEngine {

    public static final String RULE_SET_VERSION = "v1.0.0-clinical-guidelines";

    public static class EvaluationContext {
        public String patientId;
        public String riskPredictionId;
        public String riskType; // CARDIO, DIABETES, RESPIRATORY, GENERAL
        public Double riskPercentage; // e.g. 24.5
        public String riskLevel; // LOW, MODERATE, HIGH, CRITICAL
        public Integer systolicBp;
        public Integer diastolicBp;
        public Integer heartRate;
        public Double spO2;
        public Double bloodSugar;

        public EvaluationContext() {}

        public EvaluationContext(String patientId, String riskPredictionId, String riskType, Double riskPercentage, String riskLevel, Integer systolicBp, Integer diastolicBp, Integer heartRate, Double spO2, Double bloodSugar) {
            this.patientId = patientId;
            this.riskPredictionId = riskPredictionId;
            this.riskType = riskType;
            this.riskPercentage = riskPercentage != null ? riskPercentage : 0.0;
            this.riskLevel = riskLevel != null ? riskLevel.toUpperCase() : "LOW";
            this.systolicBp = systolicBp != null ? systolicBp : 120;
            this.diastolicBp = diastolicBp != null ? diastolicBp : 80;
            this.heartRate = heartRate != null ? heartRate : 75;
            this.spO2 = spO2 != null ? spO2 : 98.0;
            this.bloodSugar = bloodSugar != null ? bloodSugar : 100.0;
        }
    }

    public Careplan generateCareplan(EvaluationContext ctx, String creatorId) {
        Careplan plan = new Careplan();
        plan.setPatientId(ctx.patientId);
        plan.setRiskPredictionId(ctx.riskPredictionId);
        plan.setStatus("Draft");
        plan.setCreatedBy(creatorId != null ? creatorId : "SYSTEM_RULE_ENGINE");
        plan.setRuleSetVersion(RULE_SET_VERSION);
        plan.setVersion(1);

        List<Goal> goals = new ArrayList<>();
        List<Intervention> interventions = new ArrayList<>();

        // Rule 1: CVD / Hypertension Breach (cvd-htn-001)
        if ("CARDIO".equalsIgnoreCase(ctx.riskType) || ctx.riskPercentage > 20.0 || ctx.systolicBp > 130 || ctx.diastolicBp > 85) {
            String ruleId = "cvd-htn-001";
            goals.add(new Goal(
                    "Reduce systolic BP to < 130 mmHg and diastolic BP to < 80 mmHg within 12 weeks",
                    "systolic_bp",
                    "<130",
                    12,
                    ruleId
            ));
            interventions.add(new Intervention(
                    "Medication",
                    "Initiate Antihypertensive therapy (Lisinopril 10mg daily orally)",
                    new MedicationDetails("Lisinopril", "ACE Inhibitor", "10mg", "Daily", "Oral"),
                    ruleId
            ));
            interventions.add(new Intervention(
                    "Monitoring",
                    "Weekly home blood pressure logging via wearable telemetry",
                    null,
                    ruleId
            ));
        }

        // Rule 2: Diabetes / Glycemic Elevation (diab-risk-002)
        if ("DIABETES".equalsIgnoreCase(ctx.riskType) || ctx.bloodSugar > 140.0 || (ctx.riskPercentage > 15.0 && "DIABETES".equalsIgnoreCase(ctx.riskType))) {
            String ruleId = "diab-risk-002";
            goals.add(new Goal(
                    "Maintain fasting glucose < 110 mg/dL and HbA1c < 6.5% within 8 weeks",
                    "blood_sugar",
                    "<110",
                    8,
                    ruleId
            ));
            interventions.add(new Intervention(
                    "Medication",
                    "Initiate Metformin 500mg twice daily with meals",
                    new MedicationDetails("Metformin", "Biguanide", "500mg", "BID (Twice Daily)", "Oral"),
                    ruleId
            ));
            interventions.add(new Intervention(
                    "Lifestyle",
                    "Low-glycemic Mediterranean dietary plan & 30-minute daily walking regimen",
                    null,
                    ruleId
            ));
        }

        // Rule 3: Oxygen Desaturation / Respiratory Impairment (oxygen-hypoxia-003)
        if ("RESPIRATORY".equalsIgnoreCase(ctx.riskType) || ctx.spO2 < 92.0) {
            String ruleId = "oxygen-hypoxia-003";
            goals.add(new Goal(
                    "Maintain continuous resting pulse oximetry SpO2 >= 95%",
                    "spO2",
                    ">=95%",
                    4,
                    ruleId
            ));
            interventions.add(new Intervention(
                    "Monitoring",
                    "Continuous SpO2 continuous pulse oximeter monitoring with automated alert triggers",
                    null,
                    ruleId
            ));
            interventions.add(new Intervention(
                    "Referral",
                    "Urgent Pulmonology specialty consultation & pulmonary function evaluation",
                    null,
                    ruleId
            ));
        }

        // Rule 4: Tachycardia / Arrhythmia Flag (cardiac-tachy-004)
        if (ctx.heartRate > 100) {
            String ruleId = "cardiac-tachy-004";
            goals.add(new Goal(
                    "Maintain resting heart rate between 60 - 90 bpm within 4 weeks",
                    "heart_rate",
                    "60-90",
                    4,
                    ruleId
            ));
            interventions.add(new Intervention(
                    "Medication",
                    "Administer Beta-Blocker therapy (Metoprolol Succinate 25mg daily)",
                    new MedicationDetails("Metoprolol", "Beta Blocker", "25mg", "Daily", "Oral"),
                    ruleId
            ));
        }

        // Rule 5: Fallback for High-Risk Cases with No Matched Guidelines (FALLBACK-HIGH-RISK-000)
        if (goals.isEmpty() && (ctx.riskPercentage >= 20.0 || "HIGH".equalsIgnoreCase(ctx.riskLevel) || "CRITICAL".equalsIgnoreCase(ctx.riskLevel))) {
            String ruleId = "FALLBACK-HIGH-RISK-000";
            goals.add(new Goal(
                    "High-risk clinical profile requiring multidisciplinary specialist baseline assessment within 1 week",
                    "clinical_risk_pct",
                    "<15%",
                    2,
                    ruleId
            ));
            interventions.add(new Intervention(
                    "Referral",
                    "Multidisciplinary Care Coordinator review & comprehensive clinical panel evaluation",
                    null,
                    ruleId
            ));
        }

        // Ensure all goals and interventions have careplanId set when attached
        for (Goal g : goals) {
            g.setCareplanId(plan.getId());
        }
        for (Intervention i : interventions) {
            i.setCareplanId(plan.getId());
        }

        plan.setGoals(goals);
        plan.setInterventions(interventions);
        return plan;
    }
}
