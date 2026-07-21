import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout, Input
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.metrics import AUC, Precision, Recall

def build_keras_model(input_dim=10, learning_rate=0.001):
    """
    Builds and compiles the base Keras Sequential Neural Network
    for binary cardiovascular / diabetes risk prediction.
    
    Architecture:
    Input(n_features) -> Dense(64, relu) -> Dropout(0.3) -> Dense(32, relu) -> Dense(1, sigmoid)
    """
    model = Sequential([
        Input(shape=(input_dim,)),
        Dense(64, activation='relu', name='dense_1'),
        Dropout(0.3, name='dropout_1'),
        Dense(32, activation='relu', name='dense_2'),
        Dense(1, activation='sigmoid', name='output_risk')
    ], name="FL_Base_Risk_Model")

    optimizer = Adam(learning_rate=learning_rate)
    
    model.compile(
        optimizer=optimizer,
        loss=tf.keras.losses.BinaryCrossentropy(),
        metrics=[
            'accuracy',
            AUC(name='auc'),
            Precision(name='precision'),
            Recall(name='recall')
        ]
    )
    
    return model

def get_model_weights(model):
    """Returns list of numpy arrays representing model weights."""
    return model.get_weights()

def set_model_weights(model, weights):
    """Sets model weights from list of numpy arrays."""
    model.set_weights(weights)

def build_tff_model_wrapper(input_dim=10):
    """
    Attempts to wrap the Keras model using TensorFlow Federated (tff.learning).
    If TFF is not installed or encounters version mismatch, provides standard Keras reference.
    """
    try:
        import tensorflow_federated as tff
        
        def model_fn():
            keras_model = build_keras_model(input_dim=input_dim)
            return tff.learning.models.from_keras_model(
                keras_model=keras_model,
                input_spec=(
                    tf.TensorSpec(shape=(None, input_dim), dtype=tf.float32),
                    tf.TensorSpec(shape=(None, 1), dtype=tf.float32)
                ),
                loss=tf.keras.losses.BinaryCrossentropy(),
                metrics=[
                    tf.keras.metrics.BinaryAccuracy(name='accuracy'),
                    tf.keras.metrics.AUC(name='auc'),
                    tf.keras.metrics.Precision(name='precision'),
                    tf.keras.metrics.Recall(name='recall')
                ]
            )
        return model_fn, True
    except ImportError:
        # Fallback if tff is not available in environment
        def model_fn():
            return build_keras_model(input_dim=input_dim)
        return model_fn, False

if __name__ == "__main__":
    m = build_keras_model(input_dim=10)
    m.summary()
