package com.infosys.vitalsservice.Repository;

import com.infosys.vitalsservice.Entity.AdherenceLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdherenceLogRepository extends MongoRepository<AdherenceLog, String> {
    List<AdherenceLog> findByCareplanId(String careplanId);
    List<AdherenceLog> findByCareplanIdOrderByLoggedAtDesc(String careplanId);
}
