package com.infosys.patient_service.Service;

import com.infosys.patient_service.Entity.AuditLog;
import com.infosys.patient_service.Repository.AuditLogRepository;
import com.infosys.patient_service.dto.AuditLogResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Records important actions performed on patient data so that there is a
 * simple, HIPAA-style audit trail that can be reviewed later.
 */
@Service
public class AuditService {

    @Autowired
    private AuditLogRepository repository;

    public void log(UUID patientId, String action, String performedBy, String details) {

        AuditLog auditLog = new AuditLog();

        auditLog.setAuditId(UUID.randomUUID());
        auditLog.setPatientId(patientId);
        auditLog.setAction(action);
        auditLog.setPerformedBy(performedBy);
        auditLog.setDetails(details);
        auditLog.setTimestamp(LocalDateTime.now());

        repository.save(auditLog);
    }

    public List<AuditLogResponseDTO> getHistory(UUID patientId) {

        return repository.findByPatientIdOrderByTimestampDesc(patientId)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    private AuditLogResponseDTO mapToDTO(AuditLog auditLog) {

        AuditLogResponseDTO dto = new AuditLogResponseDTO();

        dto.setAuditId(auditLog.getAuditId());
        dto.setPatientId(auditLog.getPatientId());
        dto.setAction(auditLog.getAction());
        dto.setPerformedBy(auditLog.getPerformedBy());
        dto.setDetails(auditLog.getDetails());
        dto.setTimestamp(auditLog.getTimestamp());

        return dto;
    }
}
