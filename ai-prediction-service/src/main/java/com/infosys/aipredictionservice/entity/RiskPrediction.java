package com.infosys.aipredictionservice.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "risk_predictions")
public class RiskPrediction {

    @Id
    private UUID id;
    private String patientId;
    private String riskType;
    private double riskPercentage;
    private String riskLevel;
    private int confidence;
    private String predictionDate;
    private String modelVersion;
}
