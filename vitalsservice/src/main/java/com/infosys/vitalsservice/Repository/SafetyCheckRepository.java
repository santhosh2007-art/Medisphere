package com.infosys.vitalsservice.Repository;

import com.infosys.vitalsservice.Entity.SafetyCheckResult;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SafetyCheckRepository extends MongoRepository<SafetyCheckResult, String> {
    List<SafetyCheckResult> findByPatientIdOrderByCheckedAtDesc(String patientId);
}
