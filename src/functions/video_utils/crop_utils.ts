import { fetchMedia } from '@apiCalls';
import { get_dirname, get_basename, get_splitext, make_path } from '@putkoff/abstract-utilities';
export function get_video_crop_dir(video_dir: string) {
  const dirname = get_dirname(video_dir);
  const basename = get_basename(video_dir);
  const { filename, ext } = get_splitext(basename);
  let cropped_dir = `${video_dir}/cropped`;
  if (ext) {
    cropped_dir = `${dirname}/cropped`
  }
  return cropped_dir;
}

export function get_video_crop_list(directory: string) {
  const basename = get_basename(directory);
  if (basename !== 'cropped') {
    directory = get_video_crop_dir(directory); // e.g., "/var/www/.../cropped"
  }
  const cropped_list = fetchMedia({ directory }, 'directory_lists'); // Assume this returns filenames
  const croppedVersions: { [key: string]: any } = {};

  for (const file_name in cropped_list) {
    const videoId = directory.split('/').slice(-2, -1)[0]; // Extract video ID
    croppedVersions[file_name] = {
      filename: file_name,
      video_url: `https://clownworld.biz/data/downloads/videos/videos/${videoId}/cropped/${file_name}.mp4`,
      share_url: `https://clownworld.biz/bolshevid?video_id=${videoId}&filename=${file_name}`,
    };
  }
  return croppedVersions;
}

export function get_video_crop_file(video_dir: string, file_name: string) {
  const dirname = get_dirname(video_dir);
  const basename = get_basename(video_dir);
  const { filename, ext } = get_splitext(basename);
  return `${dirname}/${file_name}`
}
export function fetchCroppedUrl(video_url: any = null, user: any = null): Promise<any> {
  let adjustedVideoUrl = video_url
  if (user && video_url) {
    const dirname: string = video_url.substring(0, video_url.lastIndexOf('/'));
    const basename: string = video_url.split('/').pop();
    adjustedVideoUrl = `${dirname.split('/cropped')[0]}/cropped/${user}/${basename}`;

  }
  return adjustedVideoUrl
}

