package com.infosys.consentservice.Controller;

import com.infosys.consentservice.Service.ConsentService;
import com.infosys.consentservice.dto.ConsentRequestDTO;
import com.infosys.consentservice.dto.ConsentResponseDTO;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/consent")
public class ConsentController {


    @Autowired
    private ConsentService service;

    // Save
    @PostMapping("/save")
    public ConsentResponseDTO save(@Valid @RequestBody ConsentRequestDTO dto) {

        return service.save(dto);
    }

    // Get By Patient Id
    @GetMapping("/patient/{patientId}")
    public ConsentResponseDTO getByPatientId(@PathVariable UUID patientId) {
        return service.getByPatientId(patientId);
    }

    // Update
    @PutMapping("/{id}")
    public ConsentResponseDTO update(@PathVariable UUID id,
                                     @Valid @RequestBody ConsentRequestDTO dto) {

        return service.update(id, dto);
    }

    // Revoke
    @PatchMapping("/{id}/revoke")
    public ConsentResponseDTO revoke(@PathVariable UUID id) {

        return service.revoke(id);
    }
    @GetMapping("/all")
    public List<ConsentResponseDTO> getAll() {
        return service.getAll();
    }


}