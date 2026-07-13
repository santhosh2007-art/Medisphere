package com.infosys.patient_service.Controller;
import com.infosys.patient_service.Service.Patient360Service;
import com.infosys.patient_service.dto.Patient360Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/patient360")
public class Patient360Controller {

    @Autowired
    private Patient360Service service;

    @GetMapping("/{patientId}")
    public Patient360Response getPatient360(@PathVariable UUID patientId){

        return service.getPatient360(patientId);

    }

}