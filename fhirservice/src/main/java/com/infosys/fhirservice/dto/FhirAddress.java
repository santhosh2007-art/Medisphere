package com.infosys.fhirservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Simplified FHIR "Address" datatype. */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class FhirAddress {

    private String text;
}
