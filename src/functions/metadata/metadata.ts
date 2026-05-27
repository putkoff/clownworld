import { eatAll, fetchIt } from '@putkoff/abstract-utilities';
import fs from "fs/promises";
import path from "path";
//import { fetchMediaApi } from '@apiCalls';
export async function fetchMetadatas(video_id: string | null = null, info: any = null): Promise<any> {
  //console.log('Fetching metadata for video_id:', video_id);
  //const body = { video_id, info }
  //const response = await fetchIt('https://clownworld.biz/media/metadata', body);
  //console.log('Metadata response:', response);
  return {};
}


const VIDEO_DIR = "/var/www/media/downloads/public/videos";

export async function fetchMetadata(video_id: string | null): Promise<any> {
  if (!video_id) return null;

  const infoPath = path.join(VIDEO_DIR, video_id, "video.info.json");

  try {
    const raw = await fs.readFile(infoPath, "utf-8");
    const json = JSON.parse(raw);

    return {
      title: json.meta?.title || "Untitled",
      description: json.meta?.description || "",
      keywords: json.meta?.keywords || [],
      thumbnail:
        json.meta?.image ||
        json.meta?.og?.image ||
        `/videos/${video_id}/thumbnails/default.jpg`,
      canonical: `https://clownworld.biz/bolshevid?video_id=${video_id}`,
      ...json.meta,
    };
  } catch (err) {
    console.error("Metadata not found for", video_id, err);
    return null;
  }
}
/**
 * Processes keywords by checking if keywords is a string and splitting it.
 * Then cleans each keyword using `eatAll` with a set of characters to remove.
 *
 * @param keywords - The keywords as a comma-separated string or as an array.
 * @returns An array of cleaned keywords.
 */
export function processKeywords(keywords: string | string[]): string[] {
  let keywordArray: string[];

  // If keywords is a string, split it on commas
  if (typeof keywords === "string") {
    keywordArray = keywords.split(",");
  } else {
    keywordArray = keywords;
  }

  // Clean each keyword by removing unwanted characters
  return keywordArray.map(keyword =>
    eatAll(keyword, [",", "\n", "\t", " ", "#"])
  );
}
/**
 * Constructs a keyword string where each keyword is prefixed with a hash (#).
 *
 * @param keywords - An array of keywords.
 * @returns A string with each keyword prefixed by '#'.
 */
export function get_keyword_string(keywords: any): string {
  keywords = processKeywords(keywords)
  let allString = "";
  for (const keyword of keywords) {
    allString += ` #${keyword}`;
  }
  return allString;
}
