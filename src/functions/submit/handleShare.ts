// src/functions/apiCalls.ts
import {ShareOptions} from '@interfaces'


const socialMediaShareUrls = {
  twitter: (url: string, text: string) =>
    `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  facebook: (url: string) =>
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  whatsapp: (url: string, text: string) =>
    `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text} ${url}`)}`,
};

export async function handleShare({
  templateUrl,
  title,
  description,
  thumbnail, // Include thumbnail in the options
  fallback,
}: any): Promise<void> {
  if (!templateUrl) return;

  const shareTitle = title || 'Check out this video!';
  const shareText = description || 'Watch this awesome video!';

  // Log thumbnail for debugging or custom sharing logic
  if (thumbnail) {
    console.log('Sharing with thumbnail:', thumbnail);
  }

  if (navigator.share) {
    try {
      await navigator.share({
        title: shareTitle,
        text: shareText,
        url: templateUrl,
      });
      console.log('Video shared successfully via native share');
      return;
    } catch (err) {
      console.error('Native share failed:', err);
    }
  }

  try {
    const sharePromises = [
      window.open(socialMediaShareUrls.twitter(templateUrl, `${shareTitle} - ${shareText}`), '_blank'),
      window.open(socialMediaShareUrls.facebook(templateUrl), '_blank'),
      window.open(socialMediaShareUrls.whatsapp(templateUrl, `${shareTitle} - ${shareText}`), '_blank'),
    ];

    if (sharePromises.every((win) => !win || win.closed)) {
      throw new Error('All social media share windows were blocked or failed');
    }
    console.log('Shared to social media platforms');
    // Note: Thumbnail isn’t used here because social platforms fetch it from meta tags
  } catch (err) {
    console.error('Social media sharing failed:', err);
    fallback();
  }
}

// Placeholder for handleDownload (since it’s imported from elsewhere)
export { handleDownload } from './handleDownload';