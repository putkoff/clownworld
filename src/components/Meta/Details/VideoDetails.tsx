'use client';
import { useCallback } from 'react';
import styles from './VideoDetails.module.css';
import { handleDownload } from '@submit/handleDownload';
import { handleShare } from '@submit/handleShare';

interface VideoDetailsProps {
  thumbnail: string;
  description: string;
  likeCount: number;
  repostCount: number;
  commentCount: number;
  duration: number;
  webpageUrl: string;
  title: string;
  user: string | null;
  filename: any;
  keywords: string[];
  keywords_str: string;
  video_url: string;
  optimized_video_url?: string;
  uploader: string;
  uploaderId: string;
  uploader_url?: string;
  uploadDate: string;
  viewCount: number;
  file_name: string;
  onCropClick?: () => void;
}

export default function VideoDetails({
  thumbnail,
  description,
  likeCount,
  commentCount,
  duration,
  webpageUrl,
  title,
  keywords_str,
  video_url,
  optimized_video_url,
  uploader,
  uploadDate,
  viewCount,
  file_name,
  onCropClick,
}: VideoDetailsProps) {
  const playUrl = optimized_video_url || video_url;

  const onDownload = useCallback(() => {
    handleDownload(video_url, file_name);
  }, [video_url, file_name]);

  const onShare = useCallback(() => {
    handleShare({ templateUrl: webpageUrl, title, description, fallback: () => {} });
  }, [webpageUrl, title, description]);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.playerWrapper}>
        {playUrl && (
          <video
            key={playUrl}
            className={styles.video}
            controls
            poster={thumbnail}
            preload="metadata"
          >
            <source src={playUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
      </div>
      <div className={styles.meta}>
        {uploader && <span>{uploader}</span>}
        {uploadDate && <span>{uploadDate}</span>}
        {viewCount > 0 && <span>{viewCount.toLocaleString()} views</span>}
        {likeCount > 0 && <span>{likeCount.toLocaleString()} likes</span>}
        {commentCount > 0 && <span>{commentCount.toLocaleString()} comments</span>}
        {duration > 0 && <span>{Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}</span>}
      </div>
      {description && <p className={styles.description}>{description}</p>}
      {keywords_str && <p className={styles.keywords}>{keywords_str}</p>}
      <div className={styles.actions}>
        <button className={styles.actionBtn} onClick={onDownload}>
          Download
        </button>
        <button className={styles.actionBtn} onClick={onShare}>
          Share
        </button>
        {onCropClick && (
          <button className={styles.actionBtn} onClick={onCropClick}>
            Crop
          </button>
        )}
      </div>
    </div>
  );
}
