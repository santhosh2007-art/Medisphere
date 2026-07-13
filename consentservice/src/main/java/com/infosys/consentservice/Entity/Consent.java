package com.infosys.consentservice.Entity;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "consent")

public class Consent {
    @Id
    private UUID consentId;
    private UUID patientId;
    private String consenttype;
    private String status;
    private LocalDate granteddate;
    private LocalDate expirydate;
}
