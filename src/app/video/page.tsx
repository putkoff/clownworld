'use client';

import { useEffect, useState } from "react";
import { fetchDownloadedVideos } from "@functions";

export default function VideoPage() {
    const [videos, setVideos] = useState<any[]>([]);

    useEffect(() => {
        fetchDownloadedVideos().then(setVideos).catch(console.error);
    }, []);

    return (
        <div>
            <h1>Downloaded Videos</h1>
            <ul>
                {videos.map((v) => (
                    <li key={v.video_id}>{v.title}</li>
                ))}
            </ul>
        </div>
    );
}
