package com.infosys.vitalsservice.Repository;

import com.infosys.vitalsservice.Entity.RiskTrendPoint;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RiskTrendRepository extends MongoRepository<RiskTrendPoint, String> {
    List<RiskTrendPoint> findByCareplanIdOrderByRecordedAtAsc(String careplanId);
    List<RiskTrendPoint> findByPatientIdOrderByRecordedAtAsc(String patientId);
}
