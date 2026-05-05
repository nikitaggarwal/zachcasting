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
import {
  parseOptionalChannelCastNamesFromEnv,
  PULSE_FIRST_RUN_CAST_NAMES,
} from "@/lib/channel-cast-defaults";
import {
  getDistinctCastNamesFromStoredAnalyses,
  getStoredVideoAnalysis,
  listStoredYoutubeIdsForChannel,
  normalizeCastSignature,
  tryGetWarmPulseAnalysis,
  upsertVideoAnalysis,
} from "@/lib/analysis-store";

export async function resolvePulseCastNamesForChannel(
  channelId: string
): Promise<string[]> {
  const envOverride = parseOptionalChannelCastNamesFromEnv();
  if (envOverride.length > 0) return envOverride;

  const fromDb = await getDistinctCastNamesFromStoredAnalyses({ channelId });
  if (fromDb.length > 0) return fromDb;

  return [...PULSE_FIRST_RUN_CAST_NAMES];
}

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

async function resolvePulseEnv(): Promise<ResolvedPulseEnv | null> {
  const ytKey = process.env.YOUTUBE_API_KEY ?? "";
  const anthKey = process.env.ANTHROPIC_API_KEY ?? "";
  const channelId = (process.env.YOUTUBE_CHANNEL_ID ?? "").trim();

  if (!ytKey || !anthKey || !channelId) return null;

  const castNames = await resolvePulseCastNamesForChannel(channelId);
  if (castNames.length === 0) return null;

  const maxVideos = Math.min(
    48,
    Math.max(1, Number(process.env.CHANNEL_PULSE_MAX_VIDEOS ?? "20"))
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
    castNames,
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

export type AnalyzeUnseenResult = {
  ok: boolean;
  error?: string;
  channelId?: string;
  /** Video ids successfully analyzed and saved */
  analyzedYoutubeIds: string[];
  /** Attempted but no row saved (no comments, API error, etc.) */
  skipped: { youtubeId: string; reason: string }[];
};

/**
 * Walk the channel uploads playlist (newest first), skip ids already in SQLite, then
 * run comment + Claude analysis on up to `maxNewVideos` unseen uploads.
 */
export async function analyzeUnseenChannelUploads(options: {
  maxNewVideos?: number;
  /** How far to scan the uploads playlist when looking for unseen ids */
  playlistScanDepth?: number;
}): Promise<AnalyzeUnseenResult> {
  const maxNew = Math.min(120, Math.max(1, options.maxNewVideos ?? 40));
  const scanDepth = Math.min(
    800,
    Math.max(40, options.playlistScanDepth ?? 400)
  );

  const cfg = await resolvePulseEnv();
  if (!cfg) {
    return {
      ok: false,
      error:
        "Missing YOUTUBE_API_KEY, ANTHROPIC_API_KEY, or YOUTUBE_CHANNEL_ID",
      analyzedYoutubeIds: [],
      skipped: [],
    };
  }

  const uploadsPlaylistId = await fetchUploadsPlaylistId(
    cfg.channelId,
    cfg.ytKey
  );
  if (!uploadsPlaylistId) {
    return {
      ok: false,
      error: "Could not resolve channel uploads playlist",
      channelId: cfg.channelId,
      analyzedYoutubeIds: [],
      skipped: [],
    };
  }

  const candidates = await fetchRecentUploadVideoIds(
    uploadsPlaylistId,
    cfg.ytKey,
    scanDepth
  );
  const already = new Set(await listStoredYoutubeIdsForChannel(cfg.channelId));
  const unseen = candidates.filter((id) => !already.has(id)).slice(0, maxNew);

  if (unseen.length === 0) {
    return {
      ok: true,
      channelId: cfg.channelId,
      analyzedYoutubeIds: [],
      skipped: [],
    };
  }

  const analyzedYoutubeIds: string[] = [];
  const skipped: { youtubeId: string; reason: string }[] = [];

  for (const vid of unseen) {
    try {
      const castNamesNow = await resolvePulseCastNamesForChannel(cfg.channelId);
      const iterCfg: ResolvedPulseEnv = {
        ...cfg,
        castNames: castNamesNow,
      };
      const castSig = normalizeCastSignature(castNamesNow);

      const a = await analyzeOneVideo(iterCfg, vid);
      if (a) {
        await upsertVideoAnalysis({
          youtubeId: vid,
          channelId: cfg.channelId,
          castSignature: castSig,
          analysis: a,
        });
        analyzedYoutubeIds.push(vid);
      } else {
        skipped.push({
          youtubeId: vid,
          reason: "No comments or analysis returned empty",
        });
      }
    } catch (e) {
      skipped.push({
        youtubeId: vid,
        reason: e instanceof Error ? e.message : "Unknown error",
      });
    }
  }

  return {
    ok: true,
    channelId: cfg.channelId,
    analyzedYoutubeIds,
    skipped,
  };
}

/** Live pulse + per-video analyses; null when env is incomplete. Results persist in SQLite. */
export async function fetchLiveChannelPulse(): Promise<
  ChannelPulsePayload | null
> {
  const cfg = await resolvePulseEnv();
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
  const cfg = await resolvePulseEnv();
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
  const channelId = (process.env.YOUTUBE_CHANNEL_ID ?? "").trim();
  if (!channelId) return null;
  if (channelId.length <= 12) return channelId;
  return `${channelId.slice(0, 4)}…${channelId.slice(-6)}`;
}
