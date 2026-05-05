import "server-only";

import type {
  VideoAnalysis,
  VideoPulseSummary,
  CastProfile,
} from "./types";
import { listStoredVideoAnalyses } from "./analysis-store";
import { buildCastProfileFromAnalyses } from "./roster-aggregate";
import {
  MOCK_VIDEOS,
  MOCK_VIDEO_ORDER,
  MOCK_ALERTS,
  MOCK_CAST_PROFILES,
  toPulseSummary,
} from "./mock-data";

export type { RosterView } from "./roster-view";
export { getRosterView } from "./roster-view";

export function findMockVideo(id: string): VideoAnalysis | undefined {
  if (MOCK_VIDEOS[id]) return MOCK_VIDEOS[id];
  return Object.values(MOCK_VIDEOS).find((v) => v.youtubeId === id);
}

export function listPulseSummaries(): VideoPulseSummary[] {
  return MOCK_VIDEO_ORDER.map((id) => toPulseSummary(MOCK_VIDEOS[id]));
}

export function getAlerts() {
  return MOCK_ALERTS;
}

export async function getCastProfile(
  slug: string
): Promise<CastProfile | undefined> {
  const channelId = process.env.YOUTUBE_CHANNEL_ID?.trim();
  const analyses = await listStoredVideoAnalyses(
    channelId ? { channelId } : undefined
  );
  const derived = buildCastProfileFromAnalyses(slug, analyses);
  if (derived) return derived;
  return MOCK_CAST_PROFILES[slug];
}

export { MOCK_VIDEOS, MOCK_VIDEO_ORDER };
