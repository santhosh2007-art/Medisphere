package com.infosys.patient_service.Controller;

import com.infosys.patient_service.dto.PatientRequestDTO;
import com.infosys.patient_service.dto.PatientResponseDTO;
import com.infosys.patient_service.Service.PatientService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/patient")
public class PatientController {

    @Autowired
    private PatientService service;

    @PostMapping("/save")
    public PatientResponseDTO save(@Valid @RequestBody PatientRequestDTO dto){

        return service.savePatient(dto);

    }

    @GetMapping("/all")
    public List<PatientResponseDTO> getAll(){

        return service.getAllPatients();

    }

    @GetMapping("/{id}")
    public PatientResponseDTO getById(@PathVariable UUID id){

        return service.getPatient(id);

    }

    @PutMapping("/{id}")
    public PatientResponseDTO update(@PathVariable UUID id,
                                     @Valid @RequestBody PatientRequestDTO dto){

        return service.updatePatient(id,dto);

    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable UUID id){

        service.deletePatient(id);

        return "Patient Deleted Successfully";
    }

}