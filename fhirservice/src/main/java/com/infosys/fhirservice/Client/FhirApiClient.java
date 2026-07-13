package com.infosys.fhirservice.Client;

import org.springframework.stereotype.Component;

@Component
public class FhirApiClient {

    public String connect() {
        return "Connected to FHIR Server";
    }

    public String syncPatient(String patientId) {
        return "Patient " + patientId + " synchronized successfully";
    }

    public String validate() {
        return "FHIR Resource Valid";
    }

}