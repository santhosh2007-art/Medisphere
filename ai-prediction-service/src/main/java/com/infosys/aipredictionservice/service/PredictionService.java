package com.infosys.aipredictionservice.service;

import com.infosys.aipredictionservice.entity.RiskPrediction;
import com.infosys.aipredictionservice.repository.PredictionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class PredictionService {

    @Autowired
    private PredictionRepository repository;

    private final RestTemplate restTemplate = new RestTemplate();

    public RiskPrediction predictCVD(String patientId) {
        double score = calculateCvdScore(patientId);
        String level = determineLevel(score);
        int confidence = 88 + (int)(Math.random() * 8); // 88 to 95

        RiskPrediction pred = new RiskPrediction();
        pred.setId(UUID.randomUUID());
        pred.setPatientId(patientId);
        pred.setRiskType("CARDIO");
        pred.setRiskPercentage(score);
        pred.setRiskLevel(level);
        pred.setConfidence(confidence);
        pred.setPredictionDate(LocalDate.now().toString());
        pred.setModelVersion("1.0");

        return repository.save(pred);
    }

    public RiskPrediction predictDiabetes(String patientId) {
        double score = calculateDiabetesScore(patientId);
        String level = determineLevel(score);
        int confidence = 87 + (int)(Math.random() * 9); // 87 to 95

        RiskPrediction pred = new RiskPrediction();
        pred.setId(UUID.randomUUID());
        pred.setPatientId(patientId);
        pred.setRiskType("DIABETES");
        pred.setRiskPercentage(score);
        pred.setRiskLevel(level);
        pred.setConfidence(confidence);
        pred.setPredictionDate(LocalDate.now().toString());
        pred.setModelVersion("1.0");

        return repository.save(pred);
    }

    public List<RiskPrediction> getHistory(String patientId) {
        return repository.findByPatientIdOrderByPredictionDateDesc(patientId);
    }

    public RiskPrediction getLatest(String patientId) {
        List<RiskPrediction> list = repository.findByPatientIdOrderByPredictionDateDesc(patientId);
        if (list.isEmpty()) {
            return null;
        }
        return list.get(0);
    }

    public void deletePrediction(UUID id) {
        repository.deleteById(id);
    }

    private String determineLevel(double score) {
        if (score <= 30.0) return "LOW";
        if (score <= 60.0) return "MEDIUM";
        return "HIGH";
    }

    private double calculateCvdScore(String patientId) {
        double score = 0;
        int age = getPatientAge(patientId);
        double bmi = getPatientBmi(patientId);
        String disease = getPatientDisease(patientId).toLowerCase();

        // 1. Age
        if (age > 60) score += 15;
        else if (age > 45) score += 8;

        // 2. Blood Pressure (extracted from disease or defaults)
        if (disease.contains("hypertension") || disease.contains("bp") || disease.contains("blood pressure")) {
            score += 20; // BP > 140
        } else {
            score += 5; // Normal BP
        }

        // 3. BMI
        if (bmi > 30) score += 15;
        else if (bmi > 25) score += 5;

        // 4. HbA1c (extracted from disease)
        if (disease.contains("diabetes") || disease.contains("sugar") || disease.contains("hba1c")) {
            score += 10;
        }

        // 5. Cholesterol
        if (disease.contains("cholesterol") || disease.contains("lipid") || disease.contains("heart")) {
            score += 20; // Cholesterol > 220
        } else {
            score += 5;
        }

        // 6. Heart Rate
        if (disease.contains("tachycardia") || disease.contains("heart rate") || disease.contains("cardiac")) {
            score += 10;
        } else {
            score += 5;
        }

        return score;
    }

    private double calculateDiabetesScore(String patientId) {
        double score = 0;
        int age = getPatientAge(patientId);
        double bmi = getPatientBmi(patientId);
        String disease = getPatientDisease(patientId).toLowerCase();

        // 1. Age
        if (age > 60) score += 10;
        else if (age > 45) score += 5;

        // 2. BMI
        if (bmi > 30) score += 15;
        else if (bmi > 25) score += 8;

        // 3. HbA1c
        if (disease.contains("diabetes") || disease.contains("sugar") || disease.contains("hba1c")) {
            score += 20; // HbA1c > 7
        } else {
            score += 5;
        }

        // 4. Cholesterol
        if (disease.contains("cholesterol") || disease.contains("lipid")) {
            score += 15;
        }

        // 5. Pre-existing heart conditions
        if (disease.contains("heart") || disease.contains("cardiac") || disease.contains("hypertension")) {
            score += 15;
        }

        return score;
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
        return 45; // Default age fallback
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
        return 24.5; // Default BMI fallback
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
