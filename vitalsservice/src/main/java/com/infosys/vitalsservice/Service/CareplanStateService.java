package com.infosys.vitalsservice.Service;

import com.infosys.vitalsservice.Entity.Careplan;
import com.infosys.vitalsservice.Entity.Intervention;
import com.infosys.vitalsservice.Repository.CareplanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Date;
import java.util.HexFormat;

@Service
public class CareplanStateService {

    @Autowired
    private CareplanRepository careplanRepository;

    @Autowired
    private SafetyCheckService safetyCheckService;

    public Careplan submitToReview(String careplanId) {
        Careplan plan = getCareplanOrThrow(careplanId);
        if (!"Draft".equalsIgnoreCase(plan.getStatus())) {
            throw new IllegalStateException("Cannot submit to ProviderReview from status: " + plan.getStatus());
        }

        // Run drug safety evaluation before moving to ProviderReview
        plan = safetyCheckService.evaluateCareplanSafety(plan);
        plan.setStatus("ProviderReview");
        return careplanRepository.save(plan);
    }

    public Careplan approveCareplan(String careplanId, String providerId, String attestationText) {
        Careplan plan = getCareplanOrThrow(careplanId);

        if (!"ProviderReview".equalsIgnoreCase(plan.getStatus()) && !"Draft".equalsIgnoreCase(plan.getStatus())) {
            throw new IllegalStateException("Careplan can only be approved from Draft or ProviderReview status. Current: " + plan.getStatus());
        }

        if (providerId == null || providerId.trim().isEmpty()) {
            throw new IllegalArgumentException("Provider identity (authenticated providerId) is mandatory for careplan approval.");
        }

        // Safety Gating Check: All Medication interventions MUST be Passed or Overridden
        if (plan.getInterventions() != null) {
            for (Intervention i : plan.getInterventions()) {
                if ("Medication".equalsIgnoreCase(i.getType())) {
                    String sStatus = i.getSafetyCheckStatus();
                    if (!"Passed".equalsIgnoreCase(sStatus) && !"Overridden".equalsIgnoreCase(sStatus)) {
                        throw new IllegalStateException("Cannot approve careplan: Medication intervention '" + i.getDescription() + "' has safety check status '" + sStatus + "'. Required: Passed or Overridden.");
                    }
                }
            }
        }

        Date approvedAt = new Date();
        String signatureHash = computeESignatureHash(plan.getId(), providerId, approvedAt, plan.getVersion(), attestationText);

        plan.setStatus("Approved");
        plan.setApprovedBy(providerId);
        plan.setApprovedAt(approvedAt);
        plan.setSignatureHash(signatureHash);

        return careplanRepository.save(plan);
    }

    public Careplan activateCareplan(String careplanId) {
        Careplan plan = getCareplanOrThrow(careplanId);

        if (!"Approved".equalsIgnoreCase(plan.getStatus())) {
            throw new IllegalStateException("Cannot activate careplan from status '" + plan.getStatus() + "'. Careplan MUST be in Approved status first.");
        }

        if (plan.getApprovedBy() == null || plan.getApprovedAt() == null || plan.getSignatureHash() == null) {
            throw new IllegalStateException("CRITICAL CLINICAL SAFETY VIOLATION: Cannot activate careplan without valid provider approval and e-signature artifact.");
        }

        plan.setStatus("Active");
        return careplanRepository.save(plan);
    }

    public Careplan modifyCareplan(String careplanId, Careplan updatedDetails) {
        Careplan existing = getCareplanOrThrow(careplanId);

        // Modifying any plan bumps version, resets status to Draft, clears prior e-signature
        existing.setStatus("Draft");
        existing.setVersion(existing.getVersion() + 1);
        existing.setApprovedBy(null);
        existing.setApprovedAt(null);
        existing.setSignatureHash(null);

        if (updatedDetails.getGoals() != null) {
            existing.setGoals(updatedDetails.getGoals());
        }
        if (updatedDetails.getInterventions() != null) {
            existing.setInterventions(updatedDetails.getInterventions());
        }

        // Re-run safety check on updated modifications
        existing = safetyCheckService.evaluateCareplanSafety(existing);

        return careplanRepository.save(existing);
    }

    public Careplan cancelCareplan(String careplanId, String reason) {
        Careplan plan = getCareplanOrThrow(careplanId);
        plan.setStatus("Cancelled");
        return careplanRepository.save(plan);
    }

    public String computeESignatureHash(String careplanId, String providerId, Date approvedAt, Integer version, String attestation) {
        try {
            String raw = careplanId + "|" + providerId + "|" + (approvedAt != null ? approvedAt.getTime() : 0) + "|" + version + "|" + (attestation != null ? attestation : "I attest and approve this careplan");
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            return "HASH-" + System.currentTimeMillis();
        }
    }

    private Careplan getCareplanOrThrow(String careplanId) {
        return careplanRepository.findById(careplanId)
                .orElseThrow(() -> new IllegalArgumentException("Careplan with ID " + careplanId + " not found."));
    }
}
