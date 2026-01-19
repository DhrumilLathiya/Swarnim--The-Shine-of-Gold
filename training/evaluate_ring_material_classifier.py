import tensorflow as tf
import numpy as np
import matplotlib.pyplot as plt
from sklearn.metrics import confusion_matrix, classification_report, accuracy_score
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# =====================================================
# CONFIG
# =====================================================

MODEL_PATH = "models/ring_material_classifier/mobilenet_v2_ring_material_v1.0.h5"
TEST_DIR = "data/splits/ring_material/test"

IMAGE_SIZE = (224, 224)
BATCH_SIZE = 16

# =====================================================
# LOAD MODEL
# =====================================================

model = tf.keras.models.load_model(MODEL_PATH)

# =====================================================
# LOAD TEST DATA
# =====================================================

test_gen = ImageDataGenerator(rescale=1.0 / 255)

test_data = test_gen.flow_from_directory(
    TEST_DIR,
    target_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="categorical",
    shuffle=False
)

CLASS_NAMES = list(test_data.class_indices.keys())
print("Class indices:", test_data.class_indices)

# =====================================================
# PREDICTIONS
# =====================================================

preds = model.predict(test_data)
y_pred = np.argmax(preds, axis=1)
y_true = test_data.classes

# =====================================================
# METRICS
# =====================================================

test_accuracy = accuracy_score(y_true, y_pred)
print(f"\nTEST ACCURACY: {test_accuracy:.4f}")

print("\nRING MATERIAL CLASSIFICATION REPORT\n")
print(classification_report(y_true, y_pred, target_names=CLASS_NAMES))

# =====================================================
# CONFUSION MATRIX
# =====================================================

cm = confusion_matrix(y_true, y_pred)

plt.figure(figsize=(6, 6))
plt.imshow(cm, cmap="Blues")
plt.colorbar()
plt.xticks(range(len(CLASS_NAMES)), CLASS_NAMES, rotation=45)
plt.yticks(range(len(CLASS_NAMES)), CLASS_NAMES)

for i in range(len(CLASS_NAMES)):
    for j in range(len(CLASS_NAMES)):
        plt.text(j, i, cm[i, j], ha="center", va="center")

plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.title("Ring Material Confusion Matrix")
plt.tight_layout()
plt.show()
