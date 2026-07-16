package com.infosys.aipredictionservice.repository;

import com.infosys.aipredictionservice.entity.RiskPrediction;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PredictionRepository extends MongoRepository<RiskPrediction, UUID> {
    List<RiskPrediction> findByPatientId(String patientId);
    List<RiskPrediction> findByPatientIdOrderByPredictionDateDesc(String patientId);
}
