import time
import random
import json
import urllib.request
import urllib.error
import argparse
import sys

# Target API Endpoint
GATEWAY_URL = "http://localhost:8080/vitals/wearable/publish"
DIRECT_URL = "http://localhost:8083/vitals/wearable/publish"

DEFAULT_PATIENT_ID = "35f51e3e-66fd-4f87-85ad-affa0dde1156"

class DynamicWearableSensorSimulator:
    """
    Simulates a smart medical wearable device continuously generating dynamic 
    physiological biometric telemetry (Heart Rate, BP, SpO2, Blood Sugar).
    Publishes JSON readings to Spring Cloud Gateway -> Spring Kafka Producer -> MongoDB.
    """
    def __init__(self, patient_id=DEFAULT_PATIENT_ID, interval=2.0):
        self.patient_id = patient_id
        self.interval = interval
        
        # Initial physiological baseline state
        self.heartbeat = 72
        self.systolic = 120
        self.diastolic = 80
        self.oxygenlevel = 98
        self.bloodsuger = 95.0
        self.pulserate = 72
        
        # Simulation event counter
        self.tick_count = 0

    def generate_next_vitals(self):
        """
        Applies a realistic physiological random-walk drift model to vitals data,
        punctuated by occasional stress/exercise events.
        """
        self.tick_count += 1
        
        # Every 10 ticks, trigger a simulated physiological state transition
        event_name = "NORMAL_DRIFT"
        if self.tick_count % 15 in [5, 6, 7]:
            event_name = "EXERCISE_BURST"
            hb_delta = random.randint(3, 7)
            bp_sys_delta = random.randint(2, 5)
            sugar_delta = round(random.uniform(0.5, 2.0), 1)
        elif self.tick_count % 15 in [11, 12]:
            event_name = "RECOVERY_REST"
            hb_delta = -random.randint(2, 5)
            bp_sys_delta = -random.randint(1, 4)
            sugar_delta = -round(random.uniform(0.3, 1.5), 1)
        else:
            hb_delta = random.choice([-2, -1, 0, 1, 2])
            bp_sys_delta = random.choice([-2, -1, 0, 1, 2])
            sugar_delta = round(random.uniform(-1.0, 1.0), 1)
            
        # Update Vitals within physiological safety bounds
        self.heartbeat = max(55, min(145, self.heartbeat + hb_delta))
        self.pulserate = self.heartbeat + random.choice([-1, 0, 1])
        
        self.systolic = max(100, min(160, self.systolic + bp_sys_delta))
        self.diastolic = max(65, min(100, int(self.systolic * 0.65)))
        
        self.oxygenlevel = max(94, min(100, self.oxygenlevel + random.choice([-1, 0, 0, 1])))
        self.bloodsuger = round(max(70.0, min(220.0, self.bloodsuger + sugar_delta)), 1)
        
        payload = {
            "patientId": self.patient_id,
            "heartbeat": self.heartbeat,
            "bloodpressure": f"{self.systolic}/{self.diastolic}",
            "oxygenlevel": self.oxygenlevel,
            "bloodsuger": self.bloodsuger,
            "pulserate": self.pulserate
        }
        return payload, event_name

    def send_telemetry_packet(self, payload):
        """Sends HTTP POST JSON payload to gateway / vitals service."""
        json_data = json.dumps(payload).encode('utf-8')
        
        # Try Gateway first, fallback to direct VitalsService port 8083
        urls_to_try = [GATEWAY_URL, DIRECT_URL]
        
        for url in urls_to_try:
            req = urllib.request.Request(
                url,
                data=json_data,
                headers={'Content-Type': 'application/json'}
            )
            try:
                with urllib.request.urlopen(req, timeout=5) as response:
                    if response.status in [200, 201, 202]:
                        return True, f"HTTP {response.status} OK", url
            except urllib.error.HTTPError as e:
                resp_text = e.read().decode('utf-8') if e.fp else str(e)
                # If HTTPError, try next URL
                continue
            except Exception as e:
                continue
                
        return False, "Failed to connect to Gateway or Vitals Service", GATEWAY_URL

    def run_stream_loop(self, duration_sec=None):
        """Main dynamic streaming loop."""
        print("\n" + "="*75, flush=True)
        print(f" MEDISPHERE DYNAMIC WEARABLE TELEMETRY SIMULATOR", flush=True)
        print(f" Target Patient ID : {self.patient_id}", flush=True)
        print(f" Stream Interval  : {self.interval} seconds", flush=True)
        print(f" Target Endpoint  : {GATEWAY_URL}", flush=True)
        print("="*75, flush=True)
        print(f"{'Tick':<6} | {'Timestamp':<12} | {'HR (bpm)':<8} | {'BP (mmHg)':<10} | {'SpO2 (%)':<9} | {'Sugar (mg/dL)':<13} | {'Status':<15}", flush=True)
        print("-" * 75, flush=True)
        
        start_time = time.time()
        
        try:
            while True:
                payload, event_name = self.generate_next_vitals()
                timestamp_str = time.strftime("%H:%M:%S")
                
                success, status_msg, used_url = self.send_telemetry_packet(payload)
                
                status_icon = "[SENT OK]" if success else "[PENDING]"
                
                print(
                    f"{self.tick_count:<6} | {timestamp_str:<12} | "
                    f"{payload['heartbeat']:<8} | {payload['bloodpressure']:<10} | "
                    f"{payload['oxygenlevel']:<9} | {payload['bloodsuger']:<13.1f} | "
                    f"{status_icon} ({event_name})",
                    flush=True
                )
                
                if duration_sec and (time.time() - start_time) >= duration_sec:
                    print(f"\n[INFO] Simulation duration of {duration_sec}s reached. Stopping.", flush=True)
                    break
                    
                time.sleep(self.interval)
                
        except KeyboardInterrupt:
            print("\n" + "="*75, flush=True)
            print(" [STOP] Dynamic Telemetry Stream stopped by user.", flush=True)
            print("="*75 + "\n", flush=True)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="MediSphere Dynamic Wearable Telemetry Simulator")
    parser.add_argument("--patient-id", type=str, default=DEFAULT_PATIENT_ID, help="Target Patient UUID")
    parser.add_argument("--interval", type=float, default=2.0, help="Stream tick interval in seconds (default: 2.0)")
    parser.add_argument("--duration", type=float, default=None, help="Optional total run duration in seconds")
    
    args = parser.parse_args()
    
    simulator = DynamicWearableSensorSimulator(patient_id=args.patient_id, interval=args.interval)
    simulator.run_stream_loop(duration_sec=args.duration)
