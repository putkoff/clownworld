// /var/www/clownworld/bolshevid/src/functions/pathUtils.ts
import { fetchIt } from '@putkoff/abstract-utilities'; // Absolute path to universal functions
export const clownworld_url = 'https://clownworld.biz';
export const clownworld_media_url = `${clownworld_url}/media`;
export const clownworld_media_api_url = `${clownworld_media_url}/api`;
export const clownworld_bolshevid_url = `${clownworld_url}/bolshevid`;

export async function fetchBolshevid(
  body: string | object | null = null,
  endpoint: string | null = null,
  blob: boolean | null = null,
  headers: Record<string, string> | null = null,
  method: any = null
): Promise<any> {
  endpoint = endpoint || 'download_video';
  if (blob == null && endpoint == 'download_video') {
    blob = true;
  } else {
    blob = false;
  }
  const requestBody = typeof body === 'string' ? { url: body } : body;
  const url = `${clownworld_media_url}/${endpoint}`;
  const response = await fetchIt(url, requestBody, method, headers, blob);
  return response;
}
export async function fetchMediaApi(
  endpoint: string,
  body: string | object | null = null,
  blob: boolean = false,
  headers: Record<string, string> | null = null,
  method: any = null
): Promise<any> {
  let requestBody: object | null = null;
  const finalMethod: 'GET' | 'POST' = method || 'POST';
  if (typeof body === 'string') {
    requestBody = { url: body };
  } else if (body && finalMethod === 'POST') {
    requestBody = body;
  } else if (body && finalMethod === 'GET') {
    const queryParams = new URLSearchParams(body as any).toString();
    endpoint += `?${queryParams}`;
  }
  const url = `${clownworld_media_url}/${endpoint}`;
  console.log('Fetching from URL:', url, 'with method:', finalMethod, 'and body:', requestBody);
  const response = await fetchIt(url, requestBody, finalMethod, headers, blob);
  return response;
}

export async function fetchMedia(
  body: string | object | null = null,
  endpoint: string | null = null,
  blob: boolean | null = false,
  headers: Record<string, string> | null = null,
  method: any = null
): Promise<any> {
  endpoint = endpoint || 'download_video';
  if (blob == null && endpoint === 'download_video') {
    blob = true;
  } else {
    blob = false;
  }
  let requestBody: object | null = null;
  const finalMethod: 'GET' | 'POST' = method || 'POST';

  if (typeof body === 'string') {
    requestBody = { url: body };
  } else if (body && finalMethod === 'POST') {
    requestBody = body;
  } else if (body && finalMethod === 'GET') {
    const queryParams = new URLSearchParams(body as any).toString();
    endpoint += `?${queryParams}`;
  }

  const url = `${clownworld_media_url}/${endpoint}`;
  console.log('Fetching from URL:', url, 'with method:', finalMethod, 'and body:', requestBody);
  const response = await fetchIt(url, requestBody, finalMethod);
  return response;
}

