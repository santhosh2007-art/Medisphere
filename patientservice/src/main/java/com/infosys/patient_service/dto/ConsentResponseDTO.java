package com.infosys.patient_service.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class ConsentResponseDTO {

    private UUID consentId;
    private UUID patientId;
    private String consenttype;
    private String status;
    private LocalDate granteddate;
    private LocalDate expirydate;
}