import {
  aggregateToVideoAnalysis,
  runClaudeOnBatches,
} from "@/lib/claude-analyze";
import type { PulseAlert, VideoAnalysis, VideoPulseSummary } from "@/lib/types";
import {
  fetchCommentTexts,
  fetchRecentUploadVideoIds,
  fetchUploadsPlaylistId,
  fetchVideoMeta,
} from "@/lib/youtube";
import { toPulseSummary } from "@/lib/mock-data";
import { TRACKED_CAST_NAME_DEFAULTS } from "@/lib/channel-cast-defaults";
import {
  getStoredVideoAnalysis,
  normalizeCastSignature,
  tryGetWarmPulseAnalysis,
  upsertVideoAnalysis,
} from "@/lib/analysis-store";

export type ChannelPulsePayload = {
  summaries: VideoPulseSummary[];
  alerts: PulseAlert[];
  byYoutubeId: Record<string, VideoAnalysis>;
  channelId: string;
};

type ResolvedPulseEnv = {
  ytKey: string;
  anthKey: string;
  channelId: string;
  castNames: string[];
  maxVideos: number;
  maxComments: number;
  revalidateSeconds: number;
};

function parsePulseEnv(): ResolvedPulseEnv | null {
  const ytKey = process.env.YOUTUBE_API_KEY ?? "";
  const anthKey = process.env.ANTHROPIC_API_KEY ?? "";
  const channelId = (process.env.YOUTUBE_CHANNEL_ID ?? "").trim();
  const castRaw = (process.env.CHANNEL_CAST_NAMES ?? "").trim();

  const fromEnv = [
    ...new Set(
      castRaw
        .split(/[,|\n]+/)
        .map((s) => s.trim())
        .filter(Boolean)
    ),
  ];

  const names =
    fromEnv.length > 0 ? fromEnv : [...new Set(TRACKED_CAST_NAME_DEFAULTS)];

  if (!ytKey || !anthKey || !channelId || names.length === 0) return null;

  const maxVideos = Math.min(
    30,
    Math.max(1, Number(process.env.CHANNEL_PULSE_MAX_VIDEOS ?? "10"))
  );
  const maxComments = Math.min(
    2000,
    Math.max(50, Number(process.env.CHANNEL_PULSE_MAX_COMMENTS ?? "350"))
  );
  const revalidateSeconds =
    Number(process.env.CHANNEL_PULSE_REVALIDATE_SECONDS ?? "3600") || 3600;

  return {
    ytKey,
    anthKey,
    channelId,
    castNames: names,
    maxVideos,
    maxComments,
    revalidateSeconds,
  };
}

function derivePulseAlerts(analyses: VideoAnalysis[]): PulseAlert[] {
  if (analyses.length === 0) {
    return [
      {
        id: "pulse-empty",
        headline: "No pulse data yet",
        detail:
          "Recent uploads had no usable comments or failed to analyze. Check API quotas and that comments are enabled.",
        tone: "neutral",
      },
    ];
  }

  const sorted = [...analyses].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt)
  );
  const alerts: PulseAlert[] = [];
  const usedSlugs = new Set<string>();

  const fatigueCountBySlug = new Map<string, { name: string; n: number }>();
  const lastTwo = sorted.slice(0, 2);
  for (const v of lastTwo) {
    for (const c of v.cast) {
      if (!c.fatigue) continue;
      const cur = fatigueCountBySlug.get(c.slug) ?? { name: c.name, n: 0 };
      cur.n += 1;
      fatigueCountBySlug.set(c.slug, cur);
    }
  }

  let coralPick: { slug: string; name: string } | null = null;
  for (const [slug, row] of fatigueCountBySlug) {
    if (lastTwo.length >= 2 && row.n >= 2) {
      coralPick = { slug, name: row.name };
      break;
    }
    if (lastTwo.length === 1 && row.n >= 1) {
      coralPick = { slug, name: row.name };
      break;
    }
  }
  if (coralPick && !usedSlugs.has(coralPick.slug)) {
    usedSlugs.add(coralPick.slug);
    alerts.push({
      id: `fatigue-${coralPick.slug}`,
      headline: `${coralPick.name} — fatigue language`,
      detail:
        sorted.length >= 2
          ? "Audiences flagged exhaustion or overexposure in recent uploads."
          : "Fatigue cues showed up in the latest analyzed upload.",
      tone: "coral",
    });
  }

  const latest = sorted[0];
  const bring = [...latest.cast]
    .filter((c) => c.bringBack)
    .sort((a, b) => b.mentionCount - a.mentionCount)[0];

  if (bring && alerts.length < 3 && !usedSlugs.has(bring.slug)) {
    usedSlugs.add(bring.slug);
    alerts.push({
      id: `bring-${bring.slug}`,
      headline: `${bring.name} — bring-back signal`,
      detail:
        '"Bring them back"-style cues cluster in comments on the latest video.',
      tone: "amber",
    });
  }

  const momentum = [...latest.cast]
    .filter((c) => c.mentionCount >= 2)
    .sort((a, b) => {
      const d =
        b.sentiment.positive - a.sentiment.positive ||
        b.mentionCount - a.mentionCount;
      return d;
    })[0];

  if (
    momentum &&
    momentum.sentiment.positive >= 55 &&
    alerts.length < 3 &&
    !usedSlugs.has(momentum.slug)
  ) {
    alerts.push({
      id: `momentum-${momentum.slug}`,
      headline: `${momentum.name} — positive pull`,
      detail:
        "Among named cast in recent comments, mentions skew strongly positive.",
      tone: "neutral",
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      id: "generic-ok",
      headline: "Channel steady",
      detail:
        "Latest batch shows no standout fatigue spikes in the surfaced comments.",
      tone: "neutral",
    });
  }

  return alerts.slice(0, 3);
}

async function analyzeOneVideo(
  cfg: ResolvedPulseEnv,
  videoId: string
): Promise<VideoAnalysis | null> {
  const meta = await fetchVideoMeta(videoId, cfg.ytKey);
  if (!meta || meta.commentCountTotal === 0) return null;

  const commentTexts = await fetchCommentTexts(videoId, cfg.ytKey, {
    maxComments: cfg.maxComments,
  });
  if (commentTexts.length === 0) return null;

  const batch = await runClaudeOnBatches(cfg.anthKey, cfg.castNames, commentTexts, 80);
  return aggregateToVideoAnalysis(
    videoId,
    meta.title,
    meta.views,
    meta.commentCountTotal,
    meta.publishedAt,
    cfg.castNames,
    commentTexts,
    batch
  );
}

async function buildChannelPulse(
  cfg: ResolvedPulseEnv
): Promise<ChannelPulsePayload> {
  const uploadsPlaylistId = await fetchUploadsPlaylistId(
    cfg.channelId,
    cfg.ytKey
  );
  if (!uploadsPlaylistId) {
    return {
      channelId: cfg.channelId,
      summaries: [],
      alerts: derivePulseAlerts([]),
      byYoutubeId: {},
    };
  }

  const videoIds = await fetchRecentUploadVideoIds(
    uploadsPlaylistId,
    cfg.ytKey,
    cfg.maxVideos
  );

  const castSig = normalizeCastSignature(cfg.castNames);
  const analyses: VideoAnalysis[] = [];
  for (const vid of videoIds) {
    try {
      const warm = await tryGetWarmPulseAnalysis({
        youtubeId: vid,
        pulseChannelId: cfg.channelId,
        castSignature: castSig,
        maxAgeSeconds: cfg.revalidateSeconds,
      });
      if (warm) {
        analyses.push(warm);
        continue;
      }

      const a = await analyzeOneVideo(cfg, vid);
      if (a) {
        await upsertVideoAnalysis({
          youtubeId: vid,
          channelId: cfg.channelId,
          castSignature: castSig,
          analysis: a,
        });
        analyses.push(a);
      }
    } catch {
      /* quota / transient */
    }
  }

  analyses.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  const byYoutubeId = Object.fromEntries(
    analyses.map((a) => [a.youtubeId, a])
  );

  return {
    channelId: cfg.channelId,
    summaries: analyses.map(toPulseSummary),
    alerts: derivePulseAlerts(analyses),
    byYoutubeId,
  };
}

/** Live pulse + per-video analyses; null when env is incomplete. Results persist in SQLite. */
export async function fetchLiveChannelPulse(): Promise<
  ChannelPulsePayload | null
> {
  const cfg = parsePulseEnv();
  if (!cfg) return null;
  try {
    return await buildChannelPulse(cfg);
  } catch {
    return null;
  }
}

/**
 * Fetch comments + Claude for a recent pulse-channel upload when there is no DB row yet.
 */
export async function hydrateVideoAnalysisFromChannelUploadsIfNeeded(
  youtubeIdLike: string
): Promise<VideoAnalysis | null> {
  const cfg = parsePulseEnv();
  if (!cfg) return null;

  const uploadsPlaylistId = await fetchUploadsPlaylistId(
    cfg.channelId,
    cfg.ytKey
  );
  if (!uploadsPlaylistId) return null;

  const videoIds = await fetchRecentUploadVideoIds(
    uploadsPlaylistId,
    cfg.ytKey,
    Math.max(cfg.maxVideos, 24)
  );
  if (!videoIds.includes(youtubeIdLike)) return null;

  const castSig = normalizeCastSignature(cfg.castNames);
  const a = await analyzeOneVideo(cfg, youtubeIdLike);
  if (!a) return null;
  await upsertVideoAnalysis({
    youtubeId: youtubeIdLike,
    channelId: cfg.channelId,
    castSignature: castSig,
    analysis: a,
  });
  return a;
}

/** Latest persisted analysis, or hydrate on demand for recent channel uploads */
export async function fetchPulseCachedAnalysisForVideo(
  youtubeIdLike: string
): Promise<VideoAnalysis | null> {
  const cached = await getStoredVideoAnalysis(youtubeIdLike);
  if (cached) return cached;
  return hydrateVideoAnalysisFromChannelUploadsIfNeeded(youtubeIdLike);
}

export function pulseChannelDigest(): string | null {
  const cfg = parsePulseEnv();
  if (!cfg) return null;
  const id = cfg.channelId;
  if (id.length <= 12) return id;
  return `${id.slice(0, 4)}…${id.slice(-6)}`;
}
