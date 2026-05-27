//src/components/interfaces/interfaces.ts
//src/components/interfaces/interfaces.ts
import { FormEvent } from 'react';
export interface VideoData {
  video_url?: any;
  safe_filename?: string;
  title:string;
  json_url?:any;
  json_path?:any;
  file_name?:any;
  video_id?:any;
  user?:any;
  share_url?:string;
  // additional fields as needed
}
// Define Thumbnail type locally or import it
export interface Thumbnail {
  id: string;
  title?: string;
  url: string;
  width?: number;
  height?: number;
  video_url?: any;
  resolution?: string;
  [key: string]: any;
}

export interface Metadata {
  title?: string;
  description?: any;
  keywords?:any;
  openGraph?:any;
  twitter?:any;
  icons?:any;
  other?:any;
  thumbnails?: string[];
  webpage_url?: string;
  share_url?:string;
  video_url?: any;
  uploader?: string;
  uploader_url?: string;
  upload_date?: string;
  timestamp?: string;
  formats?: any[];
  like_count?: number;
  repost_count?: number;
  comment_count?: number;
  view_count?: number;
  duration?: number;
  uploader_id?: string; // Add this
  context?:any;
}
export interface SocialSharingProps {
  webpageUrl: string;
  title: string;
  description?: any;
  uploader?: string;
  uploaderId?: string;
  thumbnail?: any; // Single selected thumbnail URL
  videoFormats?: any[];
  uploadDate?: string;
  duration?: number;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  repostCount?: number;
  video_url?: any;
  file_name?: any;
  onCropClick?: () => void; // Add to interface
}
export interface VideoFormat {
  url?: string;
  title?: string;
  ext?: string;
  width?: number;
  height?: number;
  file_name?:any;
  video_url?: any;
  [key: string]: any;
}

export interface MetaTagsProps {
  title?: string;
  description?: any;
  thumbnails?: string[];
  webpage_url?: string;
  formats?: VideoFormat[];
  uploader?: string;
  uploader_id?: string;
  duration?: number;
  video_url?: any;
  upload_date?: string;
  view_count?: number;
  like_count?: number;
  comment_count?: number;
  repost_count?: number;
}
// Define types for clarity
export interface ShareOptions {
  webpageUrl?:any;// URL to the template with JSON reference
  title: any;
  description: any;
  thumbnail?: any; // Add thumbnail as an optional parameter
  video_url?: any; // URL to the template with JSON reference
  fallback: () => void;
}

export interface InitialProps {
  initialMetadata?: Metadata | null;
  initialThumbnails?: string[];
  initialContext?: VideoData | null;
}


export interface VideoDetailsProps {
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
export interface CropParams {
  startTime: number;
  endTime: number;
}

export interface DownloadedVideo {
  video_id: string;
  thumbnail: string;
  title: string;
  original_url: string;
  download_timestamp: string;
  updated: string;
}

export interface DownloadedVideosProps {
  onVideoClick: (videoId: string) => void;
  setDownloadedVideos?: (videos: DownloadedVideo[] | ((prev: DownloadedVideo[]) => DownloadedVideo[])) => void;
}

export interface HandleVideoSubmitParams {
  e: FormEvent;
  urlInput: string;
  setLoading: (loading: boolean) => void;
  setResponse: (message: string | null | ((prev: string | null) => string | null)) => void; // Updated type
  setVideoUrl: (url: string) => void;
  setContext: (context: any) => void;
  setInfodata: (data: any) => void;
  setShowCropper: (show: boolean) => void;
  setCroppedVersions: (versions: any[]) => void;
  setCropError: (error: string | null) => void;
  setDownloadedVideos: (videos: any[] | ((prev: any[]) => any[])) => void;
  router: any; // Correct type from useRouter
}

export interface VideoUrlFormProps {
  setLoading: (loading: boolean) => void;
  setResponse: (message: string | null | ((prev: string | null) => string | null)) => void; // Updated type
  setVideoUrl: (url: string) => void;
  setContext: (context: any) => void;
  setInfodata: (data: any) => void;
  setShowCropper: (show: boolean) => void;
  setCroppedVersions: (versions: any) => void; // Changed to any[] for consistency
  setCropError: (error: string | null) => void;
  setDownloadedVideos: (videos: any[] | ((prev: any[]) => any[])) => void; // Updated for functional updates
}


export interface Crop {
  filename: string;
  video_url: string;
  share_url: string;
}

export interface CropSelectorProps {
  crops: Crop[];
  onSelect: (crop: Crop) => void;
}