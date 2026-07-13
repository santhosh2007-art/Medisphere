package com.infosys.fhirservice.dto;

import lombok.Data;

/**
 * Mirrors the fields returned by patient-service's PatientResponseDTO.
 * Kept as a plain, separate DTO so fhirservice does not depend on
 * patient-service's internal classes (each microservice owns its own contract).
 */
@Data
public class PatientDataDTO {

    private String patientId;
    private String firstname;
    private String lastname;
    private String gender;
    private String dob;
    private String email;
    private long phoneno;
    private String address;
}
