package com.infosys.patient_service.Service;

import com.infosys.patient_service.dto.PatientRequestDTO;
import com.infosys.patient_service.dto.PatientResponseDTO;
import com.infosys.patient_service.Entity.Patient;
import com.infosys.patient_service.Repository.PatientRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class PatientService {

    @Autowired
    private PatientRepository repository;

    @Autowired
    private AuditService auditService;

    private final Map<UUID, Patient> inMemoryStore = new ConcurrentHashMap<>();

    private boolean isMongoAlive() {
        try (java.net.Socket socket = new java.net.Socket()) {
            socket.connect(new java.net.InetSocketAddress("localhost", 27017), 50);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @PostConstruct
    public void initDemoPatients() {
        seedDemoPatients();
    }

    private void seedDemoPatients() {
        Patient p1 = new Patient();
        p1.setPatientId(UUID.fromString("35f51e3e-66fd-4f87-85ad-affa0dde1156"));
        p1.setFirstname("Santhosh");
        p1.setLastname("Kumar");
        p1.setGender("Male");
        p1.setDob(java.time.LocalDate.parse("1995-04-12"));
        p1.setEmail("santhosh.kumar@medisphere.com");
        p1.setPhoneno(9876543210L);
        p1.setAddress("Chennai, Tamil Nadu");
        saveSafe(p1);

        Patient p2 = new Patient();
        p2.setPatientId(UUID.fromString("8a719c2d-12ef-45a8-912b-34567890abcd"));
        p2.setFirstname("Anitha");
        p2.setLastname("Ramesh");
        p2.setGender("Female");
        p2.setDob(java.time.LocalDate.parse("1968-08-25"));
        p2.setEmail("anitha.ramesh@medisphere.com");
        p2.setPhoneno(9876543211L);
        p2.setAddress("Coimbatore, Tamil Nadu");
        saveSafe(p2);

        Patient p3 = new Patient();
        p3.setPatientId(UUID.fromString("9b820d3e-23fa-56b9-923c-45678901bcde"));
        p3.setFirstname("Rajesh");
        p3.setLastname("Kannan");
        p3.setGender("Male");
        p3.setDob(java.time.LocalDate.parse("1962-11-04"));
        p3.setEmail("rajesh.kannan@medisphere.com");
        p3.setPhoneno(9876543212L);
        p3.setAddress("Madurai, Tamil Nadu");
        saveSafe(p3);
    }

    private Patient saveSafe(Patient p) {
        if (p.getPatientId() == null) {
            p.setPatientId(UUID.randomUUID());
        }
        inMemoryStore.put(p.getPatientId(), p);
        if (isMongoAlive()) {
            try { return repository.save(p); } catch (Exception ignored) {}
        }
        return p;
    }

    public PatientResponseDTO savePatient(PatientRequestDTO dto){
        Patient patient = new Patient();
        patient.setPatientId(UUID.randomUUID());
        patient.setFirstname(dto.getFirstname());
        patient.setLastname(dto.getLastname());
        patient.setGender(dto.getGender());
        patient.setDob(dto.getDob());
        patient.setEmail(dto.getEmail());
        patient.setPhoneno(dto.getPhoneno());
        patient.setAddress(dto.getAddress());

        saveSafe(patient);

        auditService.log(patient.getPatientId(), "CREATE_PATIENT", "system",
                "Patient record created");

        return convertToResponse(patient);
    }

    public List<PatientResponseDTO> getAllPatients(){
        if (inMemoryStore.isEmpty()) {
            seedDemoPatients();
        }
        return inMemoryStore.values()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public PatientResponseDTO getPatient(UUID id){
        Patient patient = inMemoryStore.get(id);
        if (patient == null && isMongoAlive()) {
            try {
                patient = repository.findById(id).orElse(null);
            } catch (Exception ignored) {}
        }
        if (patient == null) {
            throw new RuntimeException("Patient Not Found");
        }
        return convertToResponse(patient);
    }

    public PatientResponseDTO updatePatient(UUID id, PatientRequestDTO dto){
        Patient patient = inMemoryStore.get(id);
        if (patient == null) {
            patient = new Patient();
            patient.setPatientId(id);
        }

        patient.setFirstname(dto.getFirstname());
        patient.setLastname(dto.getLastname());
        patient.setGender(dto.getGender());
        patient.setDob(dto.getDob());
        patient.setEmail(dto.getEmail());
        patient.setPhoneno(dto.getPhoneno());
        patient.setAddress(dto.getAddress());

        saveSafe(patient);

        auditService.log(patient.getPatientId(), "UPDATE_PATIENT", "system",
                "Patient record updated");

        return convertToResponse(patient);
    }

    public void deletePatient(UUID id){
        inMemoryStore.remove(id);
        if (isMongoAlive()) {
            try { repository.deleteById(id); } catch (Exception ignored) {}
        }
        try {
            auditService.log(id, "DELETE_PATIENT", "system", "Patient record deleted");
        } catch (Exception ignored) {}
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