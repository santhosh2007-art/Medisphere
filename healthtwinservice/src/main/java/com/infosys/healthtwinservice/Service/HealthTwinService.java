package com.infosys.healthtwinservice.Service;
import com.infosys.healthtwinservice.Entity.HealthTwin;
import com.infosys.healthtwinservice.Repository.HealthTwinRepository;
import com.infosys.healthtwinservice.dto.HealthTwinRequestDTO;
import com.infosys.healthtwinservice.dto.HealthTwinResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class HealthTwinService {

    @Autowired
    private HealthTwinRepository repository;

    // Save
    public HealthTwinResponseDTO save(HealthTwinRequestDTO dto) {

        HealthTwin twin = repository.findByPatientId(dto.getPatientId())
                .orElseGet(() -> {
                    HealthTwin newTwin = new HealthTwin();
                    newTwin.setTwinId(UUID.randomUUID());
                    newTwin.setPatientId(dto.getPatientId());
                    return newTwin;
                });

        twin.setBloodgroup(dto.getBloodgroup());
        twin.setHeight(dto.getHeight());
        twin.setWeight(dto.getWeight());
        twin.setTemperature(dto.getTemperature());
        twin.setDisease(dto.getDisease());

        HealthTwin savedTwin = repository.save(twin);

        return mapToResponse(savedTwin);
    }

    // Get All
    public List<HealthTwinResponseDTO> getAll() {

        return repository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Get By Twin Id
    public HealthTwinResponseDTO getById(UUID id) {

        HealthTwin twin = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Health Twin Not Found"));

        return mapToResponse(twin);
    }

    public HealthTwinResponseDTO getByPatientId(UUID patientId){
        HealthTwin twin = repository.findByPatientId(patientId)
                .orElseGet(() -> {
                    HealthTwin defaultTwin = new HealthTwin();
                    defaultTwin.setTwinId(UUID.randomUUID());
                    defaultTwin.setPatientId(patientId);
                    defaultTwin.setBloodgroup("O+");
                    defaultTwin.setHeight(175.0);
                    defaultTwin.setWeight(70.0);
                    defaultTwin.setTemperature(98.6);
                    defaultTwin.setDisease("None");
                    return repository.save(defaultTwin);
                });

        return mapToResponse(twin);
    }

    // Update
    public HealthTwinResponseDTO update(UUID id, HealthTwinRequestDTO dto) {

        HealthTwin twin = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Health Twin Not Found"));

        twin.setPatientId(dto.getPatientId());
        twin.setBloodgroup(dto.getBloodgroup());
        twin.setHeight(dto.getHeight());
        twin.setWeight(dto.getWeight());
        twin.setTemperature(dto.getTemperature());
        twin.setDisease(dto.getDisease());

        HealthTwin updatedTwin = repository.save(twin);

        return mapToResponse(updatedTwin);
    }

    // Delete
    public void delete(UUID id) {

        repository.deleteById(id);
    }

    private HealthTwinResponseDTO mapToResponse(HealthTwin twin) {

        HealthTwinResponseDTO dto = new HealthTwinResponseDTO();

        dto.setTwinId(twin.getTwinId());
        dto.setPatientId(twin.getPatientId());
        dto.setBloodgroup(twin.getBloodgroup());
        dto.setHeight(twin.getHeight());
        dto.setWeight(twin.getWeight());
        dto.setTemperature(twin.getTemperature());
        dto.setDisease(twin.getDisease());

        return dto;
    }
}