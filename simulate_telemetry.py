import time
import random
import json
import urllib.request
import urllib.error
import argparse
import sys
import math

# ─────────────────────────────────────────────
#  MediSphere Enhanced Wearable Telemetry Simulator
#  Simulates real BLE wearable sensor data streams
#  with physiologically accurate multi-state modeling
# ─────────────────────────────────────────────

GATEWAY_URL = "http://localhost:8080/vitals/wearable/publish"
DIRECT_URL  = "http://localhost:8083/vitals/wearable/publish"

DEFAULT_PATIENT_ID = "35f51e3e-66fd-4f87-85ad-affa0dde1156"

# ANSI color codes for console
RED     = "\033[91m"
YELLOW  = "\033[93m"
GREEN   = "\033[92m"
CYAN    = "\033[96m"
BLUE    = "\033[94m"
MAGENTA = "\033[95m"
DIM     = "\033[2m"
BOLD    = "\033[1m"
RESET   = "\033[0m"

# ─────────────────────────────────────────────
#  ACTIVITY STATE PROFILES
#  Each state defines physiological target ranges
# ─────────────────────────────────────────────
ACTIVITY_PROFILES = {
    "REST": {
        "hr_range":    (58, 72),
        "sys_range":   (112, 122),
        "spo2_range":  (97, 100),
        "temp_range":  (97.8, 98.4),
        "sugar_range": (88, 100),
        "duration_ticks": (8, 15),
        "color": GREEN,
    },
    "WALKING": {
        "hr_range":    (78, 98),
        "sys_range":   (118, 132),
        "spo2_range":  (96, 99),
        "temp_range":  (98.2, 99.0),
        "sugar_range": (92, 115),
        "duration_ticks": (6, 12),
        "color": CYAN,
    },
    "EXERCISE": {
        "hr_range":    (110, 148),
        "sys_range":   (130, 158),
        "spo2_range":  (94, 97),
        "temp_range":  (99.0, 100.4),
        "sugar_range": (110, 145),
        "duration_ticks": (5, 10),
        "color": YELLOW,
    },
    "RECOVERY": {
        "hr_range":    (80, 100),
        "sys_range":   (118, 130),
        "spo2_range":  (96, 99),
        "temp_range":  (98.6, 99.4),
        "sugar_range": (100, 125),
        "duration_ticks": (4, 8),
        "color": BLUE,
    },
    "STRESS": {
        "hr_range":    (90, 115),
        "sys_range":   (128, 148),
        "spo2_range":  (95, 98),
        "temp_range":  (98.4, 99.2),
        "sugar_range": (105, 150),
        "duration_ticks": (3, 7),
        "color": MAGENTA,
    },
    "SLEEP": {
        "hr_range":    (50, 64),
        "sys_range":   (104, 116),
        "spo2_range":  (95, 99),
        "temp_range":  (97.2, 97.8),
        "sugar_range": (82, 96),
        "duration_ticks": (10, 20),
        "color": DIM,
    },
}

# State transition probability matrix (from → to)
STATE_TRANSITIONS = {
    "REST":     ["WALKING", "SLEEP", "REST", "REST", "STRESS"],
    "WALKING":  ["REST", "EXERCISE", "WALKING", "WALKING", "RECOVERY"],
    "EXERCISE": ["RECOVERY", "RECOVERY", "EXERCISE"],
    "RECOVERY": ["REST", "WALKING", "REST"],
    "STRESS":   ["REST", "REST", "WALKING", "STRESS"],
    "SLEEP":    ["REST", "REST", "SLEEP", "SLEEP"],
}

# ─────────────────────────────────────────────
class EnhancedWearableSimulator:
    """
    Physiologically accurate wearable device simulator.
    Models 6 activity states with smooth random-walk drift,
    realistic transitions, optional anomaly injection,
    and color-coded console output.
    """

    def __init__(self, patient_id=DEFAULT_PATIENT_ID, interval=2.0,
                 anomaly_mode=False, profile="ADULT_NORMAL"):
        self.patient_id    = patient_id
        self.interval      = interval
        self.anomaly_mode  = anomaly_mode
        self.tick_count    = 0
        self.anomaly_injected = 0

        # Current activity state
        self.current_state = "REST"
        self.state_ticks_remaining = random.randint(8, 15)

        # Baseline vitals (smooth random-walk from here)
        self.hr       = 68.0
        self.systolic = 118.0
        self.diastolic= 78.0
        self.spo2     = 98.5
        self.temp     = 98.2
        self.sugar    = 94.0

        # Anomaly injection counter
        self._anomaly_countdown = random.randint(20, 40) if anomaly_mode else 999999

    # ── State Machine ────────────────────────
    def _transition_state(self):
        next_states = STATE_TRANSITIONS[self.current_state]
        self.current_state = random.choice(next_states)
        profile = ACTIVITY_PROFILES[self.current_state]
        lo, hi = profile["duration_ticks"]
        self.state_ticks_remaining = random.randint(lo, hi)

    def _get_target(self, key):
        profile = ACTIVITY_PROFILES[self.current_state]
        lo, hi = profile[key]
        return (lo + hi) / 2.0

    # ── Smooth Random Walk ───────────────────
    def _walk(self, current, target, speed=0.15, noise=0.5):
        """Smooth exponential walk towards target with small noise."""
        drift = (target - current) * speed
        jitter = random.gauss(0, noise)
        return current + drift + jitter

    # ── Anomaly Injection ────────────────────
    def _maybe_inject_anomaly(self):
        if not self.anomaly_mode:
            return None

        self._anomaly_countdown -= 1
        if self._anomaly_countdown > 0:
            return None

        # Reset countdown
        self._anomaly_countdown = random.randint(25, 45)
        self.anomaly_injected += 1

        anomaly_types = [
            "BRADYCARDIA",       # Very low heart rate
            "TACHYCARDIA",       # Very high heart rate
            "HYPOTENSION",       # Low BP
            "HYPERTENSION",      # High BP
            "SPO2_DIP",          # Oxygen drop
            "HYPOGLYCEMIA",      # Low blood sugar
            "HYPERGLYCEMIA",     # High blood sugar
            "FEVER",             # High temperature
        ]
        chosen = random.choice(anomaly_types)

        overrides = {}
        if chosen == "BRADYCARDIA":
            overrides["hr"] = random.uniform(36, 48)
        elif chosen == "TACHYCARDIA":
            overrides["hr"] = random.uniform(135, 158)
        elif chosen == "HYPOTENSION":
            overrides["systolic"] = random.uniform(72, 86)
            overrides["diastolic"] = random.uniform(46, 58)
        elif chosen == "HYPERTENSION":
            overrides["systolic"] = random.uniform(168, 192)
            overrides["diastolic"] = random.uniform(102, 118)
        elif chosen == "SPO2_DIP":
            overrides["spo2"] = random.uniform(84, 91)
        elif chosen == "HYPOGLYCEMIA":
            overrides["sugar"] = random.uniform(52, 68)
        elif chosen == "HYPERGLYCEMIA":
            overrides["sugar"] = random.uniform(195, 240)
        elif chosen == "FEVER":
            overrides["temp"] = random.uniform(101.5, 104.0)

        return chosen, overrides

    # ── Generate Vitals ──────────────────────
    def generate_next_vitals(self):
        self.tick_count += 1

        # Decrement state counter → maybe transition
        self.state_ticks_remaining -= 1
        if self.state_ticks_remaining <= 0:
            self._transition_state()

        # Walk towards current state targets
        self.hr       = self._walk(self.hr,       self._get_target("hr_range"),   speed=0.12, noise=0.8)
        self.systolic = self._walk(self.systolic, self._get_target("sys_range"),  speed=0.10, noise=0.6)
        self.spo2     = self._walk(self.spo2,     self._get_target("spo2_range"), speed=0.08, noise=0.15)
        self.temp     = self._walk(self.temp,     self._get_target("temp_range"), speed=0.05, noise=0.05)
        self.sugar    = self._walk(self.sugar,    self._get_target("sugar_range"),speed=0.08, noise=1.0)

        # Diastolic: physiologically linked to systolic (~65% rule)
        self.diastolic = self.systolic * 0.64 + random.gauss(0, 0.4)

        # Hard clamp to realistic physiological limits
        self.hr       = max(35,  min(200, self.hr))
        self.systolic = max(70,  min(200, self.systolic))
        self.diastolic= max(40,  min(120, self.diastolic))
        self.spo2     = max(82,  min(100, self.spo2))
        self.temp     = max(95.0,min(106.0, self.temp))
        self.sugar    = max(40,  min(300, self.sugar))

        anomaly_event = None

        # Maybe override with anomaly
        result = self._maybe_inject_anomaly()
        if result:
            anomaly_event, overrides = result
            for k, v in overrides.items():
                setattr(self, k, v)

        # Build payload (matches MediSphere VitalsService schema)
        payload = {
            "patientId":   self.patient_id,
            "heartbeat":   round(self.hr),
            "bloodpressure": f"{round(self.systolic)}/{round(self.diastolic)}",
            "oxygenlevel": round(self.spo2, 1),
            "bloodsuger":  round(self.sugar, 1),
            "pulserate":   round(self.hr) + random.randint(-1, 1),
            "temperature": round(self.temp, 1),
            "activityState": self.current_state,
        }

        return payload, self.current_state, anomaly_event

    # ── Send to API ──────────────────────────
    def send_telemetry(self, payload):
        json_data = json.dumps(payload).encode("utf-8")
        for url in [GATEWAY_URL, DIRECT_URL]:
            req = urllib.request.Request(
                url, data=json_data,
                headers={"Content-Type": "application/json"}
            )
            try:
                with urllib.request.urlopen(req, timeout=5) as resp:
                    if resp.status in [200, 201, 202]:
                        return True, url
            except:
                continue
        return False, None

    # ── Alert Level ──────────────────────────
    def _alert_level(self, payload):
        hr  = payload["heartbeat"]
        sys = int(payload["bloodpressure"].split("/")[0])
        spo2= payload["oxygenlevel"]
        sug = payload["bloodsuger"]
        temp= payload["temperature"]

        if hr < 40 or hr > 130 or sys > 180 or sys < 70 or spo2 < 90 or sug < 55 or sug > 200 or temp > 103:
            return "CRITICAL", RED
        if hr < 50 or hr > 110 or sys > 150 or sys < 85 or spo2 < 94 or sug < 70 or sug > 160 or temp > 100.5:
            return "WARNING", YELLOW
        return "NORMAL", GREEN

    # ── Main Loop ────────────────────────────
    def run_stream_loop(self, duration_sec=None):
        state_color = ACTIVITY_PROFILES[self.current_state]["color"]

        print(f"\n{BOLD}{'═'*85}{RESET}", flush=True)
        print(f"{BOLD}  🩺 MEDISPHERE ENHANCED WEARABLE TELEMETRY SIMULATOR{RESET}", flush=True)
        print(f"  Patient ID  : {CYAN}{self.patient_id}{RESET}", flush=True)
        print(f"  Interval    : {self.interval}s per tick", flush=True)
        print(f"  Anomaly Mode: {RED+'ON' if self.anomaly_mode else GREEN+'OFF'}{RESET}", flush=True)
        print(f"  Gateway     : {GATEWAY_URL}", flush=True)
        print(f"{BOLD}{'═'*85}{RESET}", flush=True)

        header = (
            f"{'Tick':<5} {'Time':<9} {'State':<10} "
            f"{'HR':>5} {'BP':>10} {'SpO2':>6} "
            f"{'Sugar':>7} {'Temp':>6} {'Alert':<10} {'Status'}"
        )
        print(f"{DIM}{header}{RESET}", flush=True)
        print(f"{DIM}{'-'*85}{RESET}", flush=True)

        start = time.time()

        try:
            while True:
                payload, state, anomaly = self.generate_next_vitals()
                ts = time.strftime("%H:%M:%S")
                state_color = ACTIVITY_PROFILES[state]["color"]
                alert_label, alert_color = self._alert_level(payload)

                sent, used_url = self.send_telemetry(payload)
                status_str = f"{GREEN}✓ SENT{RESET}" if sent else f"{RED}✗ FAIL{RESET}"

                anomaly_tag = ""
                if anomaly:
                    anomaly_tag = f"  {RED}{BOLD}⚠ ANOMALY: {anomaly}{RESET}"

                line = (
                    f"{self.tick_count:<5} {ts:<9} "
                    f"{state_color}{state:<10}{RESET} "
                    f"{payload['heartbeat']:>5} "
                    f"{payload['bloodpressure']:>10} "
                    f"{payload['oxygenlevel']:>6.1f} "
                    f"{payload['bloodsuger']:>7.1f} "
                    f"{payload['temperature']:>6.1f} "
                    f"{alert_color}{alert_label:<10}{RESET} "
                    f"{status_str}{anomaly_tag}"
                )
                print(line, flush=True)

                if duration_sec and (time.time() - start) >= duration_sec:
                    print(f"\n{GREEN}[INFO] Duration {duration_sec}s reached. Stopping.{RESET}", flush=True)
                    break

                time.sleep(self.interval)

        except KeyboardInterrupt:
            print(f"\n{BOLD}{'═'*85}{RESET}", flush=True)
            print(f"  {YELLOW}[STOP] Stream stopped.{RESET}  Ticks sent: {self.tick_count}  Anomalies injected: {self.anomaly_injected}", flush=True)
            print(f"{BOLD}{'═'*85}{RESET}\n", flush=True)


# ── Entry Point ──────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="MediSphere Enhanced Wearable Telemetry Simulator"
    )
    parser.add_argument("--patient-id", type=str,   default=DEFAULT_PATIENT_ID,
                        help="Target Patient UUID")
    parser.add_argument("--interval",   type=float, default=2.0,
                        help="Tick interval in seconds (default: 2.0)")
    parser.add_argument("--duration",   type=float, default=None,
                        help="Total run duration in seconds (optional)")
    parser.add_argument("--anomaly",    action="store_true", default=False,
                        help="Enable random anomaly injection (CRITICAL/WARNING alerts)")

    args = parser.parse_args()

    sim = EnhancedWearableSimulator(
        patient_id=args.patient_id,
        interval=args.interval,
        anomaly_mode=args.anomaly,
    )
    sim.run_stream_loop(duration_sec=args.duration)
