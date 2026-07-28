package com.infosys.vitalsservice.Repository;

import com.infosys.vitalsservice.Entity.Alert;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface AlertRepository extends MongoRepository<Alert, String> {

    List<Alert> findByPatientIdOrderByCreatedTimeDesc(String patientId);

    List<Alert> findTop20ByOrderByCreatedTimeDesc();

    List<Alert> findByStatusOrderByCreatedTimeDesc(String status);

    List<Alert> findByPatientIdAndAlertTypeAndCreatedTimeAfter(String patientId, String alertType, Date createdTimeAfter);

    List<Alert> findByStatusAndCreatedTimeBefore(String status, Date createdTimeBefore);

    long countByCreatedTimeAfter(Date createdTimeAfter);
    
    long countByStatus(String status);
}
