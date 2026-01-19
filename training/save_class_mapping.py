import json
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# =====================================================
# CONFIG
# =====================================================

TEST_DIR = "data/splits/jewellery_type/test"
OUTPUT_PATH = "models/jewellery_classifier/class_mapping.json"

# =====================================================
# LOAD TEST DATA (ONLY TO GET CLASS INDICES)
# =====================================================

datagen = ImageDataGenerator(rescale=1./255)

test_data = datagen.flow_from_directory(
    TEST_DIR,
    target_size=(224, 224),
    batch_size=16,
    class_mode="categorical",
    shuffle=False
)

# =====================================================
# SAVE CLASS MAPPING
# =====================================================

mapping = {v: k for k, v in test_data.class_indices.items()}

with open(OUTPUT_PATH, "w") as f:
    json.dump(mapping, f, indent=2)

print("Class mapping saved to:", OUTPUT_PATH)
print(mapping)
