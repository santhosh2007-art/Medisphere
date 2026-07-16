package com.infosys.aipredictionservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PredictionResponse {
    private String patientId;
    private double riskPercentage;
    private String riskLevel;
    private int confidence;
}
