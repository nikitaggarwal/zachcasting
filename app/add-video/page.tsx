"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { extractYoutubeVideoId } from "@/lib/youtube";
import type { VideoAnalysis } from "@/lib/types";
import { saveAnalysisToClient } from "@/lib/client-storage";

export default function AddVideoPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [castInput, setCastInput] = useState("");
  const [phase, setPhase] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const names = castInput
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!url.trim()) {
      setError("Paste a YouTube URL.");
      return;
    }
    if (names.length === 0) {
      setError("Add at least one cast name.");
      return;
    }

    const vid = extractYoutubeVideoId(url);
    if (!vid) {
      setError("Could not read a video ID from that link.");
      return;
    }

    setPhase("loading");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), castNames: names }),
      });
      const data = (await res.json()) as {
        analysis?: VideoAnalysis;
        error?: string;
      };

      if (!res.ok) {
        setPhase("error");
        setError(data.error ?? `Request failed (${res.status})`);
        return;
      }

      if (data.analysis) {
        saveAnalysisToClient(data.analysis.youtubeId, data.analysis);
        router.push(`/video/${data.analysis.youtubeId}`);
        return;
      }

      setPhase("error");
      setError("Unexpected response");
    } catch (err) {
      setPhase("error");
      setError(err instanceof Error ? err.message : "Network failed");
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-10">
      <header>
        <h2 className="font-display text-4xl font-semibold text-white">
          Add video
        </h2>
        <p className="mt-3 text-white/60">
          Fetches public comments via YouTube Data API, then runs batched Claude
          analysis. Requires env keys on the server — until then, use{" "}
          <Link href="/roster" className="text-[var(--cast-gold)] underline-offset-2 hover:underline">
            sample videos
          </Link>
          .
        </p>
      </header>

      <form onSubmit={onSubmit} className="frosted-card space-y-6 p-8">
        <div>
          <label
            htmlFor="url"
            className="text-xs font-medium uppercase tracking-wider text-white/45"
          >
            YouTube URL
          </label>
          <input
            id="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=…"
            className="mt-2 w-full rounded-lg border border-white/15 bg-black/20 px-4 py-3 text-white placeholder:text-white/30 focus:border-[var(--cast-gold)]/50 focus:outline-none"
            disabled={phase === "loading"}
          />
        </div>

        <div>
          <label
            htmlFor="cast"
            className="text-xs font-medium uppercase tracking-wider text-white/45"
          >
            Cast names
          </label>
          <textarea
            id="cast"
            value={castInput}
            onChange={(e) => setCastInput(e.target.value)}
            placeholder="Mia Chen, Raven Blackwood, Camille Dubois"
            rows={4}
            className="mt-2 w-full resize-y rounded-lg border border-white/15 bg-black/20 px-4 py-3 text-white placeholder:text-white/30 focus:border-[var(--cast-gold)]/50 focus:outline-none"
            disabled={phase === "loading"}
          />
          <p className="mt-2 text-xs text-white/40">
            Comma or line separated — match how viewers would spell their names.
          </p>
        </div>

        {phase === "loading" ? (
          <div className="rounded-lg border border-white/10 bg-black/25 px-4 py-5 text-sm text-white/65">
            <p className="font-medium text-white/85">
              Fetching comments, then analyzing in batches with Claude…
            </p>
            <p className="mt-2">
              This can take a minute on large threads. Quota: ~1 unit per{" "}
              <code className="text-white/50">commentThreads.list</code> page.
            </p>
          </div>
        ) : null}

        {error ? (
          <p className="rounded-lg border border-[#c75c5c]/35 bg-[#c75c5c]/10 px-4 py-3 text-sm text-[#e8918e]">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={phase === "loading"}
          className="w-full rounded-lg border border-[var(--cast-gold)]/45 bg-[var(--cast-gold)]/20 py-3 text-sm font-semibold text-[var(--cast-gold)] transition hover:bg-[var(--cast-gold)]/30 disabled:opacity-50"
        >
          Analyze
        </button>
      </form>
    </div>
  );
}
