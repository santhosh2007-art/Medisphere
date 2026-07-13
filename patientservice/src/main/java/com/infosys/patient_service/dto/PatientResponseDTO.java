package com.infosys.patient_service.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class PatientResponseDTO {

    private UUID patientId;
    private String firstname;
    private String lastname;
    private String gender;
    private LocalDate dob;
    private String email;
    private long phoneno;
    private String address;

}