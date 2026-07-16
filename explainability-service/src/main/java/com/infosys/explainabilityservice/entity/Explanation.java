package com.infosys.explainabilityservice.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "explanations")
public class Explanation {

    @Id
    private UUID id;
    private String patientId;
    private String risk;
    private List<String> topFactors;
    private List<String> factors;
}
