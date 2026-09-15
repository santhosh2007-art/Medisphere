package com.infosys.vitalsservice.Repository;

import com.infosys.vitalsservice.Entity.PopulationOutcomeMetric;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PopulationOutcomeRepository extends MongoRepository<PopulationOutcomeMetric, String> {
    Optional<PopulationOutcomeMetric> findTopByOrderByCalculatedAtDesc();
    Optional<PopulationOutcomeMetric> findByPeriod(String period);
}
