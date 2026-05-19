import axios from 'axios';
import { config } from './config';

export interface UploadItem {
  videoId: string;
  title: string;
  publishedAt: string;
}

interface PlaylistResponse {
  items?: {
    snippet?: {
      title?: string;
      publishedAt?: string;
      resourceId?: {
        videoId?: string;
      };
    };
  }[];
}

interface VideoDetailsResponse {
  items?: {
    id?: string;
    contentDetails?: {
      duration?: string;
    };
  }[];
}

function parseDurationSeconds(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return Infinity;
  const h = parseInt(match[1] ?? '0');
  const m = parseInt(match[2] ?? '0');
  const s = parseInt(match[3] ?? '0');
  return h * 3600 + m * 60 + s;
}

export async function fetchRecentUploads(): Promise<UploadItem[]> {
  const playlistId = config.youtubeChannelId.replace(/^UC/, 'UU');

  const playlistRes = await axios.get<PlaylistResponse>(
    'https://www.googleapis.com/youtube/v3/playlistItems',
    {
      params: {
        part: 'snippet',
        playlistId,
        maxResults: 5,
        key: config.youtubeApiKey,
      },
    }
  );

  const candidates: UploadItem[] = [];

  for (const item of playlistRes.data.items ?? []) {
    const videoId = item.snippet?.resourceId?.videoId;
    const title = item.snippet?.title;
    const publishedAt = item.snippet?.publishedAt;
    if (videoId && title && publishedAt) {
      candidates.push({ videoId, title, publishedAt });
    }
  }

  if (candidates.length === 0) return [];

  // Fetch durations to keep only Shorts (< 3 minutes)
  const ids = candidates.map((v) => v.videoId).join(',');
  const detailsRes = await axios.get<VideoDetailsResponse>(
    'https://www.googleapis.com/youtube/v3/videos',
    {
      params: {
        part: 'contentDetails',
        id: ids,
        key: config.youtubeApiKey,
      },
    }
  );

  const durationMap = new Map<string, number>();
  for (const item of detailsRes.data.items ?? []) {
    if (item.id && item.contentDetails?.duration) {
      durationMap.set(item.id, parseDurationSeconds(item.contentDetails.duration));
    }
  }

  const shorts = candidates.filter((v) => (durationMap.get(v.videoId) ?? Infinity) < 180);

  shorts.sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());

  return shorts;
}
