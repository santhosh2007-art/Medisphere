package com.infosys.patient_service.Repository;

import com.infosys.patient_service.Entity.AuditLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AuditLogRepository extends MongoRepository<AuditLog, UUID> {

    List<AuditLog> findByPatientIdOrderByTimestampDesc(UUID patientId);
}
