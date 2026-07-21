import argparse
import json
from data_partition import prepare_federated_datasets
from federated_train import FederatedLearningEngine
from model_registry import FederatedModelRegistry

def train_federated_model(dataset_type='cvd', num_hospitals=5, num_rounds=50, clients_per_round=3, eval_freq=5):
    """
    Main reusable Federated Learning pipeline for CVD and Diabetes Risk Prediction.
    
    Parameters:
    - dataset_type (str): 'cvd' or 'diabetes'
    - num_hospitals (int): Number of simulated hospital partitions (default 5)
    - num_rounds (int): Number of FL training rounds (default 50)
    - clients_per_round (int): Number of hospitals sampled per round (default 3)
    - eval_freq (int): Validation evaluation interval (default 5)
    
    Returns:
    - global_model: Final trained Keras Model
    - history_logs: Round-by-round accuracy/loss log (list of dicts)
    - metadata: FLModel metadata dictionary
    """
    dataset_type = dataset_type.lower()
    if dataset_type not in ['cvd', 'diabetes']:
        raise ValueError("dataset_type must be either 'cvd' or 'diabetes'.")
        
    print(f"\n[FL Pipeline] Initializing Federated Learning for Dataset: '{dataset_type.upper()}'")
    
    # 1. Partition Data across N Hospital Nodes (Non-IID)
    hospital_nodes, val_dataset, scaler = prepare_federated_datasets(
        dataset_type=dataset_type,
        num_hospitals=num_hospitals
    )
    
    # 2. Build Federated Training Engine
    fl_engine = FederatedLearningEngine(
        hospital_nodes=hospital_nodes,
        val_dataset=val_dataset,
        input_dim=10,
        learning_rate=0.001
    )
    
    # 3. Execute Multi-Round Federated Averaging Training Loop
    global_model, history_logs = fl_engine.run_federated_training(
        num_rounds=num_rounds,
        clients_per_round=clients_per_round,
        eval_freq=eval_freq
    )
    
    # 4. Extract and Save Versioned Model Artifact + FLModel Metadata
    registry = FederatedModelRegistry()
    extra_config = {
        "datasetType": dataset_type,
        "inputDim": 10,
        "features": [
            'age', 'sex', 'bmi', 'blood_pressure', 'cholesterol',
            'hba1c', 'smoking_status', 'glucose', 'family_history', 'exercise_freq'
        ],
        "optimizer": "Adam(lr=0.001)",
        "aggregationAlgorithm": "Weighted Federated Averaging (FedAvg)",
        "batchSize": 32,
        "localEpochs": 2
    }
    metadata = registry.save_federated_model(
        model=global_model,
        dataset_type=dataset_type,
        total_rounds=num_rounds,
        num_hospitals=num_hospitals,
        history_logs=history_logs,
        extra_config=extra_config
    )
    
    # 5. Print Final Summary Table
    print("\n" + "="*60)
    print(f" FEDERATED LEARNING SUMMARY TABLE ({dataset_type.upper()})")
    print("="*60)
    print(f"{'Round':<8} | {'Train Loss':<12} | {'Train Acc':<12} | {'Val Acc':<12}")
    print("-" * 60)
    for log in history_logs:
        if log['round'] == 1 or log['round'] % eval_freq == 0 or log['round'] == num_rounds:
            print(f"{log['round']:<8} | {log['train_loss']:<12.4f} | {log['train_accuracy']:<12.4f} | {log['val_accuracy']:<12.4f}")
    print("="*60)
    print(f"Final Model ID: {metadata['modelId']}")
    print(f"Final Validation Accuracy: {metadata['finalValAccuracy']*100:.2f}%")
    print(f"Final Validation AUC:      {metadata['finalValAuc']:.4f}\n")
    
    return global_model, history_logs, metadata

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run Federated Learning for Healthcare Risk Prediction")
    parser.add_argument("--dataset", type=str, default="cvd", choices=["cvd", "diabetes"], help="Dataset type: 'cvd' or 'diabetes'")
    parser.add_argument("--hospitals", type=int, default=5, help="Number of hospital partitions (default 5)")
    parser.add_argument("--rounds", type=int, default=20, help="Number of training rounds (default 20)")
    
    args = parser.parse_args()
    train_federated_model(dataset_type=args.dataset, num_hospitals=args.hospitals, num_rounds=args.rounds)
