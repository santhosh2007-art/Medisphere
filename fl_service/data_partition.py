import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split

# Feature column names as specified
FEATURE_NAMES = [
    'age', 'sex', 'bmi', 'blood_pressure', 'cholesterol',
    'hba1c', 'smoking_status', 'glucose', 'family_history', 'exercise_freq'
]

def generate_synthetic_healthcare_data(dataset_type='cvd', n_samples=3000, random_seed=42):
    """
    Generates synthetic patient biometric data for CVD or Diabetes risk modeling.
    Returns DataFrame with 10 biometric features + 1 binary risk target.
    """
    np.random.seed(random_seed)
    
    # 1. Base Feature Generation
    age = np.random.randint(20, 81, size=n_samples)
    sex = np.random.choice([0, 1], size=n_samples, p=[0.52, 0.48]) # 0=Female, 1=Male
    bmi = np.round(np.random.normal(27.5, 5.5, size=n_samples), 1)
    bmi = np.clip(bmi, 16.0, 48.0)
    
    blood_pressure = np.round(np.random.normal(128, 18, size=n_samples), 1) # Systolic BP
    blood_pressure = np.clip(blood_pressure, 85.0, 200.0)
    
    cholesterol = np.round(np.random.normal(210, 35, size=n_samples), 1)
    cholesterol = np.clip(cholesterol, 120.0, 360.0)
    
    hba1c = np.round(np.random.normal(5.8, 1.2, size=n_samples), 1)
    hba1c = np.clip(hba1c, 4.0, 13.0)
    
    smoking_status = np.random.choice([0, 1, 2], size=n_samples, p=[0.55, 0.25, 0.20]) # 0=Never, 1=Former, 2=Current
    glucose = np.round(np.random.normal(105, 30, size=n_samples), 1)
    glucose = np.clip(glucose, 65.0, 300.0)
    
    family_history = np.random.choice([0, 1], size=n_samples, p=[0.65, 0.35])
    exercise_freq = np.random.choice([0, 1, 2], size=n_samples, p=[0.35, 0.45, 0.20]) # 0=Low, 1=Moderate, 2=High
    
    df = pd.DataFrame({
        'age': age,
        'sex': sex,
        'bmi': bmi,
        'blood_pressure': blood_pressure,
        'cholesterol': cholesterol,
        'hba1c': hba1c,
        'smoking_status': smoking_status,
        'glucose': glucose,
        'family_history': family_history,
        'exercise_freq': exercise_freq
    })
    
    # 2. Risk Target Scoring Logic (Ground Truth Generation)
    if dataset_type.lower() == 'cvd':
        # CVD Risk Formula Weights
        score = (
            (age > 55) * 1.5 +
            (blood_pressure > 140) * 2.0 +
            (cholesterol > 220) * 1.8 +
            (bmi > 30) * 1.2 +
            (smoking_status == 2) * 1.6 +
            (family_history == 1) * 1.4 +
            (exercise_freq == 0) * 0.8 +
            np.random.normal(0, 0.8, size=n_samples) # Realistic clinical noise
        )
        threshold = 3.5
    else: # Diabetes Risk
        # Diabetes Risk Formula Weights
        score = (
            (hba1c > 6.5) * 2.5 +
            (glucose > 125) * 2.2 +
            (bmi > 30) * 1.8 +
            (age > 45) * 1.0 +
            (family_history == 1) * 1.5 +
            (exercise_freq == 0) * 1.0 +
            np.random.normal(0, 0.8, size=n_samples)
        )
        threshold = 3.8
        
    df['risk_label'] = (score >= threshold).astype(int)
    return df

def partition_data_non_iid(df, num_hospitals=5, random_seed=42):
    """
    Splits the dataset into N Non-IID hospital node partitions.
    Each hospital simulates a specific patient demographic profile.
    """
    np.random.seed(random_seed)
    n = len(df)
    
    # Sort data by demographic features to introduce Non-IID skew across hospital nodes
    if 'age' in df.columns and 'risk_label' in df.columns:
        # Sort by combination of age and risk label
        df_sorted = df.sort_values(by=['age', 'risk_label']).reset_index(drop=True)
    else:
        df_sorted = df.sample(frac=1, random_state=random_seed).reset_index(drop=True)
        
    # Divide into N non-uniform slices
    partitions = []
    chunk_size = n // num_hospitals
    
    for i in range(num_hospitals):
        start_idx = i * chunk_size
        end_idx = (i + 1) * chunk_size if i < num_hospitals - 1 else n
        hospital_df = df_sorted.iloc[start_idx:end_idx].copy()
        
        # Shuffle internally within hospital node
        hospital_df = hospital_df.sample(frac=1, random_state=random_seed + i).reset_index(drop=True)
        partitions.append(hospital_df)
        
    return partitions

def prepare_federated_datasets(dataset_type='cvd', num_hospitals=5, test_size=0.2, random_seed=42):
    """
    Full Data Preparation Pipeline:
    1. Generates synthetic data for target condition.
    2. Splits into Train and Held-Out Validation set.
    3. Partitions Training set into N Non-IID Hospital datasets.
    4. Normalizes feature matrices using a unified StandardScaler.
    
    Returns:
    - hospital_nodes: list of dicts [{'hospital_id': i, 'X': np_array, 'y': np_array, 'n_samples': int}]
    - val_dataset: dict {'X': np_array, 'y': np_array}
    - scaler: Fitted StandardScaler object
    """
    df = generate_synthetic_healthcare_data(dataset_type=dataset_type, n_samples=3000, random_seed=random_seed)
    
    # Split into Train and Central Held-Out Validation Set
    train_df, val_df = train_test_split(df, test_size=test_size, random_state=random_seed, stratify=df['risk_label'])
    
    # Fit StandardScaler on Training Set
    X_train_raw = train_df[FEATURE_NAMES].values
    y_train_raw = train_df['risk_label'].values
    
    scaler = StandardScaler()
    scaler.fit(X_train_raw)
    
    X_val = scaler.transform(val_df[FEATURE_NAMES].values)
    y_val = val_df['risk_label'].values.astype(np.float32)
    
    # Partition Training DF into Non-IID Hospital Slices
    hospital_dfs = partition_data_non_iid(train_df, num_hospitals=num_hospitals, random_seed=random_seed)
    
    hospital_nodes = []
    for idx, h_df in enumerate(hospital_dfs):
        X_h = scaler.transform(h_df[FEATURE_NAMES].values)
        y_h = h_df['risk_label'].values.astype(np.float32)
        
        hospital_nodes.append({
            'hospital_id': f"Hospital_{chr(65 + idx)}", # Hospital_A, Hospital_B, etc.
            'X': X_h,
            'y': y_h,
            'n_samples': len(y_h),
            'pos_ratio': float(np.mean(y_h))
        })
        
    val_dataset = {
        'X': X_val,
        'y': y_val,
        'n_samples': len(y_val)
    }
    
    return hospital_nodes, val_dataset, scaler

if __name__ == "__main__":
    nodes, val_data, _ = prepare_federated_datasets(dataset_type='cvd', num_hospitals=5)
    print(f"=== Non-IID Data Partition Summary ===")
    print(f"Validation Set Samples: {val_data['n_samples']}")
    for node in nodes:
        print(f"[{node['hospital_id']}] Samples: {node['n_samples']} | Positive Risk Ratio: {node['pos_ratio']*100:.1f}%")
