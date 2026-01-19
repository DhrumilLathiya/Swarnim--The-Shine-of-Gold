import os
import shutil
import random
from pathlib import Path

# =====================================================
# CONFIGURATION
# =====================================================

#RAW_DATA_DIR = "data/raw/jewellery_type"
#SPLIT_DATA_DIR = "data/splits/jewellery_type"

RAW_DATA_DIR = "data/raw/ring_material"
SPLIT_DATA_DIR = "data/splits/ring_material"

TRAIN_RATIO = 0.7
VAL_RATIO = 0.15
TEST_RATIO = 0.15

RANDOM_SEED = 42

VALID_EXTENSIONS = (".jpg", ".jpeg", ".png", ".webp")

# =====================================================
# SAFETY CONFIGURATION (INDUSTRY GRADE)
# =====================================================

# IMPORTANT:
# - Set FORCE_RECREATE = True ONLY for first split
# - After verifying dataset, set it to False to lock test set
FORCE_RECREATE = False

# Sanity check to ensure ratios are valid
assert abs((TRAIN_RATIO + VAL_RATIO + TEST_RATIO) - 1.0) < 1e-6, \
    "Train/Val/Test ratios must sum to 1"

# =====================================================
# UTILITY FUNCTIONS
# =====================================================

def is_image_file(filename):
    """Check if file is a valid image"""
    return filename.lower().endswith(VALID_EXTENSIONS)


def clear_split_directory():
    """Delete existing split directory to avoid duplication"""
    if os.path.exists(SPLIT_DATA_DIR):
        if FORCE_RECREATE:
            shutil.rmtree(SPLIT_DATA_DIR)
        else:
            raise RuntimeError(
                f"{SPLIT_DATA_DIR} already exists. "
                "Set FORCE_RECREATE=True to overwrite."
            )


def create_split_directories(class_names):
    """Create train/val/test directories for each class"""
    for split in ["train", "val", "test"]:
        for class_name in class_names:
            Path(os.path.join(SPLIT_DATA_DIR, split, class_name)).mkdir(
                parents=True,
                exist_ok=True
            )


def split_class_images(class_name):
    """Split images of a single class into train/val/test"""
    class_path = os.path.join(RAW_DATA_DIR, class_name)

    images = [
        img for img in os.listdir(class_path)
        if is_image_file(img)
    ]

    if len(images) == 0:
        raise ValueError(f"No images found in class '{class_name}'")

    random.shuffle(images)

    total_images = len(images)
    train_end = int(total_images * TRAIN_RATIO)
    val_end = train_end + int(total_images * VAL_RATIO)

    split_mapping = {
        "train": images[:train_end],
        "val": images[train_end:val_end],
        "test": images[val_end:]
    }

    for split, split_images in split_mapping.items():
        for img_name in split_images:
            src = os.path.join(class_path, img_name)
            dst = os.path.join(SPLIT_DATA_DIR, split, class_name, img_name)
            shutil.copy2(src, dst)  # preserves metadata

    # Safety check to avoid empty splits
    assert all(len(v) > 0 for v in split_mapping.values()), \
        f"Invalid split detected for class '{class_name}'"

    return {
        "total": total_images,
        "train": len(split_mapping["train"]),
        "val": len(split_mapping["val"]),
        "test": len(split_mapping["test"])
    }

# =====================================================
# MAIN PIPELINE
# =====================================================

def main():
    random.seed(RANDOM_SEED)

    if not os.path.exists(RAW_DATA_DIR):
        raise FileNotFoundError(
            f"Raw data directory not found: {RAW_DATA_DIR}"
        )

    class_names = sorted([
        d for d in os.listdir(RAW_DATA_DIR)
        if os.path.isdir(os.path.join(RAW_DATA_DIR, d))
    ])

    if len(class_names) == 0:
        raise ValueError("No class folders found in raw dataset")

    print(f"Found classes: {class_names}")

    clear_split_directory()
    create_split_directories(class_names)

    print("\nSplitting dataset...\n")

    summary = {}

    for class_name in class_names:
        stats = split_class_images(class_name)
        summary[class_name] = stats

    print("DATASET SPLIT SUMMARY")
    print("-" * 40)
    for class_name, stats in summary.items():
        print(
            f"{class_name:10s} | "
            f"Total: {stats['total']:4d} | "
            f"Train: {stats['train']:4d} | "
            f"Val: {stats['val']:4d} | "
            f"Test: {stats['test']:4d}"
        )

    print("\nDataset split completed successfully.")

# =====================================================
# ENTRY POINT
# =====================================================

if __name__ == "__main__":
    main()
