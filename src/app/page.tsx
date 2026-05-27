// src/app/bolshevid/page.tsx
import { Suspense } from 'react';
import { Metadata } from 'next';
import styles from '@Styles/Home.module.css';
import CustomContent from './../components/CustomContent/CustomContent';
import { fetchMetadata } from '@functions';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const videoId = resolvedSearchParams.video_id ? String(resolvedSearchParams.video_id) : '';

  try {
    const metadata = await fetchMetadata(videoId);
    if (!metadata) throw new Error('No metadata returned');

    // Extract fields directly from JSON
    const title = metadata.title || 'Clownworld | Bolshevid';
    const description = metadata.description || 'Convert URLs to videos with Bolshevid';
    const keywords = metadata.keywords || 'bolshevid, clownworld, video';
    const image = metadata.thumbnail || 'https://clownworld.biz/imgs/no_image.jpg';
    const canonicalUrl = metadata.canonical || `https://clownworld.biz/bolshevid?video_id=${videoId}`;
    const twitterCreator = metadata.twitter?.creator || '@clownworldbiz';

    return {
      title,
      description,
      keywords,
      openGraph: {
        title: metadata.og?.title || title,
        description: metadata.og?.description || description,
        url: metadata.og?.url || canonicalUrl,
        siteName: 'Clownworld | Bolshevid',
        images: [{ url: metadata.og?.image || image }],
        type: metadata.og?.type || 'video.other',
        locale: metadata.og?.locale || 'en_US',
      },
      twitter: {
        card: metadata.twitter?.card || 'summary',
        title: metadata.twitter?.title || title,
        description: metadata.twitter?.description || description,
        images: [metadata.twitter?.image || image],
        site: metadata.twitter?.site || '@clownworldbiz',
        creator: twitterCreator,
      },
      icons: [
        { rel: 'icon', type: 'image/x-icon', url: '/imgs/binur.jpg.html' },
        { rel: 'icon', type: 'image/png', url: image },
      ],
      other: {
        'bingbot': metadata.other?.bingbot || 'noarchive',
        'Content-Type': metadata.other?.content_type || 'text/html; charset=utf-8',
        'viewport': metadata.other?.viewport || 'width=device-width, initial-scale=1, maximum-scale=2, shrink-to-fit=no',
        'referrer': metadata.other?.referrer || 'origin-when-crossorigin',
        'color-scheme': metadata.other?.color_scheme || 'light',
        'theme-color': metadata.other?.theme_color || '#FFFFFF',
        'link rel="canonical"': metadata.canonical || canonicalUrl,
        'link rel="alternate" media="only screen and (max-width: 640px)"': metadata.mobile_url || `https://m.clownworld.biz/bolshevid?video_id=${videoId}`,
        'link rel="alternate" media="handheld"': metadata.mobile_url || `https://m.clownworld.biz/bolshevid?video_id=${videoId}`,
        'link rel="alternate" type="application/json+oembed"': metadata.oembed_url || `https://clownworld.biz/oembed?url=https://clownworld.biz/bolshevid?video_id=${videoId}`,
        'link rel="manifest" crossorigin="use-credentials"': metadata.other?.manifest || '/data/manifest/',
        'link rel="image_src"': metadata.thumbnail || image,
        'fb:app_id': metadata.og?.fb_app_id || '427305388009806',
        ...(metadata.other && metadata.other['al:android:app_name'] ? {
          'al:android:app_name': metadata.other['al:android:app_name'],
          'al:android:package': metadata.other['al:android:package'],
          'al:android:url': metadata.other['al:android:url'],
          'al:ios:app_name': metadata.other['al:ios:app_name'],
          'al:ios:app_store_id': metadata.other['al:ios:app_store_id'],
          'al:ios:url': metadata.other['al:ios:url'],
          'apple-itunes-app': metadata.other['apple-itunes-app'],
        } : {}),
      },
    };
  } catch (err) {
    console.error('Error fetching metadata:', err);
    return {
      title: 'Clownworld | Bolshevid',
      description: 'Convert URLs to videos with Bolshevid',
      keywords: 'bolshevid, clownworld, video',
      openGraph: {
        title: 'Clownworld | Bolshevid',
        description: 'Convert URLs to videos with Bolshevid',
        url: 'https://clownworld.biz/bolshevid',
        siteName: 'Clownworld | Bolshevid',
        images: [{ url: 'https://clownworld.biz/imgs/no_image.jpg' }],
        type: 'video.other',
        locale: 'en_US',
      },
      twitter: {
        card: 'summary',
        title: 'Clownworld | Bolshevid',
        description: 'Convert URLs to videos with Bolshevid',
        images: ['https://clownworld.biz/imgs/no_image.jpg'],
        site: '@clownworldbiz',
        creator: '@clownworldbiz',
      },
      other: {
        'bingbot': 'noarchive',
        'Content-Type': 'text/html; charset=utf-8',
        'viewport': 'width=device-width, initial-scale=1, maximum-scale=2, shrink-to-fit=no',
        'referrer': 'origin-when-crossorigin',
        'color-scheme': 'light',
        'theme-color': '#FFFFFF',
      },
    };
  }
}

export default function BolshevidPage() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <CustomContent />
    </Suspense>

  );
}