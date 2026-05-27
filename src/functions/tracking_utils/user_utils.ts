import {fetchMediaApi} from '@apiCalls';
export async function trackPlays(video_id: string | null = null): Promise<any> {
  console.log('tracking plays for video_id:', video_id);
  const body = { video_id };
  const response = await fetchMediaApi('track-play',body);
  console.log('trackPlays response:', response);
  return response;
}
export async function getPlays(): Promise<any> {
  console.log('getting plays:');
  const response = await fetchMediaApi('get-plays');
  console.log('getPlays response:', response);
  return response;
}
export async function trackIps(): Promise<any> {
  console.log('tracking ips:');
  const response = await fetchMediaApi('track-ips');
  console.log('trackIps response:', response);
  return response;
}
export async function getIps(): Promise<any> {
  console.log('getting ips:');
  const response = await fetchMediaApi('get-ips');
  console.log('getIps response:', response);
  return response;
}
export async function getUrlList(url:string | null, action:boolean | null): Promise<any> {
  console.log('Fetching url list for url:', url);
  const body = { url, action };
  const response = await fetchMediaApi('url-list', body);
  console.log('url-list response:', response);
  return response;
}
