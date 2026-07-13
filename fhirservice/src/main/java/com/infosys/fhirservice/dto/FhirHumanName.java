package com.infosys.fhirservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/** Simplified FHIR "HumanName" datatype. */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class FhirHumanName {

    private String family;
    private List<String> given;
}
