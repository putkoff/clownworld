import { get_dirname, get_basename } from '@putkoff/abstract-utilities';
import { fetchMediaApi } from '@apiCalls';

export function get_video_info(directory: string) {
  let video_id = get_basename(directory);
  if (video_id === 'cropped') {
    directory = get_dirname(directory);
    video_id = get_basename(directory);
  }
  return fetchVideoInfo(video_id);
}

export async function fetchVideoInfo(video_id: string | null = null, info: any = null): Promise<any> {
  if (!video_id) return null;
  const response = await fetchMediaApi('video_info', { video_id, info });
  return response;
}

