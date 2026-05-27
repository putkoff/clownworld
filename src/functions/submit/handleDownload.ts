import {fetchMedia} from './../apiCalls'
export async function handleDownload(videoUrl: any , safeFilename:any= null,endpoint:string | null=null, blob:any=null) {
  if (!videoUrl) {
    alert('No URL available. Please convert a URL first.');
    return;
  }
  safeFilename = safeFilename || 'downloaded_video.mp4'
  try {
    const response = await fetchMedia(videoUrl,'download_video',blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(response);
    downloadLink.download = safeFilename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  } catch (err) {
    console.error('Download failed:', err);
    alert(`Failed to download: ${err}`);
    window.open(videoUrl, '_blank');
  }
}