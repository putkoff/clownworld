import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,

  webpack(config, { isServer }) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "src"),
      "@functions": path.resolve(__dirname, "src/functions"),
      "@apiCalls": path.resolve(__dirname, "src/functions/apiCalls"),
      "@interfaces": path.resolve(__dirname, "src/interfaces/interfaces"),
      "@components": path.resolve(__dirname, "src/components"),
      "@Styles": path.resolve(__dirname, "src/styles"),
      "@VideoUrl": path.resolve(__dirname, "src/components/Forms/VideoUrl"),
      "@VideoDetails": path.resolve(__dirname, "src/components/Meta/Details"),
      "@VideoCropper": path.resolve(__dirname, "src/components/Sections/VideoCropper"),
      "@Modal": path.resolve(__dirname, "src/components/Props/Modal"),
      "@CropButtons": path.resolve(__dirname, "src/components/Props/CropButtons"),
      "@DownloadedVideos": path.resolve(__dirname, "src/components/Sections/DownloadedVideos"),
      "@VideoFooter": path.resolve(__dirname, "src/components/Sections/Footers/VideoFooter"),
    };

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        "fs/promises": false,
        path: false,
        os: false,
      };
    }

    return config;
  },

  env: {
    NEXT_PUBLIC_BASE_URL: "https://clownworld.biz",
  },
};

export default nextConfig;
