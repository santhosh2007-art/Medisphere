package com.infosys.vitalsservice.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.UUID;

@Data
public class VitalsRequestDTO {

    @NotNull(message = "Patient Id is required")
    private UUID patientId;

    @Min(value = 30, message = "Heartbeat must be at least 30 bpm")
    @Max(value = 220, message = "Heartbeat cannot exceed 220 bpm")
    private int heartbeat;

    @NotBlank(message = "Blood Pressure is required")
    private String bloodpressure;

    @Min(value = 50, message = "Oxygen Level must be at least 50%")
    @Max(value = 100, message = "Oxygen Level cannot exceed 100%")
    private int oxygenlevel;

    @DecimalMin(value = "40.0", message = "Blood Sugar must be at least 40")
    @DecimalMax(value = "600.0", message = "Blood Sugar cannot exceed 600")
    private double bloodsuger;

    @Min(value = 30, message = "Pulse Rate must be at least 30 bpm")
    @Max(value = 220, message = "Pulse Rate cannot exceed 220 bpm")
    private int pulserate;
}