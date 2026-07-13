package com.infosys.healthtwinservice.Repository;

import com.infosys.healthtwinservice.Entity.HealthTwin;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
@Repository
public interface HealthTwinRepository extends MongoRepository<HealthTwin, UUID> {
    Optional<HealthTwin> findByPatientId(UUID patientId);
}
