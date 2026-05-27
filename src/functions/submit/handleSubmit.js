const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  setMetadata(null);
  setContext(null);
  setThumbnails([]);
  setSelectedThumbnail(''); // Reset selected thumbnail
  try {
    const webhookUrl = 'https://clownworld.biz/media/download_from_url'
    const metadataResponse = await fetchIt(webhookUrl, { url })
    console.log('Backend response:', metadataResponse);
    if (!metadataResponse) throw new Error('No data returned from the server');
    setMetadata(metadataResponse);
    setContext(metadataResponse.context || {});
    const thumbs = Array.isArray(metadataResponse.thumbnails) ? metadataResponse.thumbnails : [];
    setThumbnails(thumbs);
    // Set the first thumbnail as default if available
    setSelectedThumbnail(thumbs.length > 0 ? thumbs[0].url : '');
  } catch (err) {
    setError((err as Error).message || 'An error occurred');
  };

  const handleShare = async () => {
    if (!context?.video_url) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: metadata?.title || context.title || 'Check out this video!',
          text: metadata?.description || 'Watch this awesome video!',
          url: context.video_url,
        });
        console.log('Video shared successfully');
      } catch (err) {
        console.error('Share failed:', err);
        fallbackShare();
      }
    } else {
      fallbackShare();
    }
  };

  const fallbackShare = () => {
    if (context?.video_url) {
      navigator.clipboard.writeText(context.video_url);
      alert('Video URL copied to clipboard!');
    }
  };

  const handleDownload = async () => {
    if (!context?.video_url) {
      alert('No URL available. Please convert a URL first.');
      return;
    }

    try {
      const webhookUrl = 'https://clownworld.biz/media/download_video'
      const blob = await fetchIt(webhookUrl, { url: context.video_url }, null, null, true)
      const downloadLink = document.createElement('a');
      downloadLink.href = window.URL.createObjectURL(blob);
      downloadLink.download = context.safe_filename || 'downloaded_video.mp4';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (err) {
      console.error('Download failed:', err);
      alert(`Failed to download: ${(err as Error).message}`);
      window.open(context.video_url, '_blank');
    }
  };

  const handleThumbnailSelect = (thumbnailUrl: string) => {
    setSelectedThumbnail(thumbnailUrl);
  };
}