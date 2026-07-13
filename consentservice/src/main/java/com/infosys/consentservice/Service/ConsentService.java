package com.infosys.consentservice.Service;

import com.infosys.consentservice.Entity.Consent;
import com.infosys.consentservice.Repository.ConsentRepository;
import com.infosys.consentservice.dto.ConsentRequestDTO;
import com.infosys.consentservice.dto.ConsentResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ConsentService {

    @Autowired
    private ConsentRepository repository;

    // Save
    public ConsentResponseDTO save(ConsentRequestDTO dto) {
        List<Consent> consents = repository.findByPatientId(dto.getPatientId());
        Consent consent;
        if (!consents.isEmpty()) {
            consent = consents.get(0);
            if (consents.size() > 1) {
                for (int i = 1; i < consents.size(); i++) {
                    repository.delete(consents.get(i));
                }
            }
        } else {
            consent = new Consent();
            consent.setConsentId(UUID.randomUUID());
            consent.setPatientId(dto.getPatientId());
        }

        consent.setConsenttype(dto.getConsenttype());
        consent.setStatus(dto.getStatus());
        consent.setGranteddate(dto.getGranteddate());
        consent.setExpirydate(dto.getExpirydate());

        return mapToDTO(repository.save(consent));
    }

    // Get By Patient Id
    public ConsentResponseDTO getByPatientId(UUID patientId) {
        List<Consent> consents = repository.findByPatientId(patientId);
        if (consents.isEmpty()) {
            throw new RuntimeException("Consent Not Found");
        }
        
        Consent consent = consents.get(consents.size() - 1); // Get latest
        
        // Clean up duplicates if found
        if (consents.size() > 1) {
            for (int i = 0; i < consents.size() - 1; i++) {
                repository.delete(consents.get(i));
            }
        }

        return mapToDTO(consent);
    }

    // Update
    public ConsentResponseDTO update(UUID id, ConsentRequestDTO dto) {

        Consent consent = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Consent not found"));

        consent.setPatientId(dto.getPatientId());
        consent.setConsenttype(dto.getConsenttype());
        consent.setStatus(dto.getStatus());
        consent.setGranteddate(dto.getGranteddate());
        consent.setExpirydate(dto.getExpirydate());

        return mapToDTO(repository.save(consent));
    }

    // Revoke
    public ConsentResponseDTO revoke(UUID id) {

        Consent consent = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Consent not found"));

        consent.setStatus("REVOKED");

        return mapToDTO(repository.save(consent));
    }

    private ConsentResponseDTO mapToDTO(Consent consent) {

        ConsentResponseDTO dto = new ConsentResponseDTO();

        dto.setConsentId(consent.getConsentId());
        dto.setPatientId(consent.getPatientId());
        dto.setConsenttype(consent.getConsenttype());
        dto.setStatus(consent.getStatus());
        dto.setGranteddate(consent.getGranteddate());
        dto.setExpirydate(consent.getExpirydate());

        return dto;
    }
    public List<ConsentResponseDTO> getAll() {
        return repository.findAll()
                .stream()
                .map(this::mapToDTO)
                .toList();
    }
}