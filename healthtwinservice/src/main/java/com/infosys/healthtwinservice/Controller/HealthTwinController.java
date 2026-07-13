package com.infosys.healthtwinservice.Controller;

import com.infosys.healthtwinservice.dto.HealthTwinRequestDTO;
import com.infosys.healthtwinservice.dto.HealthTwinResponseDTO;
import com.infosys.healthtwinservice.Service.HealthTwinService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/healthtwin")
public class HealthTwinController {

    @Autowired
    private HealthTwinService service;

    // Save
    @PostMapping("/save")
    public HealthTwinResponseDTO save(@Valid @RequestBody HealthTwinRequestDTO dto) {

        return service.save(dto);
    }

    // Get All
    @GetMapping("/all")
    public List<HealthTwinResponseDTO> getAll() {

        return service.getAll();
    }

    // Get By Id
    @GetMapping("/{id}")
    public HealthTwinResponseDTO getById(@PathVariable UUID id) {

        return service.getById(id);
    }

    // Update
    @PutMapping("/{id}")
    public HealthTwinResponseDTO update(@PathVariable UUID id,
                                        @Valid @RequestBody HealthTwinRequestDTO dto) {

        return service.update(id, dto);
    }

    // Delete
    @DeleteMapping("/{id}")
    public String delete(@PathVariable UUID id) {

        service.delete(id);

        return "Health Twin Deleted Successfully";
    }

    @GetMapping("/patient/{patientId}")
    public HealthTwinResponseDTO getByPatientId(@PathVariable UUID patientId){

        return service.getByPatientId(patientId);
    }

}