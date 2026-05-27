import { get_dirname, get_basename } from '@putkoff/abstract-utilities';
import { fetchDownloadedVideos } from './../fetchDownloadedVideos';
export function get_video_info(directory: string) {
  let video_id = get_basename(directory);
  if (video_id === 'cropped') {
    directory = get_dirname(directory);
    video_id = get_basename(directory);
  }
  const video_info = fetchVideoInfo(video_id);
  return video_info;
}
export async function fetchVideoInfo(video_id: string | null = null, info: any = null): Promise<any> {
  console.log('Fetching video info for video_id:', video_id);
  const body = { video_id, info };
  const response = await fetchDownloadedVideos();
  console.log('Video info response:', response);
  return response;
}
// src/functions/fetchDownloadedVideos.ts


