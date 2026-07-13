package com.infosys.consentservice.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class ConsentRequestDTO {

    @NotNull(message = "Patient Id is required")
    private UUID patientId;

    @NotBlank(message = "Consent Type is required")
    private String consenttype;

    @NotBlank(message = "Status is required")
    private String status;

    @NotNull(message = "Granted Date is required")
    private LocalDate granteddate;

    @NotNull(message = "Expiry Date is required")
    @Future(message = "Expiry Date must be in the future")
    private LocalDate expirydate;
}