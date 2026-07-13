package com.infosys.fhirservice.dto;

import lombok.Data;

import java.util.List;

/**
 * A simplified version of the FHIR R4 "Patient" resource.
 * Only the fields needed for this student project are included, but the
 * shape follows the real FHIR standard: resourceType, name, gender,
 * birthDate, telecom and address.
 * See: https://www.hl7.org/fhir/patient.html
 */
@Data
public class FhirPatientResource {

    private final String resourceType = "Patient";

    private String id;
    private List<FhirHumanName> name;
    private String gender;
    private String birthDate;
    private List<FhirContactPoint> telecom;
    private List<FhirAddress> address;
}
