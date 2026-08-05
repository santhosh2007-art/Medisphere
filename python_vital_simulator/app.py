import time
import random
import json
from flask import Flask, jsonify, request

app = Flask(__name__)

# Monitored Student Project Patients Baseline
DEFAULT_PATIENT_ID = "35f51e3e-66fd-4f87-85ad-affa0dde1156"

PATIENTS = [
    {
        "patientId": "35f51e3e-66fd-4f87-85ad-affa0dde1156",
        "name": "Santhosh Kumar",
        "age": 31,
        "gender": "Male",
        "baselineHr": 72,
        "baselineBp": "120/80",
        "baselineSpo2": 98.0,
        "baselineTemp": 37.0,
        "baselineSugar": 95.0
    },
    {
        "patientId": "8a719c2d-12ef-45a8-912b-34567890abcd",
        "name": "Anitha Ramesh",
        "age": 58,
        "gender": "Female",
        "baselineHr": 78,
        "baselineBp": "135/88",
        "baselineSpo2": 96.5,
        "baselineTemp": 36.8,
        "baselineSugar": 142.0
    },
    {
        "patientId": "9b820d3e-23fa-56b9-923c-45678901bcde",
        "name": "Rajesh Kannan",
        "age": 64,
        "gender": "Male",
        "baselineHr": 82,
        "baselineBp": "142/92",
        "baselineSpo2": 95.0,
        "baselineTemp": 37.2,
        "baselineSugar": 168.0
    }
]

# Track tick count for controlled abnormal generation
tick_counter = 0

def generate_vitals_for_patient(patient, force_abnormal=False):
    global tick_counter
    tick_counter += 1

    # Decide activity state
    activities = ["REST", "WALKING", "EXERCISE"]
    activity = random.choice(activities)

    # Check if this tick should generate abnormal reading
    # Either explicitly requested or 1 in every 6 ticks
    is_abnormal = force_abnormal or (tick_counter % 6 == 0)

    if is_abnormal:
        # Abnormal vitals simulation for alert testing
        abnormal_types = ["TACHYCARDIA", "HYPOXIA", "HYPERTENSION", "HIGH_FEVER"]
        selected_type = random.choice(abnormal_types)

        if selected_type == "TACHYCARDIA":
            hr = random.randint(152, 168)
            sys_bp = random.randint(130, 145)
            dia_bp = random.randint(85, 95)
            spo2 = round(random.uniform(93.0, 96.0), 1)
            temp = round(random.uniform(36.8, 37.5), 1)
            activity = "REST"
        elif selected_type == "HYPOXIA":
            hr = random.randint(95, 115)
            sys_bp = random.randint(118, 132)
            dia_bp = random.randint(78, 88)
            spo2 = round(random.uniform(82.0, 89.0), 1) # Critical oxygen dip
            temp = round(random.uniform(36.5, 37.2), 1)
        elif selected_type == "HYPERTENSION":
            hr = random.randint(98, 118)
            sys_bp = random.randint(182, 198) # Hypertensive crisis
            dia_bp = random.randint(112, 124)
            spo2 = round(random.uniform(94.0, 97.0), 1)
            temp = round(random.uniform(37.0, 37.6), 1)
        else: # HIGH_FEVER
            hr = random.randint(105, 128)
            sys_bp = random.randint(122, 138)
            dia_bp = random.randint(80, 90)
            spo2 = round(random.uniform(94.0, 97.0), 1)
            temp = round(random.uniform(39.2, 40.5), 1) # Emergency fever
    else:
        # Normal physiological drift
        base_hr = patient["baselineHr"]
        if activity == "EXERCISE":
            base_hr += 35
        elif activity == "WALKING":
            base_hr += 15

        hr = max(55, min(140, base_hr + random.randint(-5, 5)))
        sys_bp = max(100, min(145, int(patient["baselineBp"].split('/')[0]) + random.randint(-4, 6)))
        dia_bp = max(65, min(92, int(patient["baselineBp"].split('/')[1]) + random.randint(-3, 4)))
        spo2 = round(max(94.0, min(100.0, patient["baselineSpo2"] + random.uniform(-0.8, 0.5))), 1)
        temp = round(max(36.2, min(37.8, patient["baselineTemp"] + random.uniform(-0.3, 0.4))), 1)

    blood_sugar = round(patient["baselineSugar"] + random.uniform(-5.0, 8.0), 1)

    return {
        "patientId": patient["patientId"],
        "name": patient["name"],
        "heartRate": hr,
        "systolicBp": sys_bp,
        "diastolicBp": dia_bp,
        "bloodPressure": f"{sys_bp}/{dia_bp}",
        "spO2": spo2,
        "bodyTemperature": temp,
        "bloodSugar": blood_sugar,
        "activityState": activity,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "isAbnormal": is_abnormal
    }

@app.route("/", methods=["GET"])
def health_check():
    return jsonify({
        "status": "UP",
        "service": "MediSphere Python Vital Simulator API",
        "version": "1.0-milestone3",
        "endpoints": ["/vitals", "/patients", "/simulate"]
    })

@app.route("/patients", methods=["GET"])
def get_patients():
    return jsonify(PATIENTS)

@app.route("/vitals", methods=["GET"])
def get_vitals():
    patient_id = request.args.get("patientId")
    if patient_id:
        target = next((p for p in PATIENTS if p["patientId"] == patient_id), PATIENTS[0])
        vitals = generate_vitals_for_patient(target)
    else:
        # Generate for all patients
        vitals = [generate_vitals_for_patient(p) for p in PATIENTS]
    return jsonify(vitals)

@app.route("/simulate", methods=["GET"])
def simulate_vitals():
    force = request.args.get("abnormal", "false").lower() == "true"
    patient_id = request.args.get("patientId", DEFAULT_PATIENT_ID)
    target = next((p for p in PATIENTS if p["patientId"] == patient_id), PATIENTS[0])
    
    reading = generate_vitals_for_patient(target, force_abnormal=force)
    return jsonify({
        "message": "Vital simulation reading generated",
        "reading": reading
    })

if __name__ == "__main__":
    print("=" * 60)
    print(" MEDISPHERE PYTHON VITAL SIMULATOR API (Milestone 3)")
    print(" Running on http://localhost:5000")
    print(" Endpoints: /vitals | /patients | /simulate")
    print("=" * 60)
    app.run(host="0.0.0.0", port=5000, debug=False)
