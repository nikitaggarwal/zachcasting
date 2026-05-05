import "server-only";

import type { RosterRow, VideoAnalysis } from "./types";
import {
  resolveChannelHostSlug,
  resolveChannelHostDisplayName,
} from "./channel-host";
import { listStoredVideoAnalyses } from "./analysis-store";
import { buildRosterRowsFromAnalyses, splitHostRow } from "./roster-aggregate";
import { MOCK_VIDEOS } from "./mock-data";

export type RosterView = {
  hostRow: RosterRow | null;
  castRows: RosterRow[];
  hostLabel: string;
};

/**
 * Roster is built from persisted `video_analysis` rows (filtered to
 * `YOUTUBE_CHANNEL_ID` when set). When nothing is persisted yet — the normal
 * state on Vercel cold starts because /tmp is ephemeral — we fall back to the
 * built‑in demo videos so the page is never empty. As soon as the backfill API
 * (driven by the "Fetch more analyses" button on /pulse) saves a real row, the
 * real data takes precedence.
 */
export async function getRosterView(): Promise<RosterView> {
  const hostSlug = resolveChannelHostSlug();
  const hostLabel = resolveChannelHostDisplayName();

  const filterChannel = process.env.YOUTUBE_CHANNEL_ID?.trim()
    ? { channelId: process.env.YOUTUBE_CHANNEL_ID.trim() }
    : undefined;
  const persisted = await listStoredVideoAnalyses(filterChannel);

  const analyses: VideoAnalysis[] =
    persisted.length > 0 ? persisted : Object.values(MOCK_VIDEOS);

  const built = buildRosterRowsFromAnalyses(analyses);
  const { host, cast } = splitHostRow(built, hostSlug);
  return { hostRow: host, castRows: cast, hostLabel };
}
