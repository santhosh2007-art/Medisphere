import os
import json
import uuid
import datetime

class FederatedModelRegistry:
    """
    Model Artifact and Versioning Registry for Federated Learning.
    Saves global model binaries (.h5 / .keras) and records training metadata (FLModel JSON store).
    """
    def __init__(self, registry_dir="fl_model_registry"):
        self.registry_dir = registry_dir
        os.makedirs(self.registry_dir, exist_ok=True)
        self.metadata_index_path = os.path.join(self.registry_dir, "model_registry_index.json")
        
    def save_federated_model(self, model, dataset_type, total_rounds, num_hospitals, history_logs, extra_config=None):
        """
        Saves the global model artifact and generates metadata record.
        """
        model_uuid = f"FL-{dataset_type.upper()}-{uuid.uuid4().hex[:8]}"
        timestamp_str = datetime.datetime.utcnow().isoformat() + "Z"
        
        # Save model binary weights
        model_filename = f"{model_uuid}.h5"
        model_filepath = os.path.join(self.registry_dir, model_filename)
        model.save(model_filepath)
        
        # Extract final round metrics
        final_metrics = history_logs[-1] if history_logs else {}
        
        metadata = {
            "modelId": model_uuid,
            "datasetType": dataset_type.lower(),
            "modelVersion": "1.0.0",
            "modelFilePath": model_filepath,
            "totalRounds": total_rounds,
            "numHospitals": num_hospitals,
            "finalValAccuracy": final_metrics.get("val_accuracy", 0.0),
            "finalValAuc": final_metrics.get("val_auc", 0.0),
            "finalValPrecision": final_metrics.get("val_precision", 0.0),
            "finalValRecall": final_metrics.get("val_recall", 0.0),
            "finalTrainLoss": final_metrics.get("train_loss", 0.0),
            "timestamp": timestamp_str,
            "trainingConfig": extra_config or {
                "optimizer": "Adam(lr=0.001)",
                "aggregationAlgorithm": "Weighted Federated Averaging (FedAvg)",
                "batchSize": 32,
                "localEpochs": 2
            },
            "roundHistory": history_logs
        }
        
        # Save individual metadata JSON file
        json_filename = f"{model_uuid}_metadata.json"
        json_filepath = os.path.join(self.registry_dir, json_filename)
        with open(json_filepath, "w") as f:
            json.dump(metadata, f, indent=2)
            
        # Update Central Registry Index
        self._update_index(metadata)
        
        print(f"[ModelRegistry] Model saved to: {model_filepath}")
        print(f"[ModelRegistry] Metadata recorded: {json_filepath}")
        return metadata

    def _update_index(self, new_metadata):
        index = []
        if os.path.exists(self.metadata_index_path):
            try:
                with open(self.metadata_index_path, "r") as f:
                    index = json.load(f)
            except Exception:
                index = []
                
        # Remove existing if same modelId
        index = [m for m in index if m.get("modelId") != new_metadata["modelId"]]
        index.append(new_metadata)
        
        with open(self.metadata_index_path, "w") as f:
            json.dump(index, f, indent=2)

    def list_registered_models(self):
        if os.path.exists(self.metadata_index_path):
            with open(self.metadata_index_path, "r") as f:
                return json.load(f)
        return []

if __name__ == "__main__":
    from model_def import build_keras_model
    reg = FederatedModelRegistry()
    m = build_keras_model()
    fake_history = [{'round': 1, 'val_accuracy': 0.85, 'val_auc': 0.90}]
    meta = reg.save_federated_model(m, 'cvd', 10, 5, fake_history)
    print("Registered Models Count:", len(reg.list_registered_models()))
