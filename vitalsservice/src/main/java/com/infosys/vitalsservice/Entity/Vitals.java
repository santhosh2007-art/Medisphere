package com.infosys.vitalsservice.Entity;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "vitals")
public class Vitals {
    @Id
    private UUID vitalsId;
    private UUID patientId;
    private int heartbeat;
    private String bloodpressure;
    private int oxygenlevel;
    private double bloodsuger;
    private int pulserate;
    private LocalDateTime recordedAt;

}
