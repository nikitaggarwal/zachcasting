/**
 * Branchless limits for `/api/channel/backfill` — Vercel serverless timeouts are tight;
 * long Claude chains must be split into many requests.
 */

const IS_VERCEL = process.env.VERCEL === "1";

export type BackfillRequestLimits = {
  isVercel: boolean;
  defaultMaxVideos: number;
  hardCapMaxVideos: number;
  defaultPlaylistScanDepth: number;
  hardCapPlaylistScanDepth: number;
  maxDurationSeconds: number;
};

function readInt(
  name: string,
  fallback: number,
  min: number,
  max: number
): number {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(n)));
}

export function getBackfillLimits(): BackfillRequestLimits {
  if (IS_VERCEL) {
    const scanHard = readInt(
      "CHANNEL_BACKFILL_VERCEL_PLAYLIST_SCAN_HARD_CAP",
      150,
      90,
      200
    );
    const scanDefault = Math.min(
      scanHard,
      readInt("CHANNEL_BACKFILL_VERCEL_DEFAULT_PLAYLIST_SCAN", 120, 60, 200)
    );
    return {
      isVercel: true,
      defaultMaxVideos: 2,
      hardCapMaxVideos: 2,
      defaultPlaylistScanDepth: scanDefault,
      hardCapPlaylistScanDepth: scanHard,
      maxDurationSeconds: 60,
    };
  }

  const hardCapMaxVideos = readInt(
    "CHANNEL_BACKFILL_MAX_VIDEOS_HARD_CAP",
    80,
    10,
    120
  );
  const defaultMaxVideos = Math.min(
    hardCapMaxVideos,
    readInt("CHANNEL_BACKFILL_DEFAULT_MAX_VIDEOS", 50, 1, 120)
  );
  const hardCapPlaylistScanDepth = readInt(
    "CHANNEL_BACKFILL_PLAYLIST_SCAN_HARD_CAP",
    800,
    100,
    2000
  );
  const defaultPlaylistScanDepth = Math.min(
    hardCapPlaylistScanDepth,
    readInt("CHANNEL_BACKFILL_DEFAULT_PLAYLIST_SCAN", 500, 40, 2000)
  );

  return {
    isVercel: false,
    defaultMaxVideos,
    hardCapMaxVideos,
    defaultPlaylistScanDepth,
    hardCapPlaylistScanDepth,
    maxDurationSeconds: 900,
  };
}
