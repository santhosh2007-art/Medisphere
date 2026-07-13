package com.infosys.healthtwinservice.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class HealthTwinRequestDTO {

    @NotNull(message = "Patient Id is required")
    private UUID patientId;

    @NotBlank(message = "Blood Group is required")
    private String bloodgroup;

    @DecimalMin(value = "30.0", message = "Height must be greater than 30 cm")
    @DecimalMax(value = "300.0", message = "Height must be less than 300 cm")
    private double height;

    @DecimalMin(value = "1.0", message = "Weight must be greater than 1 kg")
    @DecimalMax(value = "500.0", message = "Weight must be less than 500 kg")
    private double weight;

    @DecimalMin(value = "90.0", message = "Temperature must be greater than 90°F")
    @DecimalMax(value = "110.0", message = "Temperature must be less than 110°F")
    private Double temperature;

    @NotBlank(message = "Disease field cannot be empty")
    private String disease;

}