package com.infosys.vitalsservice.Service;

import org.springframework.stereotype.Service;

@Service
public class AlertRoutingService {

    public static class DoctorAssignment {
        private final String doctorName;
        private final String role;

        public DoctorAssignment(String doctorName, String role) {
            this.doctorName = doctorName;
            this.role = role;
        }

        public String getDoctorName() {
            return doctorName;
        }

        public String getRole() {
            return role;
        }

        public String getFullLabel() {
            return doctorName + " (" + role + ")";
        }
    }

    /**
     * Routes provider based on alert type:
     * - Cardiac -> Cardiologist
     * - Oxygen -> Pulmonologist
     * - Blood Pressure -> General Physician
     * - Temperature -> Internal Medicine
     */
    public DoctorAssignment routeDoctor(String alertType) {
        if (alertType == null) {
            return new DoctorAssignment("Dr. Elena Rostova", "General Physician");
        }

        switch (alertType.toUpperCase()) {
            case "CARDIAC":
                return new DoctorAssignment("Dr. Sarah Jenkins", "Cardiologist");

            case "OXYGEN":
                return new DoctorAssignment("Dr. Robert Chen", "Pulmonologist");

            case "BLOOD_PRESSURE":
                return new DoctorAssignment("Dr. Elena Rostova", "General Physician");

            case "TEMPERATURE":
                return new DoctorAssignment("Dr. Marcus Vance", "Internal Medicine");

            default:
                return new DoctorAssignment("Dr. Elena Rostova", "General Physician");
        }
    }
}
