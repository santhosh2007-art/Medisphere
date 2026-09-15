package com.infosys.vitalsservice.Repository;

import com.infosys.vitalsservice.Entity.Careplan;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CareplanRepository extends MongoRepository<Careplan, String> {
    List<Careplan> findByPatientId(String patientId);
    List<Careplan> findByPatientIdOrderByCreatedAtDesc(String patientId);
    List<Careplan> findByStatus(String status);
    Optional<Careplan> findTopByPatientIdAndStatusOrderByCreatedAtDesc(String patientId, String status);
}
