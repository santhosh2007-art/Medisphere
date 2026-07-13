package com.infosys.patient_service.Entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "patient")
public class Patient {

    @Id
    private UUID patientId;
    private String firstname;
    private String lastname;
    private String gender;
    private LocalDate dob;
    private String email;
    private long phoneno;
    private String address;


}
