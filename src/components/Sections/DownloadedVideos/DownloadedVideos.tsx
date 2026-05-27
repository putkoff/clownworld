// bolshevid/src/components/DownloadedVideos/DownloadedVideos.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation'; // For getting URL query params
import { truncateString, fetchDownloadedVideos } from '@functions';
import { DownloadedVideo, DownloadedVideosProps } from '@interfaces';
import styles from './DownloadedVideos.module.css';

export default function DownloadedVideos({
  onVideoClick,
  setDownloadedVideos,
  downloadedVideos = [],   // ✅ accept prop instead of only local state
}: DownloadedVideosProps & { downloadedVideos?: DownloadedVideo[] }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const currentVideoId = searchParams?.get('video_id') ?? null;

  useEffect(() => {
    if (downloadedVideos.length > 0) return;
    let cancelled = false;
    fetchDownloadedVideos().then((videos: DownloadedVideo[]) => {
      if (cancelled || !videos?.length) return;
      videos.sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime());
      setDownloadedVideos?.(videos);
    });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll to active video
  useEffect(() => {
    if (scrollContainerRef.current && currentVideoId) {
      const videoElement = scrollContainerRef.current.querySelector(
        `[data-video-id="${currentVideoId}"]`
      ) as HTMLElement;
      videoElement?.scrollIntoView({ behavior: "smooth", inline: "center" });
    }
  }, [currentVideoId]);

  return (
    <div className={styles.scrollContainer} ref={scrollContainerRef}>
      {downloadedVideos.length > 0 ? (
        downloadedVideos.map((video) => (
          <div
            key={video.video_id}
            className={styles.videoItem}
            data-video-id={video.video_id}
            onClick={() => onVideoClick(video.video_id)}
          >
            <div className={styles.thumbnailContainer}>
              <img
                src={video.thumbnail}
                alt={video.title}
                width={100}
                height={100}
                className={styles.thumbnail}
              />
            </div>
            <p className={styles.title}>{truncateString(video.title, 20)}</p>
          </div>
        ))
      ) : (
        <p>No downloaded videos available.</p>
      )}
    </div>
  );
}