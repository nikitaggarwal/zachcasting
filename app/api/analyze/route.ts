import { NextResponse } from "next/server";
import {
  aggregateToVideoAnalysis,
  runClaudeOnBatches,
} from "@/lib/claude-analyze";
import {
  extractYoutubeVideoId,
  fetchVideoMeta,
  fetchCommentTexts,
} from "@/lib/youtube";
import {
  normalizeCastSignature,
  upsertVideoAnalysis,
} from "@/lib/analysis-store";

export const maxDuration = 300;
export const runtime = "nodejs";

type Body = {
  url: string;
  castNames: string[];
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { url, castNames } = body;
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }
  if (!Array.isArray(castNames) || castNames.length === 0) {
    return NextResponse.json(
      { error: "Add at least one cast name" },
      { status: 400 }
    );
  }

  const videoId = extractYoutubeVideoId(url);
  if (!videoId) {
    return NextResponse.json(
      { error: "Could not parse a YouTube video ID from that URL" },
      { status: 400 }
    );
  }

  const ytKey = process.env.YOUTUBE_API_KEY;
  const anthKey = process.env.ANTHROPIC_API_KEY;
  if (!ytKey) {
    return NextResponse.json(
      {
        error:
          "YOUTUBE_API_KEY is not configured. Set it in .env.local for live analysis.",
      },
      { status: 503 }
    );
  }
  if (!anthKey) {
    return NextResponse.json(
      {
        error:
          "ANTHROPIC_API_KEY is not configured. Set it in .env.local for live analysis.",
      },
      { status: 503 }
    );
  }

  const names = [...new Set(castNames.map((n) => n.trim()).filter(Boolean))];

  try {
    const meta = await fetchVideoMeta(videoId, ytKey);
    if (!meta) {
      return NextResponse.json(
        { error: "Video not found or not accessible with this API key" },
        { status: 404 }
      );
    }

    const commentTexts = await fetchCommentTexts(videoId, ytKey);
    if (commentTexts.length === 0) {
      return NextResponse.json(
        {
          error:
            "No comments returned (comments may be disabled or unavailable).",
        },
        { status: 422 }
      );
    }

    const batch = await runClaudeOnBatches(anthKey, names, commentTexts, 80);
    const analysis = aggregateToVideoAnalysis(
      videoId,
      meta.title,
      meta.views,
      meta.commentCountTotal,
      meta.publishedAt,
      names,
      commentTexts,
      batch
    );

    await upsertVideoAnalysis({
      youtubeId: videoId,
      channelId: meta.channelId || "_unknown_channel",
      castSignature: normalizeCastSignature(names),
      analysis,
    });

    return NextResponse.json({ analysis });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Analysis failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
