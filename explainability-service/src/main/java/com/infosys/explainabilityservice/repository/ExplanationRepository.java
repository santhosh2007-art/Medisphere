package com.infosys.explainabilityservice.repository;

import com.infosys.explainabilityservice.entity.Explanation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ExplanationRepository extends MongoRepository<Explanation, UUID> {
    List<Explanation> findByPatientId(String patientId);
}
