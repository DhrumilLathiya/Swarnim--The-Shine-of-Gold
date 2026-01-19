import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
from sklearn.utils.class_weight import compute_class_weight

# =====================================================
# CONFIGURATION
# =====================================================

IMAGE_SIZE = (224, 224)
BATCH_SIZE = 16
EPOCHS = 20
LEARNING_RATE = 1e-3

TRAIN_DIR = "data/splits/ring_material/train"
VAL_DIR = "data/splits/ring_material/val"
MODEL_SAVE_PATH = "models/ring_material_classifier/mobilenet_v2_ring_material_v1.0.h5"

# =====================================================
# SAFETY CHECKS
# =====================================================

if not os.path.exists(TRAIN_DIR):
    raise FileNotFoundError(f"Training directory not found: {TRAIN_DIR}")

if not os.path.exists(VAL_DIR):
    raise FileNotFoundError(f"Validation directory not found: {VAL_DIR}")

os.makedirs("models/ring_material_classifier", exist_ok=True)

# =====================================================
# DATA GENERATORS (COLOR SAFE)
# =====================================================

train_datagen = ImageDataGenerator(
    rescale=1.0 / 255,
    zoom_range=0.05,
    horizontal_flip=True
)

val_datagen = ImageDataGenerator(rescale=1.0 / 255)

train_data = train_datagen.flow_from_directory(
    TRAIN_DIR,
    target_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="categorical"
)

val_data = val_datagen.flow_from_directory(
    VAL_DIR,
    target_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="categorical",
    shuffle=False
)

NUM_CLASSES = train_data.num_classes
print("Class indices:", train_data.class_indices)

# =====================================================
# CLASS WEIGHTS (CRITICAL FOR YOUR DATA)
# =====================================================

y_classes = train_data.classes

class_weights = compute_class_weight(
    class_weight="balanced",
    classes=np.unique(y_classes),
    y=y_classes
)

class_weight_dict = dict(enumerate(class_weights))
print("Class weights:", class_weight_dict)

# =====================================================
# MODEL DEFINITION
# =====================================================

base_model = MobileNetV2(
    weights="imagenet",
    include_top=False,
    input_shape=(224, 224, 3)
)

# Freeze base model
base_model.trainable = False

x = base_model.output
x = GlobalAveragePooling2D()(x)
x = Dense(128, activation="relu")(x)
x = Dropout(0.3)(x)
output = Dense(NUM_CLASSES, activation="softmax")(x)

model = Model(inputs=base_model.input, outputs=output)

# =====================================================
# COMPILE MODEL
# =====================================================

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=LEARNING_RATE),
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)

model.summary()

# =====================================================
# CALLBACKS
# =====================================================

callbacks = [
    EarlyStopping(
        monitor="val_loss",
        patience=4,
        restore_best_weights=True
    ),
    ModelCheckpoint(
        MODEL_SAVE_PATH,
        monitor="val_loss",
        save_best_only=True
    )
]

# =====================================================
# TRAIN MODEL
# =====================================================

history = model.fit(
    train_data,
    validation_data=val_data,
    epochs=EPOCHS,
    callbacks=callbacks,
    class_weight=class_weight_dict
)

print("\nRing material MobileNetV2 training completed.")
print(f"Best model saved at: {MODEL_SAVE_PATH}")
