package com.infosys.patient_service.Repository;

import com.infosys.patient_service.Entity.Patient;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.UUID;

public interface PatientRepository extends MongoRepository<Patient, UUID> {


}