import type {
  CastProfile,
  CastStatus,
  CastTrend,
  RosterRow,
  VideoAnalysis,
} from "./types";

export type CastVideoPoint = {
  videoId: string;
  youtubeId: string;
  videoTitle: string;
  publishedAt: string;
  positive: number;
  fatigue: boolean;
  mentionCount: number;
  topPositiveQuote: string;
};

export type CastAggregation = {
  slug: string;
  name: string;
  videos: CastVideoPoint[];
};

function mean(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function aggregateCastsFromAnalyses(
  analyses: VideoAnalysis[]
): Map<string, CastAggregation> {
  const map = new Map<string, CastAggregation>();
  for (const va of analyses) {
    for (const c of va.cast) {
      let entry = map.get(c.slug);
      if (!entry) {
        entry = { slug: c.slug, name: c.name, videos: [] };
        map.set(c.slug, entry);
      }
      entry.name = c.name;
      entry.videos.push({
        videoId: va.id,
        youtubeId: va.youtubeId,
        videoTitle: va.title,
        publishedAt: va.publishedAt,
        positive: c.sentiment.positive,
        fatigue: c.fatigue,
        mentionCount: c.mentionCount,
        topPositiveQuote: c.topPositiveQuote,
      });
    }
  }
  for (const agg of map.values()) {
    agg.videos.sort((a, b) => a.publishedAt.localeCompare(b.publishedAt));
  }
  return map;
}

export function computeCastTrend(videos: CastVideoPoint[]): CastTrend {
  const n = videos.length;
  if (n < 2) return "flat";
  const mid = Math.floor(n / 2);
  const older = videos.slice(0, mid);
  const recent = videos.slice(mid);
  const avgOld = mean(older.map((v) => v.positive));
  const avgRecent = mean(recent.map((v) => v.positive));
  if (avgRecent > avgOld + 3) return "up";
  if (avgRecent < avgOld - 3) return "down";
  return "flat";
}

export function computeCastStatus(
  videos: CastVideoPoint[],
  avgPositive: number
): CastStatus {
  if (videos.length === 0) return "Fresh";
  const latest = videos[videos.length - 1];
  if (latest.fatigue) return "Overexposed";
  const n = videos.length;
  if (n <= 2 && avgPositive >= 50) return "Fresh";
  if (avgPositive < 45) return "Resting";
  if (avgPositive >= 64) return "Hot";
  if (n >= 5 && avgPositive < 58) return "Resting";
  if (n <= 3) return "Fresh";
  return avgPositive >= 55 ? "Hot" : "Resting";
}

export function buildRosterRowsFromAnalyses(
  analyses: VideoAnalysis[]
): RosterRow[] {
  const map = aggregateCastsFromAnalyses(analyses);
  const rows: RosterRow[] = [];
  for (const agg of map.values()) {
    const { videos } = agg;
    const avgSentimentPositive = Math.round(mean(videos.map((v) => v.positive)));
    const trend = computeCastTrend(videos);
    const status = computeCastStatus(videos, avgSentimentPositive);
    const lastAppearanceDate =
      videos[videos.length - 1]?.publishedAt ?? "";
    rows.push({
      slug: agg.slug,
      name: agg.name,
      totalAppearances: videos.length,
      avgSentimentPositive,
      lastAppearanceDate,
      trend,
      status,
    });
  }
  rows.sort((a, b) => b.avgSentimentPositive - a.avgSentimentPositive);
  return rows;
}

/** Pull the channel host out so they are not ranked against on-camera cast. */
export function splitHostRow(
  rows: RosterRow[],
  hostSlug: string
): { host: RosterRow | null; cast: RosterRow[] } {
  const host = rows.find((r) => r.slug === hostSlug) ?? null;
  const cast = rows.filter((r) => r.slug !== hostSlug);
  return { host, cast };
}

function recommendationFor(
  status: CastStatus,
  trend: CastTrend,
  avg: number
): string {
  if (status === "Overexposed") {
    return (
      "Comment mix shows fatigue or over-rotation. Give this face a break " +
      "or pair them with fresh talent before the next booking."
    );
  }
  if (status === "Resting") {
    return (
      "Sentiment has cooled. A different format or lighter screen time " +
      "could rebuild heat without forcing a comeback narrative."
    );
  }
  if (status === "Fresh") {
    return (
      "Still defining their arc on the channel. A few more strategic " +
      "appearances—without overbooking—could cement audience appetite."
    );
  }
  if (status === "Hot") {
    if (trend === "up") {
      return (
        `Momentum is building (${avg}% avg. positive comments). ` +
        "Strike while the sentiment curve is climbing—audience energy is there."
      );
    }
    return (
      "Consistently winning comment share. They are a strong booking " +
      "anchor right now—use them where the story needs a reliable spark."
    );
  }
  return "Keep monitoring comment mix week to week and adjust booking cadence.";
}

export function buildCastProfileFromAnalyses(
  slug: string,
  analyses: VideoAnalysis[]
): CastProfile | null {
  const map = aggregateCastsFromAnalyses(analyses);
  const agg = map.get(slug);
  if (!agg || agg.videos.length === 0) return null;

  const { videos } = agg;
  const avgPositivePct = Math.round(mean(videos.map((v) => v.positive)));
  const trend = computeCastTrend(videos);
  const status = computeCastStatus(videos, avgPositivePct);
  const lastAppearanceDate = videos[videos.length - 1].publishedAt;

  return {
    slug: agg.slug,
    name: agg.name,
    appearanceCount: videos.length,
    avgPositivePct,
    trend,
    status,
    lastAppearanceDate,
    trajectory: videos.map((v) => ({
      videoId: v.videoId,
      videoTitle: v.videoTitle,
      youtubeId: v.youtubeId,
      date: v.publishedAt,
      positivePct: v.positive,
    })),
    videosAppeared: videos.map((v) => ({
      videoId: v.videoId,
      videoTitle: v.videoTitle,
      youtubeId: v.youtubeId,
      date: v.publishedAt,
      positivePct: v.positive,
      topComment: v.topPositiveQuote,
    })),
    recommendation: recommendationFor(status, trend, avgPositivePct),
  };
}
