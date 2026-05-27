'use client';
import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { fetchBolshevid } from '@functions';
import { VideoUrlFormProps } from '@interfaces';
import styles from '@Styles/Home.module.css';

export default function VideoUrlForm({
  setLoading,
  setResponse,
  setVideoUrl,
  setContext,
  setInfodata,
  setShowCropper,
  setCroppedVersions,
  setCropError,
  setDownloadedVideos,
}: VideoUrlFormProps) {
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUrlInput(e.target.value);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!urlInput.trim()) return;

      setLoading(true);
      setResponse(null);
      setContext(null);
      setInfodata(null);
      setShowCropper(false);
      setCropError(null);
      setCroppedVersions([]);

      try {
        const result = await fetchBolshevid({ url: urlInput }, 'download_from_url', false);
        if (!result) throw new Error('No data returned from server');

        const ctx = result.context || {};
        setContext(ctx);
        setInfodata(result);

        const crops = result.crops || {};
        const versions = Object.keys(crops)
          .filter((key) => key !== 'current')
          .map((filename) => ({
            filename,
            video_url: crops[filename].context.video_url,
            share_url: crops[filename].context.share_url,
          }));
        setCroppedVersions(versions);

        if (ctx.video_url) setVideoUrl(ctx.video_url);

        if (ctx.video_id) {
          router.push(`?video_id=${ctx.video_id}`, { scroll: false });
        }

        setDownloadedVideos((prev: any[]) => {
          const exists = prev.some((v) => v.video_id === ctx.video_id);
          if (exists) return prev;
          return [
            {
              video_id: ctx.video_id,
              title: ctx.title || 'Untitled',
              thumbnail: ctx.thumbnail || '',
              original_url: urlInput,
              updated: new Date().toISOString(),
            },
            ...prev,
          ];
        });

        setResponse('Video processed successfully');
      } catch (err) {
        setResponse(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    },
    [
      urlInput,
      setLoading,
      setResponse,
      setContext,
      setInfodata,
      setShowCropper,
      setCropError,
      setCroppedVersions,
      setVideoUrl,
      setDownloadedVideos,
      router,
    ]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const text = e.dataTransfer.getData('text');
    if (text) setUrlInput(text);
  }, []);

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div
        className={`${styles.inputContainer}${isDragging ? ` ${styles.dragging}` : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="text"
          className={styles.input}
          placeholder="Paste a video URL here..."
          value={urlInput}
          onChange={handleChange}
          autoComplete="off"
          spellCheck={false}
        />
        <input ref={fileInputRef} type="file" className={styles.fileInput} accept="video/*" />
      </div>
      <button type="submit" className={styles.button} disabled={!urlInput.trim()}>
        Download
      </button>
    </form>
  );
}
