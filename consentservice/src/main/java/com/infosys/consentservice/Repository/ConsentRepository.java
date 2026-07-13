package com.infosys.consentservice.Repository;

import com.infosys.consentservice.Entity.Consent;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ConsentRepository extends MongoRepository<Consent, UUID> {
    List<Consent> findByPatientId(UUID patientId);
}
