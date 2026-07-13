package com.infosys.fhirservice.Service;

import com.infosys.fhirservice.Client.FhirApiClient;
import com.infosys.fhirservice.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
public class FhirService {

    @Autowired
    private FhirApiClient client;

    @Autowired
    private RestTemplate restTemplate;

    public String connect() {
        return client.connect();
    }

    public String sync(String patientId) {
        return client.syncPatient(patientId);
    }

    public String validate() {
        return client.validate();
    }

    /**
     * Fetches patient data from patient-service and converts it into a
     * simplified FHIR R4 "Patient" resource - this is the core piece of
     * FHIR support required for the Patient 360 dashboard.
     */
    public FhirPatientResource getPatientAsFhir(String patientId) {

        PatientDataDTO patient = restTemplate.getForObject(
                "http://localhost:8081/patient/" + patientId,
                PatientDataDTO.class);

        return toFhirPatient(patient);
    }

    private FhirPatientResource toFhirPatient(PatientDataDTO patient) {

        FhirPatientResource resource = new FhirPatientResource();

        if (patient == null) {
            return resource;
        }

        resource.setId(patient.getPatientId());
        resource.setGender(patient.getGender());
        resource.setBirthDate(patient.getDob());

        FhirHumanName name = new FhirHumanName(
                patient.getLastname(),
                List.of(patient.getFirstname()));
        resource.setName(List.of(name));

        resource.setTelecom(List.of(
                new FhirContactPoint("email", patient.getEmail()),
                new FhirContactPoint("phone", String.valueOf(patient.getPhoneno()))
        ));

        resource.setAddress(List.of(new FhirAddress(patient.getAddress())));

        return resource;
    }
}
