'use client';
import { useState, useCallback } from 'react';
import { fetchBolshevid } from '@functions';
import styles from '@Styles/Home.module.css';

interface VideoCropperProps {
  videoid: string;
  videoPath: string;
  filename: string | null;
  onCropComplete: (data: any) => void;
  setLoading: (loading: boolean) => void;
  setResponse: (message: string | null) => void;
  videoDuration: number;
}

export default function VideoCropper({
  videoid,
  filename,
  onCropComplete,
  setLoading,
  setResponse,
  videoDuration,
}: VideoCropperProps) {
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(videoDuration || 60);
  const [cropLoading, setCropLoading] = useState(false);

  const handleCrop = useCallback(async () => {
    if (startTime >= endTime) {
      setResponse('Start time must be before end time');
      return;
    }
    setCropLoading(true);
    setLoading(true);
    try {
      const result = await fetchBolshevid(
        { video_id: videoid, start_time: startTime, end_time: endTime, filename },
        'crop_video',
        false
      );
      if (!result) throw new Error('No response from crop API');
      onCropComplete(result);
    } catch (err) {
      setResponse(`Crop failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setCropLoading(false);
      setLoading(false);
    }
  }, [videoid, filename, startTime, endTime, onCropComplete, setLoading, setResponse]);

  const max = videoDuration || 9999;

  return (
    <div className={styles.cropSection}>
      <h2>Crop Video</h2>
      <div>
        <label>Start (seconds)</label>
        <input
          type="number"
          min={0}
          max={endTime - 1}
          value={startTime}
          onChange={(e) => setStartTime(Math.max(0, Number(e.target.value)))}
        />
      </div>
      <div>
        <label>End (seconds)</label>
        <input
          type="number"
          min={startTime + 1}
          max={max}
          value={endTime}
          onChange={(e) => setEndTime(Math.min(max, Number(e.target.value)))}
        />
      </div>
      <button
        className={styles.button}
        onClick={handleCrop}
        disabled={cropLoading || startTime >= endTime}
      >
        {cropLoading ? 'Cropping…' : 'Crop Video'}
      </button>
    </div>
  );
}
