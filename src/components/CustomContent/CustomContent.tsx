'use client';
import { useState, useEffect } from 'react';

import { useSearchParams, useRouter } from 'next/navigation';
import { fetchDownloadedVideos } from './../../functions/fetchDownloadedVideos';
import { VideoUrlForm } from '@VideoUrl';
import { DownloadedVideos } from '@DownloadedVideos';
import styles from '@Styles/Home.module.css';
import { VideoDetails } from '@VideoDetails';
import { VideoCropper } from '@VideoCropper';
import { Modal } from '@Modal';
import { CropButtons } from '@CropButtons';
import { Crop } from '@interfaces';

export default function CustomContent() {
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [context, setContext] = useState<any>(null);
  const [infodata, setInfodata] = useState<any>(null);
  const [downloadedVideos, setDownloadedVideos] = useState<any[]>([]);
  const [showCropper, setShowCropper] = useState(false);
  const [croppedVersions, setCroppedVersions] = useState<any[]>([]);
  const [cropError, setCropError] = useState<string | null>(null);

  const router: any = useRouter();
  const searchParams = useSearchParams()!; // <-- non-null assertion

  const videoIdFromUrl = searchParams?.get('video_id') ?? null;
  const filenameFromUrl = searchParams?.get('filename') ?? null;

  // 🔹 Load metadata for a specific video
  useEffect(() => {
    const fetchData = async () => {
      if (!videoIdFromUrl) return;
      setLoading(true);
      setResponse(null);
      setVideoUrl('');
      setInfodata(null);
      setContext(null);
      setShowCropper(false);
      setCropError(null);

      try {
        const { fetchVideoInfo } = await import('@functions'); // lazy import to avoid SSR issues
        const infodataResp = await fetchVideoInfo(videoIdFromUrl);

        if (infodataResp?.context?.video_url) {
          setInfodata(infodataResp);
          setContext(infodataResp.context);

          const crops = infodataResp.crops || {};
          const versions = Object.keys(crops)
            .filter((key) => key !== 'current')
            .map((filename) => ({
              filename,
              video_url: crops[filename].context.video_url,
              share_url: crops[filename].context.share_url,
            }));
          setCroppedVersions(versions);

          const selectedCrop = filenameFromUrl
            ? versions.find((c) => c.filename === filenameFromUrl)
            : null;
          setVideoUrl(selectedCrop?.video_url || infodataResp.context.video_url);
        }
      } catch (err) {
        console.error('Error fetching video data:', err);
        setResponse(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [videoIdFromUrl, filenameFromUrl]);

  // 🔹 Load downloaded videos list once
  useEffect(() => {
    const loadVideos = async () => {
      try {
        const videos = (await fetchDownloadedVideos()) || [];
        videos.sort(
          (a: any, b: any) =>
            new Date(b.updated).getTime() - new Date(a.updated).getTime()
        );
        setDownloadedVideos(videos);
      } catch (err) {
        console.error('Failed to fetch downloaded videos:', err);
      }
    };
    loadVideos();
  }, []);

  const handleCropComplete = (data: any) => {
    const newCrop = {
      filename: data.filename,
      video_url: data.video_url,
      share_url: data.share_url,
    };

    const allCrops = data.allCrops || {};
    const updated = Object.keys(allCrops)
      .filter((key) => key !== 'current')
      .map((filename) => ({
        filename,
        video_url: allCrops[filename].context.video_url,
        share_url: allCrops[filename].context.share_url,
      }));
    setCroppedVersions(updated);

    setVideoUrl(newCrop.video_url);
    router.push(newCrop.share_url, { scroll: false });
    setShowCropper(false);
    setResponse('Video cropped successfully');
  };

  const handleCropSelect = (crop: Crop) => {
    setVideoUrl(crop.video_url);
    router.push(crop.share_url, { scroll: false });
  };

  // 🔹 Render loading UI
  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  // derive video details
  const video_url = context?.video_url || infodata?.video_url || '';
  const optimized_video_url =
    context?.optimized_video_url || infodata?.optimized_video_url || '';
  const file_name = context?.file_name || infodata?.file_name || 'video.mp4';
  const title = context?.title || infodata?.title || 'Untitled Video';
  const thumbnail =
    context?.thumbnail || infodata?.thumbnail || 'https://clownworld.biz/imgs/no_image.jpg';
  const description = context?.description || infodata?.description || 'Check out this video';
  const upload_date = context?.upload_date || infodata?.upload_date || 'Unknown';
  const uploader = context?.uploader || infodata?.uploader || 'Unknown';
  const uploader_id = context?.uploader_id || infodata?.uploader_id || 'Unknown';
  const uploader_url = context?.uploader_url || infodata?.uploader_url || 'Unknown';
  const keywords = context?.keywords || infodata?.keywords || ['clownworld', 'bolshevid'];
  const keywords_str =
    context?.keywords_str || infodata?.keywords_str || '#clownworld #bolshevid';
  const comment_count = context?.comment_count || infodata?.comment_count || 0;
  const repost_count = context?.repost_count || infodata?.repost_count || 0;
  const duration = infodata?.duration || context?.duration || 100;
  const like_count = context?.like_count || infodata?.like_count || 0;
  const view_count = context?.view_count || infodata?.view_count || 0;

  return (
    <div className={styles.container}>
      {response && <p className={styles.responseMessage}>{response}</p>}

      {/* Always keep the URL form at the top */}
      <VideoUrlForm
        setLoading={setLoading}
        setResponse={setResponse as any}
        setVideoUrl={setVideoUrl}
        setContext={setContext}
        setInfodata={setInfodata}
        setShowCropper={setShowCropper}
        setCroppedVersions={setCroppedVersions}
        setCropError={setCropError}
        setDownloadedVideos={setDownloadedVideos}

      />

      {/* Show loading state under input */}
      {/*loading && <div className={styles.loading}>Loading...</div> */}

      {/* Show video directly under input once loaded */}
      {!loading && videoUrl && (
        <div className={styles.response}>
          <VideoDetails
            thumbnail={thumbnail}
            description={description}
            likeCount={like_count}
            repostCount={repost_count}
            commentCount={comment_count}
            duration={duration}
            webpageUrl={`https://clownworld.biz/bolshevid?video_id=${context?.video_id}`}
            title={title}
            user={null}
            filename={null}
            keywords={keywords}
            keywords_str={keywords_str}
            video_url={video_url}
            optimized_video_url={optimized_video_url}
            uploader={uploader}
            uploaderId={uploader_id}
            uploadDate={upload_date}
            uploader_url={uploader_url}
            viewCount={view_count}
            file_name={file_name}
            onCropClick={() => setShowCropper(true)}
          />
          {showCropper && (
            <Modal onClose={() => setShowCropper(false)}>
              <VideoCropper
                videoid={context.video_id}
                videoPath={context.video_path}
                filename={null}
                onCropComplete={handleCropComplete}
                setLoading={setLoading}
                setResponse={setResponse}
                videoDuration={duration}
              />
            </Modal>
          )}
          {croppedVersions.length > 0 && (
            <CropButtons crops={croppedVersions} onSelect={handleCropSelect} />
          )}
        </div>
      )}

      {/* Always keep list at the bottom */}
      <DownloadedVideos
        downloadedVideos={downloadedVideos}
        onVideoClick={(videoId) =>
          router.push(`?video_id=${videoId}`, { scroll: false })
        }
        setDownloadedVideos={setDownloadedVideos}
      />
    </div>
  );


}
