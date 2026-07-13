package com.infosys.patient_service.Service;

import com.infosys.patient_service.dto.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.UUID;

/**
 * Builds the Patient 360 dashboard by combining data from the other
 * microservices (Patient, Health Twin, Vitals, Consent) and the local
 * audit trail.
 *
 * Consent Management: sensitive clinical data (Health Twin & Vitals) is
 * only included when the patient has an active ("GRANTED") consent record.
 * Every view is written to the audit trail.
 */
@Service
public class Patient360Service {

    private static final Logger logger = LoggerFactory.getLogger(Patient360Service.class);

    private static final String GRANTED = "GRANTED";

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private AuditService auditService;

    public Patient360Response getPatient360(UUID patientId) {

        Patient360Response response = new Patient360Response();

        // 1. Basic patient information is always fetched.
        PatientResponseDTO patient = fetchPatient(patientId);
        response.setPatient(patient);

        // 2. Consent must be verified before releasing sensitive health data.
        ConsentResponseDTO consent = fetchConsent(patientId);
        response.setConsent(consent);

        boolean consentGranted = consent != null
                && GRANTED.equalsIgnoreCase(consent.getStatus());

        response.setConsentVerified(consentGranted);

        if (consentGranted) {
            response.setHealthTwin(fetchHealthTwin(patientId));
            response.setVitals(fetchVitals(patientId));
            response.setMessage("Consent verified - full patient record returned");

            auditService.log(patientId, "VIEW_PATIENT_360", "system",
                    "Patient 360 dashboard viewed with consent granted");
        } else {
            response.setMessage("Sensitive data withheld - patient consent is not GRANTED");

            auditService.log(patientId, "ACCESS_DENIED_NO_CONSENT", "system",
                    "Patient 360 dashboard viewed without active consent; sensitive data withheld");
        }

        // 3. Attach the audit history so it appears on the dashboard.
        response.setAuditHistory(auditService.getHistory(patientId));

        return response;
    }

    private PatientResponseDTO fetchPatient(UUID patientId) {
        try {
            return restTemplate.getForObject(
                    "http://localhost:8081/patient/" + patientId,
                    PatientResponseDTO.class);
        } catch (RestClientException ex) {
            logger.warn("Could not fetch patient {}: {}", patientId, ex.getMessage());
            return null;
        }
    }

    private HealthTwinResponseDTO fetchHealthTwin(UUID patientId) {
        try {
            return restTemplate.getForObject(
                    "http://localhost:8082/healthtwin/patient/" + patientId,
                    HealthTwinResponseDTO.class);
        } catch (RestClientException ex) {
            logger.warn("Could not fetch health twin for {}: {}", patientId, ex.getMessage());
            return null;
        }
    }

    private VitalsResponseDTO fetchVitals(UUID patientId) {
        try {
            return restTemplate.getForObject(
                    "http://localhost:8083/vitals/latest/" + patientId,
                    VitalsResponseDTO.class);
        } catch (RestClientException ex) {
            logger.warn("Could not fetch vitals for {}: {}", patientId, ex.getMessage());
            return null;
        }
    }

    private ConsentResponseDTO fetchConsent(UUID patientId) {
        try {
            return restTemplate.getForObject(
                    "http://localhost:8084/consent/patient/" + patientId,
                    ConsentResponseDTO.class);
        } catch (RestClientException ex) {
            logger.warn("Could not fetch consent for {}: {}", patientId, ex.getMessage());
            return null;
        }
    }
}
