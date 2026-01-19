import json
from tensorflow.keras.preprocessing.image import ImageDataGenerator

TEST_DIR = "data/splits/ring_material/test"
OUT = "models/ring_material_classifier/class_mapping.json"

gen = ImageDataGenerator(rescale=1./255)
data = gen.flow_from_directory(
    TEST_DIR, target_size=(224,224), batch_size=16,
    class_mode="categorical", shuffle=False
)

mapping = {v: k for k, v in data.class_indices.items()}
with open(OUT, "w") as f:
    json.dump(mapping, f, indent=2)

print("Saved:", OUT, mapping)
