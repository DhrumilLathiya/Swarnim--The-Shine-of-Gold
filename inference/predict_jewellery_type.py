import tensorflow as tf
import numpy as np
import cv2

MODEL_PATH = "models/jewellery_classifier/mobilenet_v2.h5"
CLASS_NAMES = ["bracelet", "earring", "necklace", "ring"]

model = tf.keras.models.load_model(MODEL_PATH)

def predict(image_path):
    img = cv2.imread(image_path)
    img = cv2.resize(img, (224, 224))
    img = img / 255.0
    img = np.expand_dims(img, axis=0)

    preds = model.predict(img)
    class_id = np.argmax(preds)
    confidence = float(np.max(preds))

    return CLASS_NAMES[class_id], confidence

if __name__ == "__main__":
    label, conf = predict("sample.jpg")
    print(label, conf)
