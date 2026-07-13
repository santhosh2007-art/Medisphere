package com.infosys.fhirservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Simplified FHIR "ContactPoint" datatype, e.g. email or phone. */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class FhirContactPoint {

    private String system; // "email" or "phone"
    private String value;
}
