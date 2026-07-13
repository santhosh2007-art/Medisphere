package com.infosys.patient_service.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class PatientRequestDTO {

    @NotBlank(message = "FIled must not be Empty")
    private String firstname;

    @NotBlank(message = "Filed must not be Empty")
    private String lastname;

    @NotBlank(message = "Gender must not be Empty")
    private String gender;

    private LocalDate dob;

    @Email(message = "must not be empty")
    private String email;

    private long phoneno;

    @NotBlank(message = "Address must not be Empty")
    private String address;

}