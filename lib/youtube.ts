const THREAD_URL = "https://www.googleapis.com/youtube/v3/commentThreads";
const VIDEO_URL = "https://www.googleapis.com/youtube/v3/videos";
const CHANNEL_URL = "https://www.googleapis.com/youtube/v3/channels";
const PLAYLIST_ITEMS_URL = "https://www.googleapis.com/youtube/v3/playlistItems";

export async function fetchUploadsPlaylistId(
  channelId: string,
  apiKey: string
): Promise<string | null> {
  const u = new URL(CHANNEL_URL);
  u.searchParams.set("part", "contentDetails");
  u.searchParams.set("id", channelId);
  u.searchParams.set("key", apiKey);
  const res = await fetch(u.toString());
  if (!res.ok) return null;
  const data = (await res.json()) as {
    items?: Array<{
      contentDetails?: { relatedPlaylists?: { uploads?: string } };
    }>;
  };
  const uploads = data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  return uploads ?? null;
}

export async function fetchRecentUploadVideoIds(
  uploadsPlaylistId: string,
  apiKey: string,
  limit: number
): Promise<string[]> {
  const ids: string[] = [];
  let pageToken: string | undefined;

  do {
    const u = new URL(PLAYLIST_ITEMS_URL);
    u.searchParams.set("part", "contentDetails");
    u.searchParams.set("playlistId", uploadsPlaylistId);
    u.searchParams.set("maxResults", String(Math.min(50, limit - ids.length)));
    u.searchParams.set("key", apiKey);
    if (pageToken) u.searchParams.set("pageToken", pageToken);

    const res = await fetch(u.toString());
    if (!res.ok) break;

    const data = (await res.json()) as {
      nextPageToken?: string;
      items?: Array<{
        contentDetails?: { videoId?: string };
        snippet?: { resourceId?: { videoId?: string } };
      }>;
    };

    for (const item of data.items ?? []) {
      const vid =
        item.contentDetails?.videoId ?? item.snippet?.resourceId?.videoId;
      if (vid && !ids.includes(vid)) ids.push(vid);
      if (ids.length >= limit) return ids.slice(0, limit);
    }
    pageToken = data.nextPageToken;
  } while (pageToken && ids.length < limit);

  return ids.slice(0, limit);
}

export function extractYoutubeVideoId(input: string): string | null {
  const trimmed = input.trim();
  const watch = /[?&]v=([a-zA-Z0-9_-]{11})/.exec(trimmed);
  if (watch) return watch[1];
  const short = /youtu\.be\/([a-zA-Z0-9_-]{11})/.exec(trimmed);
  if (short) return short[1];
  const embed = /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/.exec(trimmed);
  if (embed) return embed[1];
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  return null;
}

/** Route param is probably a bare YouTube video id (vs a demo slug). */
export function isLikelyYoutubeVideoId(s: string): boolean {
  return /^[a-zA-Z0-9_-]{11}$/.test(s.trim());
}

type VideoListResponse = {
  items?: Array<{
    id: string;
    snippet: {
      title: string;
      publishedAt: string;
      channelTitle: string;
      channelId?: string;
    };
    statistics?: { viewCount?: string; commentCount?: string };
  }>;
};

export async function fetchVideoMeta(
  videoId: string,
  apiKey: string
): Promise<{
  title: string;
  publishedAt: string;
  views: number;
  commentCountTotal: number;
  channelId: string;
} | null> {
  const u = new URL(VIDEO_URL);
  u.searchParams.set("part", "snippet,statistics");
  u.searchParams.set("id", videoId);
  u.searchParams.set("key", apiKey);
  const res = await fetch(u.toString());
  if (!res.ok) return null;
  const data = (await res.json()) as VideoListResponse;
  const item = data.items?.[0];
  if (!item) return null;
  const views = Number(item.statistics?.viewCount ?? 0);
  const commentCountTotal = Number(item.statistics?.commentCount ?? 0);
  return {
    title: item.snippet.title,
    publishedAt: item.snippet.publishedAt.slice(0, 10),
    views,
    commentCountTotal,
    channelId: item.snippet.channelId ?? "",
  };
}

type ThreadItem = {
  snippet: {
    topLevelComment: {
      snippet: { textDisplay: string; textOriginal?: string };
    };
  };
};

export async function fetchCommentTexts(
  videoId: string,
  apiKey: string,
  options?: {
    onProgress?: (count: number) => void;
    /** Stop after this many top-level comments (saves quota & model cost). */
    maxComments?: number;
  }
): Promise<string[]> {
  const texts: string[] = [];
  const onProgress = options?.onProgress;
  const maxComments = options?.maxComments;
  let pageToken: string | undefined;

  do {
    const u = new URL(THREAD_URL);
    u.searchParams.set("part", "snippet");
    u.searchParams.set("videoId", videoId);
    u.searchParams.set("maxResults", "100");
    u.searchParams.set("order", "relevance");
    u.searchParams.set("key", apiKey);
    if (pageToken) u.searchParams.set("pageToken", pageToken);

    const res = await fetch(u.toString());
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`YouTube API error: ${res.status} ${err}`);
    }
    const data = (await res.json()) as {
      nextPageToken?: string;
      items?: ThreadItem[];
    };
    for (const item of data.items ?? []) {
      const t =
        item.snippet.topLevelComment.snippet.textOriginal ??
        item.snippet.topLevelComment.snippet.textDisplay;
      const plain = t.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      if (plain) texts.push(plain);
    }
    onProgress?.(texts.length);
    if (
      maxComments !== undefined &&
      maxComments >= 0 &&
      texts.length >= maxComments
    ) {
      return texts.slice(0, maxComments);
    }
    pageToken = data.nextPageToken;
  } while (pageToken);

  return maxComments !== undefined ? texts.slice(0, maxComments) : texts;
}
