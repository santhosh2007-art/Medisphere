import copy
import random
import numpy as np
import tensorflow as tf
from model_def import build_keras_model, get_model_weights, set_model_weights

class FederatedLearningEngine:
    """
    Weighted Federated Averaging (FedAvg) Algorithm Engine.
    Simulates collaborative privacy-preserving training across N hospital nodes.
    
    Privacy Constraint: Raw patient datasets remain strictly within the hospital boundary.
    Only local model weight updates are transmitted to the server for aggregation.
    """
    def __init__(self, hospital_nodes, val_dataset, input_dim=10, learning_rate=0.001):
        self.hospital_nodes = hospital_nodes
        self.val_dataset = val_dataset
        self.input_dim = input_dim
        self.learning_rate = learning_rate
        
        # Initialize Global Server Model
        self.global_model = build_keras_model(input_dim=input_dim, learning_rate=learning_rate)
        self.global_weights = get_model_weights(self.global_model)
        
    def _train_local_client(self, hospital_node, current_global_weights, local_epochs=2, batch_size=32):
        """
        Simulates local training at a private Hospital Node.
        
        1. Loads copy of current global server model weights.
        2. Fits model on hospital's local private dataset (X_local, y_local).
        3. Returns updated local weights and local sample count.
        """
        # Instantiate local model for hospital node
        local_model = build_keras_model(input_dim=self.input_dim, learning_rate=self.learning_rate)
        set_model_weights(local_model, current_global_weights)
        
        X_local = hospital_node['X']
        y_local = hospital_node['y']
        
        # Local model training on private data boundary
        history = local_model.fit(
            X_local, y_local,
            epochs=local_epochs,
            batch_size=batch_size,
            verbose=0
        )
        
        local_loss = history.history['loss'][-1]
        local_acc = history.history['accuracy'][-1]
        updated_weights = get_model_weights(local_model)
        
        return updated_weights, hospital_node['n_samples'], local_loss, local_acc

    def _aggregate_fed_avg(self, client_weight_tuples):
        """
        Weighted Federated Averaging (FedAvg):
        w_global = sum( (n_k / N_total) * w_k )
        """
        total_samples = sum(n for _, n, _, _ in client_weight_tuples)
        
        # Initialize zero weights structure matching global model architecture
        aggregated_weights = [np.zeros_like(w) for w in client_weight_tuples[0][0]]
        
        for weights, n_samples, _, _ in client_weight_tuples:
            weight_factor = n_samples / total_samples
            for i in range(len(aggregated_weights)):
                aggregated_weights[i] += weights[i] * weight_factor
                
        return aggregated_weights

    def evaluate_global_model(self, X_val, y_val):
        """Evaluates global model on held-out validation set."""
        eval_res = self.global_model.evaluate(X_val, y_val, verbose=0)
        # Returns [loss, accuracy, auc, precision, recall]
        metrics = {
            'val_loss': float(eval_res[0]),
            'val_accuracy': float(eval_res[1]),
            'val_auc': float(eval_res[2]),
            'val_precision': float(eval_res[3]),
            'val_recall': float(eval_res[4])
        }
        return metrics

    def run_federated_training(self, num_rounds=50, clients_per_round=3, eval_freq=5, local_epochs=2):
        """
        Runs multiple rounds of Federated Learning across sampled hospital nodes.
        
        Returns:
        - final_model: Trained global Keras model
        - history_logs: List of dicts with round-by-round metrics
        """
        history_logs = []
        
        print("\n" + "="*75)
        print(f" STARTING FEDERATED LEARNING (FedAvg) — {num_rounds} ROUNDS")
        print(f" Total Hospitals: {len(self.hospital_nodes)} | Sampled/Round: {clients_per_round}")
        print("="*75)
        print(f"{'Round':<8} | {'Train Loss':<12} | {'Train Acc':<12} | {'Val Acc':<12} | {'Val AUC':<10} | {'Status':<15}")
        print("-" * 75)
        
        for r in range(1, num_rounds + 1):
            # a. Sample client hospitals per round
            sampled_hospitals = random.sample(self.hospital_nodes, k=min(clients_per_round, len(self.hospital_nodes)))
            
            # b. Parallel local client training at hospital nodes
            client_results = []
            for hospital in sampled_hospitals:
                res = self._train_local_client(hospital, self.global_weights, local_epochs=local_epochs)
                client_results.append(res)
                
            # Compute average training loss/acc across sampled hospitals
            avg_train_loss = float(np.mean([res[2] for res in client_results]))
            avg_train_acc = float(np.mean([res[3] for res in client_results]))
            
            # c. Weighted FedAvg Aggregation on Server
            self.global_weights = self._aggregate_fed_avg(client_results)
            set_model_weights(self.global_model, self.global_weights)
            
            # d. Evaluate Global Model every `eval_freq` rounds or final round
            is_eval_round = (r == 1 or r % eval_freq == 0 or r == num_rounds)
            if is_eval_round:
                val_metrics = self.evaluate_global_model(self.val_dataset['X'], self.val_dataset['y'])
                val_acc = val_metrics['val_accuracy']
                val_auc = val_metrics['val_auc']
                status = "EVALUATED"
            else:
                val_acc = history_logs[-1]['val_accuracy'] if history_logs else 0.0
                val_auc = history_logs[-1]['val_auc'] if history_logs else 0.0
                val_metrics = history_logs[-1] if history_logs else {'val_loss': 0.0, 'val_accuracy': 0.0, 'val_auc': 0.0, 'val_precision': 0.0, 'val_recall': 0.0}
                status = "AGGREGATED"
                
            log_entry = {
                'round': r,
                'train_loss': round(avg_train_loss, 4),
                'train_accuracy': round(avg_train_acc, 4),
                'val_loss': round(val_metrics['val_loss'], 4),
                'val_accuracy': round(val_acc, 4),
                'val_auc': round(val_auc, 4),
                'val_precision': round(val_metrics['val_precision'], 4),
                'val_recall': round(val_metrics['val_recall'], 4),
                'participating_hospitals': [h['hospital_id'] for h in sampled_hospitals]
            }
            history_logs.append(log_entry)
            
            # Print Summary Row
            print(f"{r:<8} | {avg_train_loss:<12.4f} | {avg_train_acc:<12.4f} | {val_acc:<12.4f} | {val_auc:<10.4f} | {status:<15}")
            
        print("="*75 + "\n")
        return self.global_model, history_logs

if __name__ == "__main__":
    from data_partition import prepare_federated_datasets
    nodes, val_data, _ = prepare_federated_datasets('cvd', num_hospitals=5)
    engine = FederatedLearningEngine(nodes, val_data)
    model, logs = engine.run_federated_training(num_rounds=10, clients_per_round=3, eval_freq=2)
