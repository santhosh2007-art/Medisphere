package com.infosys.modelservice.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "models")
public class ModelInfo {

    @Id
    private String version;
    private double accuracy;
    private String createdDate;
    private String status;
}
