package com.infosys.patient_service.Service;

import com.infosys.patient_service.dto.PatientRequestDTO;
import com.infosys.patient_service.dto.PatientResponseDTO;
import com.infosys.patient_service.Entity.Patient;
import com.infosys.patient_service.Repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PatientService {

    @Autowired
    private PatientRepository repository;

    @Autowired
    private AuditService auditService;

    public PatientResponseDTO savePatient(PatientRequestDTO dto){

        Patient patient=new Patient();

        patient.setPatientId(UUID.randomUUID());
        patient.setFirstname(dto.getFirstname());
        patient.setLastname(dto.getLastname());
        patient.setGender(dto.getGender());
        patient.setDob(dto.getDob());
        patient.setEmail(dto.getEmail());
        patient.setPhoneno(dto.getPhoneno());
        patient.setAddress(dto.getAddress());

        repository.save(patient);

        auditService.log(patient.getPatientId(), "CREATE_PATIENT", "system",
                "Patient record created");

        return convertToResponse(patient);
    }

    public List<PatientResponseDTO> getAllPatients(){

        return repository.findAll()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public PatientResponseDTO getPatient(UUID id){

        Patient patient=repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient Not Found"));

        return convertToResponse(patient);
    }

    public PatientResponseDTO updatePatient(UUID id, PatientRequestDTO dto){

        Patient patient=repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient Not Found"));

        patient.setFirstname(dto.getFirstname());
        patient.setLastname(dto.getLastname());
        patient.setGender(dto.getGender());
        patient.setDob(dto.getDob());
        patient.setEmail(dto.getEmail());
        patient.setPhoneno(dto.getPhoneno());
        patient.setAddress(dto.getAddress());

        repository.save(patient);

        auditService.log(patient.getPatientId(), "UPDATE_PATIENT", "system",
                "Patient record updated");

        return convertToResponse(patient);
    }

    public void deletePatient(UUID id){

        repository.deleteById(id);

        auditService.log(id, "DELETE_PATIENT", "system", "Patient record deleted");

    }

    private PatientResponseDTO convertToResponse(Patient patient){

        PatientResponseDTO dto=new PatientResponseDTO();

        dto.setPatientId(patient.getPatientId());
        dto.setFirstname(patient.getFirstname());
        dto.setLastname(patient.getLastname());
        dto.setGender(patient.getGender());
        dto.setDob(patient.getDob());
        dto.setEmail(patient.getEmail());
        dto.setPhoneno(patient.getPhoneno());
        dto.setAddress(patient.getAddress());

        return dto;
    }

}