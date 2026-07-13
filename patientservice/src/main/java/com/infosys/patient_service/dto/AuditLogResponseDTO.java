package com.infosys.patient_service.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class AuditLogResponseDTO {

    private UUID auditId;
    private UUID patientId;
    private String action;
    private String performedBy;
    private String details;
    private LocalDateTime timestamp;
}
