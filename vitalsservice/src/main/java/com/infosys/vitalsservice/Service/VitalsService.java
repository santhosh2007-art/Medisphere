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

    private boolean isMongoAlive() {
        try (java.net.Socket socket = new java.net.Socket()) {
            socket.connect(new java.net.InetSocketAddress("localhost", 27017), 50);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

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

        if (isMongoAlive()) {
            try {
                return mapToDTO(repository.save(vitals));
            } catch (Exception ignored) {}
        }
        return mapToDTO(vitals);
    }

    public List<VitalsResponseDTO> getAll() {
        if (isMongoAlive()) {
            try {
                return repository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
            } catch (Exception ignored) {}
        }
        return List.of();
    }

    public VitalsResponseDTO getById(UUID id) {
        if (isMongoAlive()) {
            try {
                Vitals vitals = repository.findById(id).orElse(null);
                if (vitals != null) return mapToDTO(vitals);
            } catch (Exception ignored) {}
        }
        return null;
    }

    public List<VitalsResponseDTO> getByPatientId(UUID patientId) {
        if (isMongoAlive()) {
            try {
                return repository.findByPatientId(patientId).stream().map(this::mapToDTO).collect(Collectors.toList());
            } catch (Exception ignored) {}
        }
        return List.of();
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
        return repository
                .findTopByPatientIdOrderByRecordedAtDesc(patientId)
                .map(this::mapToDTO)
                .orElse(null);
    }
}