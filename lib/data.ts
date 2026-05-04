import type {
  VideoAnalysis,
  VideoPulseSummary,
  CastProfile,
  RosterRow,
} from "./types";
import {
  MOCK_VIDEOS,
  MOCK_VIDEO_ORDER,
  MOCK_ALERTS,
  MOCK_CAST_PROFILES,
  toPulseSummary,
} from "./mock-data";

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

export function getCastProfile(slug: string): CastProfile | undefined {
  return MOCK_CAST_PROFILES[slug];
}

export function listRosterRows(): RosterRow[] {
  return Object.values(MOCK_CAST_PROFILES).map((p) => ({
    slug: p.slug,
    name: p.name,
    totalAppearances: p.appearanceCount,
    avgSentimentPositive: p.avgPositivePct,
    lastAppearanceDate: p.lastAppearanceDate,
    trend: p.trend,
    status: p.status,
  }));
}

export { MOCK_VIDEOS, MOCK_VIDEO_ORDER };
