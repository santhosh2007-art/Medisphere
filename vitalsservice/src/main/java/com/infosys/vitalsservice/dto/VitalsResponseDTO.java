package com.infosys.vitalsservice.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class VitalsResponseDTO {

    private UUID vitalsId;
    private UUID patientId;
    private int heartbeat;
    private String bloodpressure;
    private int oxygenlevel;
    private double bloodsuger;
    private int pulserate;
    private LocalDateTime recordedAt;
}