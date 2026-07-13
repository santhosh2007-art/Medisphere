package com.infosys.patient_service.dto;

import lombok.Data;

import java.util.List;

@Data
public class Patient360Response {

    private PatientResponseDTO patient;
    private HealthTwinResponseDTO healthTwin;
    private ConsentResponseDTO consent;
    private VitalsResponseDTO vitals;
    private List<AuditLogResponseDTO> auditHistory;

    // true only when the patient has an active ("GRANTED") consent record
    private boolean consentVerified;

    // explains why sensitive data (healthTwin / vitals) was withheld, if at all
    private String message;
}
