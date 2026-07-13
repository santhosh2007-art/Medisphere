package com.infosys.fhirservice.Controller;

import com.infosys.fhirservice.dto.FhirPatientResource;
import com.infosys.fhirservice.dto.FhirRequest;
import com.infosys.fhirservice.dto.FhirResponse;
import com.infosys.fhirservice.Service.FhirService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/fhir")
public class FhirController {

    @Autowired
    private FhirService service;

    @PostMapping("/connect")
    public FhirResponse connect() {

        return new FhirResponse(
                "SUCCESS",
                service.connect()
        );
    }

    @PostMapping("/sync")
    public FhirResponse sync(@RequestBody FhirRequest request) {

        return new FhirResponse(
                "SUCCESS",
                service.sync(request.getPatientId())
        );
    }

    @PostMapping("/validate")
    public FhirResponse validate() {

        return new FhirResponse(
                "SUCCESS",
                service.validate()
        );
    }

    // Returns the patient in FHIR-compatible "Patient" resource format.
    @GetMapping("/patient/{patientId}")
    public FhirPatientResource getPatientAsFhir(@PathVariable String patientId) {

        return service.getPatientAsFhir(patientId);
    }

}