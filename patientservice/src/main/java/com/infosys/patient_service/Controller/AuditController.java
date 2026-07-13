package com.infosys.patient_service.Controller;

import com.infosys.patient_service.Service.AuditService;
import com.infosys.patient_service.dto.AuditLogResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/audit")
public class AuditController {

    @Autowired
    private AuditService auditService;

    @GetMapping("/{patientId}")
    public List<AuditLogResponseDTO> getHistory(@PathVariable UUID patientId) {

        return auditService.getHistory(patientId);
    }
}
