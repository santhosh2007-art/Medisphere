package com.infosys.vitalsservice.Service;

import com.infosys.vitalsservice.Entity.Careplan;
import com.infosys.vitalsservice.Entity.Intervention;
import com.infosys.vitalsservice.Entity.MedicationDetails;
import com.infosys.vitalsservice.Entity.SafetyCheckResult;
import com.infosys.vitalsservice.Repository.SafetyCheckRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class SafetyCheckService {

    @Autowired
    private SafetyCheckRepository safetyCheckRepository;

    private boolean isMongoAlive() {
        try (java.net.Socket socket = new java.net.Socket()) {
            socket.connect(new java.net.InetSocketAddress("localhost", 27017), 50);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public SafetyCheckResult checkProposedMedications(String patientId, List<MedicationDetails> proposedMeds) {
        if (proposedMeds == null || proposedMeds.isEmpty()) {
            SafetyCheckResult result = new SafetyCheckResult(patientId, "None", Collections.emptyList());
            result.setId(UUID.randomUUID().toString());
            if (isMongoAlive()) {
                try { return safetyCheckRepository.save(result); } catch (Exception ignored) {}
            }
            return result;
        }

        // Stubbed Patient Active Meds (Simulated EHR med-reconciliation source)
        List<String> activeMeds = getActiveMedicationsForPatient(patientId);

        List<String> warnings = new ArrayList<>();
        String highestSeverity = "None";

        for (MedicationDetails proposed : proposedMeds) {
            if (proposed == null || proposed.getDrugName() == null) continue;
            String drugName = proposed.getDrugName().toUpperCase();

            for (String active : activeMeds) {
                String activeUpper = active.toUpperCase();

                // Contraindicated pair: Warfarin + Aspirin / NSAIDs
                if ((drugName.contains("WARFARIN") && (activeUpper.contains("ASPIRIN") || activeUpper.contains("IBUPROFEN")))
                        || (activeUpper.contains("WARFARIN") && (drugName.contains("ASPIRIN") || drugName.contains("IBUPROFEN")))) {
                    highestSeverity = "Contraindicated";
                    warnings.add("CONTRAINDICATED: Co-administration of " + proposed.getDrugName() + " and " + active + " causes severe bleeding hazard.");
                }

                // Major pair: Lisinopril + Spironolactone / Potassium
                if ((drugName.contains("LISINOPRIL") && (activeUpper.contains("SPIRONOLACTONE") || activeUpper.contains("POTASSIUM")))
                        || (activeUpper.contains("LISINOPRIL") && (drugName.contains("SPIRONOLACTONE") || drugName.contains("POTASSIUM")))) {
                    if (!"Contraindicated".equals(highestSeverity)) {
                        highestSeverity = "Major";
                    }
                    warnings.add("MAJOR INTERACTION: " + proposed.getDrugName() + " paired with " + active + " significantly increases risk of hyperkalemia.");
                }

                // Major pair: Metoprolol + Diltiazem / Verapamil
                if ((drugName.contains("METOPROLOL") && (activeUpper.contains("DILTIAZEM") || activeUpper.contains("VERAPAMIL")))
                        || (activeUpper.contains("METOPROLOL") && (drugName.contains("DILTIAZEM") || drugName.contains("VERAPAMIL")))) {
                    if (!"Contraindicated".equals(highestSeverity)) {
                        highestSeverity = "Major";
                    }
                    warnings.add("MAJOR INTERACTION: " + proposed.getDrugName() + " and " + active + " may precipitate severe bradycardia or heart block.");
                }

                // Moderate pair: Metformin + Contrast / Diuretic
                if ((drugName.contains("METFORMIN") && activeUpper.contains("FUROSEMIDE"))
                        || (activeUpper.contains("METFORMIN") && drugName.contains("FUROSEMIDE"))) {
                    if ("None".equals(highestSeverity) || "Minor".equals(highestSeverity)) {
                        highestSeverity = "Moderate";
                    }
                    warnings.add("MODERATE INTERACTION: Monitor renal function when combining " + proposed.getDrugName() + " with " + active + ".");
                }
            }
        }

        SafetyCheckResult result = new SafetyCheckResult(patientId, highestSeverity, warnings);
        result.setId(UUID.randomUUID().toString());
        if (isMongoAlive()) {
            try { return safetyCheckRepository.save(result); } catch (Exception ignored) {}
        }
        return result;
    }

    public Careplan evaluateCareplanSafety(Careplan plan) {
        if (plan == null || plan.getInterventions() == null) return plan;

        List<MedicationDetails> proposedMeds = new ArrayList<>();
        for (Intervention i : plan.getInterventions()) {
            if ("Medication".equalsIgnoreCase(i.getType()) && i.getMedicationDetails() != null) {
                proposedMeds.add(i.getMedicationDetails());
            }
        }

        SafetyCheckResult checkResult = checkProposedMedications(plan.getPatientId(), proposedMeds);

        for (Intervention i : plan.getInterventions()) {
            if ("Medication".equalsIgnoreCase(i.getType())) {
                i.setSafetyCheckResultId(checkResult.getId());
                if (!"Overridden".equalsIgnoreCase(i.getSafetyCheckStatus())) {
                    if ("Major".equalsIgnoreCase(checkResult.getSeverity()) || "Contraindicated".equalsIgnoreCase(checkResult.getSeverity())) {
                        i.setSafetyCheckStatus("Failed");
                    } else {
                        i.setSafetyCheckStatus("Passed");
                    }
                }
            } else {
                i.setSafetyCheckStatus("Passed");
            }
        }

        return plan;
    }

    public Intervention overrideInterventionSafety(Intervention intervention, String providerId, String overrideReason) {
        if (intervention == null) return null;
        if (overrideReason == null || overrideReason.trim().isEmpty()) {
            throw new IllegalArgumentException("Provider override reason is mandatory for Major/Contraindicated drug safety overrides.");
        }
        intervention.setSafetyCheckStatus("Overridden");
        intervention.setOverriddenBy(providerId != null ? providerId : "Dr. Specialist");
        intervention.setOverrideReason(overrideReason);
        intervention.setOverriddenAt(new Date().toString());
        return intervention;
    }

    private List<String> getActiveMedicationsForPatient(String patientId) {
        // Simulated Active Med List per Patient for clinical safety evaluation
        if ("35f51e3e-66fd-4f87-85ad-affa0dde1156".equals(patientId)) {
            return Arrays.asList("Spironolactone 25mg", "Aspirin 81mg");
        } else if ("8a719c2d-12ef-45a8-912b-34567890abcd".equals(patientId)) {
            return Arrays.asList("Albuterol Inhaler", "Furosemide 40mg");
        } else if ("9b820d3e-23fa-56b9-923c-45678901bcde".equals(patientId)) {
            return Arrays.asList("Amlodipine 5mg", "Atorvastatin 20mg");
        }
        return Arrays.asList("Potassium Chloride 10mEq");
    }
}
