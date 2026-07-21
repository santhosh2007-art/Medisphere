import math
import random
import json
import uuid
import datetime
import os

FEATURE_NAMES = [
    'age', 'sex', 'bmi', 'blood_pressure', 'cholesterol',
    'hba1c', 'smoking_status', 'glucose', 'family_history', 'exercise_freq'
]

class StandaloneFLSimulation:
    """
    Zero-dependency pure Python implementation of Federated Learning (FedAvg).
    Exposes identical API structure and generates identical metadata JSON schemas.
    """
    def __init__(self, dataset_type='cvd', num_hospitals=5, n_samples=2000, random_seed=42):
        self.dataset_type = dataset_type.lower()
        self.num_hospitals = num_hospitals
        self.n_samples = n_samples
        random.seed(random_seed)
        
        # 1. Generate Synthetic Patient Dataset
        self.data = self._generate_synthetic_data()
        
        # 2. Split into Train & Validation
        split_idx = int(len(self.data) * 0.8)
        self.train_data = self.data[:split_idx]
        self.val_data = self.data[split_idx:]
        
        # 3. Partition Train Data into N Non-IID Hospitals
        self.hospitals = self._partition_hospitals()
        
        # 4. Global Server Weights (10 feature weights + 1 bias)
        self.input_dim = 10
        self.global_weights = [random.uniform(-0.1, 0.1) for _ in range(self.input_dim)]
        self.global_bias = 0.0

    def _sigmoid(self, z):
        return 1.0 / (1.0 + math.exp(-max(-50.0, min(50.0, z))))

    def _predict(self, x, weights, bias):
        z = sum(w * xi for w, xi in zip(weights, x)) + bias
        return self._sigmoid(z)

    def _generate_synthetic_data(self):
        dataset = []
        for _ in range(self.n_samples):
            age = random.randint(20, 80)
            sex = random.choice([0, 1])
            bmi = round(random.normalvariate(27.5, 5.0), 1)
            bp = round(random.normalvariate(128, 15), 1)
            chol = round(random.normalvariate(210, 30), 1)
            hba1c = round(random.normalvariate(5.8, 1.0), 1)
            smoke = random.choice([0, 1, 2])
            glucose = round(random.normalvariate(105, 25), 1)
            fam = random.choice([0, 1])
            ex = random.choice([0, 1, 2])
            
            # Feature normalization
            x_norm = [
                (age - 20) / 60.0,
                float(sex),
                (bmi - 16) / 32.0,
                (bp - 85) / 115.0,
                (chol - 120) / 240.0,
                (hba1c - 4.0) / 9.0,
                smoke / 2.0,
                (glucose - 65) / 235.0,
                float(fam),
                ex / 2.0
            ]
            
            if self.dataset_type == 'cvd':
                score = ((age > 55)*1.5 + (bp > 140)*2.0 + (chol > 220)*1.8 + (bmi > 30)*1.2 + (smoke == 2)*1.6)
                label = 1 if score >= 3.5 else 0
            else:
                score = ((hba1c > 6.5)*2.5 + (glucose > 125)*2.2 + (bmi > 30)*1.8 + (age > 45)*1.0)
                label = 1 if score >= 3.8 else 0
                
            dataset.append({'x': x_norm, 'y': label})
        return dataset

    def _partition_hospitals(self):
        # Non-IID sorting by feature skew
        sorted_train = sorted(self.train_data, key=lambda d: d['x'][0]) # Sort by normalized age
        chunk_size = len(sorted_train) // self.num_hospitals
        hospitals = []
        for i in range(self.num_hospitals):
            start = i * chunk_size
            end = (i + 1) * chunk_size if i < self.num_hospitals - 1 else len(sorted_train)
            slice_data = sorted_train[start:end]
            random.shuffle(slice_data)
            hospitals.append({
                'hospital_id': f"Hospital_{chr(65+i)}",
                'data': slice_data,
                'n_samples': len(slice_data)
            })
        return hospitals

    def _train_local(self, hospital, g_w, g_b, epochs=2, lr=0.01):
        weights = list(g_w)
        bias = g_b
        data = hospital['data']
        
        for _ in range(epochs):
            for sample in data:
                x, y = sample['x'], sample['y']
                pred = self._predict(x, weights, bias)
                err = pred - y
                for j in range(len(weights)):
                    weights[j] -= lr * err * x[j]
                bias -= lr * err
                
        # Evaluate local loss/acc
        correct = 0
        total_loss = 0.0
        for sample in data:
            p = self._predict(sample['x'], weights, bias)
            total_loss += - (sample['y'] * math.log(max(1e-7, p)) + (1 - sample['y']) * math.log(max(1e-7, 1 - p)))
            if (p >= 0.5 and sample['y'] == 1) or (p < 0.5 and sample['y'] == 0):
                correct += 1
                
        return weights, bias, len(data), total_loss / len(data), correct / len(data)

    def evaluate_validation(self, weights, bias):
        correct = 0
        total_loss = 0.0
        for sample in self.val_data:
            p = self._predict(sample['x'], weights, bias)
            total_loss += - (sample['y'] * math.log(max(1e-7, p)) + (1 - sample['y']) * math.log(max(1e-7, 1 - p)))
            if (p >= 0.5 and sample['y'] == 1) or (p < 0.5 and sample['y'] == 0):
                correct += 1
        return total_loss / len(self.val_data), correct / len(self.val_data)

    def train_federated_loop(self, num_rounds=20, clients_per_round=3, eval_freq=5):
        history = []
        print("\n" + "="*65)
        print(f" FEDERATED LEARNING (FedAvg) SIMULATION — {self.dataset_type.upper()}")
        print(f" Hospitals: {self.num_hospitals} | Sampled/Round: {clients_per_round} | Rounds: {num_rounds}")
        print("="*65)
        print(f"{'Round':<8} | {'Train Loss':<12} | {'Train Acc':<12} | {'Val Acc':<12} | {'Status':<12}")
        print("-" * 65)
        
        for r in range(1, num_rounds + 1):
            sampled = random.sample(self.hospitals, k=min(clients_per_round, self.num_hospitals))
            
            client_results = []
            for h in sampled:
                res = self._train_local(h, self.global_weights, self.global_bias)
                client_results.append(res)
                
            # Weighted FedAvg aggregation
            total_n = sum(res[2] for res in client_results)
            new_g_w = [0.0] * self.input_dim
            new_g_b = 0.0
            
            avg_loss = sum(res[3] * res[2] for res in client_results) / total_n
            avg_acc = sum(res[4] * res[2] for res in client_results) / total_n
            
            for w, b, n, _, _ in client_results:
                factor = n / total_n
                for j in range(self.input_dim):
                    new_g_w[j] += w[j] * factor
                new_g_b += b * factor
                
            self.global_weights = new_g_w
            self.global_bias = new_g_b
            
            is_eval = (r == 1 or r % eval_freq == 0 or r == num_rounds)
            if is_eval:
                val_loss, val_acc = self.evaluate_validation(self.global_weights, self.global_bias)
                status = "EVALUATED"
            else:
                val_acc = history[-1]['val_accuracy'] if history else 0.0
                val_loss = history[-1]['val_loss'] if history else 0.0
                status = "AGGREGATED"
                
            log_entry = {
                'round': r,
                'train_loss': round(avg_loss, 4),
                'train_accuracy': round(avg_acc, 4),
                'val_loss': round(val_loss, 4),
                'val_accuracy': round(val_acc, 4),
                'participating_hospitals': [h['hospital_id'] for h in sampled]
            }
            history.append(log_entry)
            print(f"{r:<8} | {avg_loss:<12.4f} | {avg_acc:<12.4f} | {val_acc:<12.4f} | {status:<12}")
            
        print("="*65 + "\n")
        
        # Save Metadata JSON
        os.makedirs("fl_model_registry", exist_ok=True)
        model_id = f"FL-{self.dataset_type.upper()}-{uuid.uuid4().hex[:8]}"
        meta = {
            "modelId": model_id,
            "datasetType": self.dataset_type,
            "modelVersion": "1.0.0",
            "totalRounds": num_rounds,
            "numHospitals": self.num_hospitals,
            "finalValAccuracy": history[-1]['val_accuracy'],
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
            "weights": self.global_weights,
            "bias": self.global_bias,
            "roundHistory": history
        }
        with open(f"fl_model_registry/{model_id}_metadata.json", "w") as f:
            json.dump(meta, f, indent=2)
            
        print(f"[SUCCESS] Standalone FL Run Complete. Metadata saved to fl_model_registry/{model_id}_metadata.json")
        return history, meta

if __name__ == "__main__":
    sim = StandaloneFLSimulation(dataset_type='cvd', num_hospitals=5, n_samples=2000)
    sim.train_federated_loop(num_rounds=20, clients_per_round=3, eval_freq=5)
