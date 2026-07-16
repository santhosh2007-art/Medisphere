package com.infosys.explainabilityservice.service;

import com.infosys.explainabilityservice.entity.Explanation;
import com.infosys.explainabilityservice.repository.ExplanationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ExplanationService {

    @Autowired
    private ExplanationRepository repository;

    private final RestTemplate restTemplate = new RestTemplate();

    public Explanation generateExplanation(String patientId) {
        // Fetch patient details and compute contributing factors dynamically
        int age = getPatientAge(patientId);
        double bmi = getPatientBmi(patientId);
        String disease = getPatientDisease(patientId).toLowerCase();

        List<String> topFactors = new ArrayList<>();
        List<String> factors = new ArrayList<>();

        if (age > 60) {
            topFactors.add("Age");
            factors.add("Age > 60: +15");
        }
        if (disease.contains("hypertension") || disease.contains("bp") || disease.contains("blood pressure")) {
            topFactors.add("Blood Pressure");
            factors.add("Blood Pressure > 140: +20");
        }
        if (bmi > 30) {
            topFactors.add("BMI");
            factors.add("BMI > 30: +15");
        }
        if (disease.contains("diabetes") || disease.contains("sugar") || disease.contains("hba1c")) {
            topFactors.add("HbA1c");
            factors.add("HbA1c > 7: +20");
        }
        if (disease.contains("cholesterol") || disease.contains("lipid")) {
            topFactors.add("Cholesterol");
            factors.add("Cholesterol > 220: +20");
        }
        if (disease.contains("tachycardia") || disease.contains("heart rate") || disease.contains("cardiac")) {
            topFactors.add("Heart Rate");
            factors.add("Heart Rate > 110: +10");
        }

        // Default factors if none are triggered
        if (factors.isEmpty()) {
            factors.add("Age < 45: Normal Baseline");
            factors.add("BMI < 25: Normal Weight");
            factors.add("Vitals: Steady Range");
        }

        // Determine risk level based on number of active risk factors
        String risk = "LOW";
        if (factors.size() >= 4) {
            risk = "HIGH";
        } else if (factors.size() >= 2) {
            risk = "MEDIUM";
        }

        // Clean up old explanations for the same patient to keep database tidy
        List<Explanation> existing = repository.findByPatientId(patientId);
        if (!existing.isEmpty()) {
            repository.deleteAll(existing);
        }

        Explanation exp = new Explanation();
        exp.setId(UUID.randomUUID());
        exp.setPatientId(patientId);
        exp.setRisk(risk);
        exp.setTopFactors(topFactors);
        exp.setFactors(factors);

        return repository.save(exp);
    }

    public Explanation getExplanation(String patientId) {
        List<Explanation> list = repository.findByPatientId(patientId);
        if (list.isEmpty()) {
            // Auto generate if not exists
            return generateExplanation(patientId);
        }
        return list.get(0);
    }

    private int getPatientAge(String patientId) {
        try {
            Map patient = restTemplate.getForObject("http://localhost:8081/patient/" + patientId, Map.class);
            if (patient != null && patient.get("dob") != null) {
                LocalDate dob = LocalDate.parse(patient.get("dob").toString());
                return Period.between(dob, LocalDate.now()).getYears();
            }
        } catch (Exception e) {
            // fallback
        }
        return 45;
    }

    private double getPatientBmi(String patientId) {
        try {
            Map twin = restTemplate.getForObject("http://localhost:8082/healthtwin/patient/" + patientId, Map.class);
            if (twin != null && twin.get("height") != null && twin.get("weight") != null) {
                double height = Double.parseDouble(twin.get("height").toString());
                double weight = Double.parseDouble(twin.get("weight").toString());
                if (height > 0) {
                    return weight / Math.pow(height / 100, 2);
                }
            }
        } catch (Exception e) {
            // fallback
        }
        return 24.5;
    }

    private String getPatientDisease(String patientId) {
        try {
            Map twin = restTemplate.getForObject("http://localhost:8082/healthtwin/patient/" + patientId, Map.class);
            if (twin != null && twin.get("disease") != null) {
                return twin.get("disease").toString();
            }
        } catch (Exception e) {
            // fallback
        }
        return "None";
    }
}
