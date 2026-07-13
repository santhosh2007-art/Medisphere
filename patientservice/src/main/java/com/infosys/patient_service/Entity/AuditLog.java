package com.infosys.patient_service.Entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Simple audit trail entry.
 * Records important actions (view / create / update / delete / consent change)
 * so that access to patient data can be reviewed later (HIPAA-style logging).
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "auditlog")
public class AuditLog {

    @Id
    private UUID auditId;

    private UUID patientId;

    // e.g. VIEW_PATIENT_360, CREATE_PATIENT, UPDATE_PATIENT, DELETE_PATIENT, ACCESS_DENIED_NO_CONSENT
    private String action;

    private String performedBy;

    private String details;

    private LocalDateTime timestamp;
}
