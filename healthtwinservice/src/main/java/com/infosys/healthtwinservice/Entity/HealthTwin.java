package com.infosys.healthtwinservice.Entity;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "healthtwin")
public class HealthTwin {

    @Id
    private UUID twinId;
    private UUID patientId;
    private String bloodgroup;
    private double height;
    private double weight;
    private Double temperature;
    private String disease;
}
