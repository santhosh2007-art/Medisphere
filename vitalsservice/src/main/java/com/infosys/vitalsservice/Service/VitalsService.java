package com.infosys.vitalsservice.Service;

import com.infosys.vitalsservice.Entity.Vitals;
import com.infosys.vitalsservice.Repository.VitalsRepository;
import com.infosys.vitalsservice.dto.VitalsRequestDTO;
import com.infosys.vitalsservice.dto.VitalsResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class VitalsService {

    @Autowired
    private VitalsRepository repository;

    public VitalsResponseDTO save(VitalsRequestDTO dto) {

        Vitals vitals = new Vitals();

        vitals.setVitalsId(UUID.randomUUID());
        vitals.setPatientId(dto.getPatientId());
        vitals.setHeartbeat(dto.getHeartbeat());
        vitals.setBloodpressure(dto.getBloodpressure());
        vitals.setOxygenlevel(dto.getOxygenlevel());
        vitals.setBloodsuger(dto.getBloodsuger());
        vitals.setPulserate(dto.getPulserate());
        vitals.setRecordedAt(LocalDateTime.now());

        return mapToDTO(repository.save(vitals));
    }

    public List<VitalsResponseDTO> getAll() {

        return repository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public VitalsResponseDTO getById(UUID id) {

        Vitals vitals = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vitals not found"));

        return mapToDTO(vitals);
    }

    public List<VitalsResponseDTO> getByPatientId(UUID patientId) {

        return repository.findByPatientId(patientId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public void delete(UUID id) {

        repository.deleteById(id);
    }

    private VitalsResponseDTO mapToDTO(Vitals vitals){

        VitalsResponseDTO dto = new VitalsResponseDTO();

        dto.setVitalsId(vitals.getVitalsId());
        dto.setPatientId(vitals.getPatientId());
        dto.setHeartbeat(vitals.getHeartbeat());
        dto.setBloodpressure(vitals.getBloodpressure());
        dto.setOxygenlevel(vitals.getOxygenlevel());
        dto.setBloodsuger(vitals.getBloodsuger());
        dto.setPulserate(vitals.getPulserate());
        dto.setRecordedAt(vitals.getRecordedAt());

        return dto;
    }
    public VitalsResponseDTO getLatestByPatientId(UUID patientId) {

        Vitals vitals = repository
                .findTopByPatientIdOrderByRecordedAtDesc(patientId)
                .orElseThrow(() -> new RuntimeException("Vitals not found"));

        return mapToDTO(vitals);
    }
}