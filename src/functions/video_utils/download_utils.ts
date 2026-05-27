import { fetchMedia, fetchMediaApi } from '@apiCalls';
export async function downloadVideo(video_url: any, filename: string) {
  const response = await fetch(video_url);
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
//export const fetchDownloadedVideos = async () => {
//  return []//await fetchMediaApi('list-videos');
//};
export async function fetchRecentVideos(): Promise<any> {
  const response = await ('recent-videos');
  console.log('Video info response:', response);
  return response;
}
