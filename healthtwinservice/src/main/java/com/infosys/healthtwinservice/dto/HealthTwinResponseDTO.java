package com.infosys.healthtwinservice.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class HealthTwinResponseDTO {

    private UUID twinId;
    private UUID patientId;
    private String bloodgroup;
    private double height;
    private double weight;
    private Double temperature;
    private String disease;

}