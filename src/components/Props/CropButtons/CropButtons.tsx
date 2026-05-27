'use client';
import { Crop } from '@interfaces';
import styles from '@Styles/Home.module.css';

interface CropButtonsProps {
  crops: Crop[];
  onSelect: (crop: Crop) => void;
}

export default function CropButtons({ crops, onSelect }: CropButtonsProps) {
  if (!crops.length) return null;
  return (
    <div className={styles.cropButtonsRow}>
      {crops.map((crop) => (
        <button key={crop.filename} className={styles.cropButton} onClick={() => onSelect(crop)}>
          {crop.filename}
        </button>
      ))}
    </div>
  );
}
