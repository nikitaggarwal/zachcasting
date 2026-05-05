import { NextResponse } from "next/server";
import { getBackfillLimits } from "@/lib/backfill-route-limits";
import { analyzeUnseenChannelUploads } from "@/lib/channel-pulse";

export const maxDuration = 300;
export const runtime = "nodejs";

export async function GET() {
  const L = getBackfillLimits();
  return NextResponse.json({
    isVercel: L.isVercel,
    defaultMaxVideos: L.defaultMaxVideos,
    hardCapMaxVideos: L.hardCapMaxVideos,
    defaultPlaylistScanDepth: L.defaultPlaylistScanDepth,
    hardCapPlaylistScanDepth: L.hardCapPlaylistScanDepth,
    maxDurationSeconds: L.maxDurationSeconds,
    note: L.isVercel
      ? "Deployment limit: each POST analyzes at most two unseen uploads (~60s). Click again for the next chunk."
      : "Each POST can analyze dozens of uploads; capped for local/long-running hosts.",
  });
}

export async function POST(req: Request) {
  const L = getBackfillLimits();
  let maxVideos = L.defaultMaxVideos;
  let playlistScanDepth = L.defaultPlaylistScanDepth;
  try {
    const body = (await req.json()) as {
      maxVideos?: number;
      playlistScanDepth?: number;
    };
    if (typeof body.maxVideos === "number" && body.maxVideos >= 1) {
      maxVideos = Math.min(L.hardCapMaxVideos, body.maxVideos);
    }
    if (
      typeof body.playlistScanDepth === "number" &&
      body.playlistScanDepth >= 30
    ) {
      playlistScanDepth = Math.min(
        L.hardCapPlaylistScanDepth,
        body.playlistScanDepth
      );
    }
  } catch {
    /* defaults */
  }

  const result = await analyzeUnseenChannelUploads({
    maxNewVideos: maxVideos,
    playlistScanDepth,
  });
  return NextResponse.json({ ...result, deploymentShortRun: L.isVercel });
}
