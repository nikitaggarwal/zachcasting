import "server-only";

import type { RosterRow } from "./types";
import {
  resolveChannelHostSlug,
  resolveChannelHostDisplayName,
} from "./channel-host";
import { listStoredVideoAnalyses } from "./analysis-store";
import { buildRosterRowsFromAnalyses, splitHostRow } from "./roster-aggregate";

export type RosterView = {
  hostRow: RosterRow | null;
  castRows: RosterRow[];
  hostLabel: string;
};

/**
 * Roster is built only from persisted `video_analysis` rows (same channel when
 * `YOUTUBE_CHANNEL_ID` is set). No env cast list — everyone in stored results appears.
 */
export async function getRosterView(): Promise<RosterView> {
  const hostSlug = resolveChannelHostSlug();
  const hostLabel = resolveChannelHostDisplayName();

  const filterChannel = process.env.YOUTUBE_CHANNEL_ID?.trim()
    ? { channelId: process.env.YOUTUBE_CHANNEL_ID.trim() }
    : undefined;
  const analyses = await listStoredVideoAnalyses(filterChannel);

  if (analyses.length === 0) {
    return { hostRow: null, castRows: [], hostLabel };
  }

  const built = buildRosterRowsFromAnalyses(analyses);
  const { host, cast } = splitHostRow(built, hostSlug);
  return { hostRow: host, castRows: cast, hostLabel };
}
