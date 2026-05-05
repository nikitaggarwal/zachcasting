"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { VideoAnalysis } from "@/lib/types";
import { loadAnalysisFromClient } from "@/lib/client-storage";
import { SentimentBar, SentimentLegend } from "@/components/SentimentBar";
import { SentimentDonut } from "@/components/SentimentDonut";

function formatViews(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

export function VideoDrilldown({
  routeId,
  initialMock,
  initialPulseAnalysis = null,
}: {
  routeId: string;
  initialMock: VideoAnalysis | null;
  initialPulseAnalysis?: VideoAnalysis | null;
}) {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    queueMicrotask(() => setHydrated(true));
  }, []);

  const saved = hydrated ? loadAnalysisFromClient(routeId) : null;
  const data = saved ?? initialMock ?? initialPulseAnalysis ?? null;

  const showSkeleton =
    !hydrated && !saved && data === null && !initialMock && !initialPulseAnalysis;

  if (showSkeleton) {
    return (
      <div className="frosted-card animate-pulse p-12 text-center text-white/50">
        Loading analysis…
      </div>
    );
  }

  if (!data) {
    return (
      <div className="frosted-card max-w-xl p-8">
        <h2 className="font-display text-2xl text-white">No analysis found</h2>
        <p className="mt-3 text-white/60">
          This route does not match the sample videos, cached channel pulse, or a
          result from Add video in this session. Run analysis from Add Video or
          configure live channel pulse in environment variables.
        </p>
        <Link
          href="/roster"
          className="mt-6 inline-block rounded-lg border border-[var(--cast-gold)]/50 bg-[var(--cast-gold)]/15 px-5 py-2.5 text-sm text-[var(--cast-gold)]"
        >
          Back to cast roster
        </Link>
      </div>
    );
  }

  const v = data;
  const thumb = `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`;

  return (
    <div className="space-y-8">
      <section className="frosted-card overflow-hidden">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,420px)_1fr]">
          <div className="relative aspect-video w-full bg-black/30 lg:aspect-auto lg:min-h-[240px]">
            <Image
              src={thumb}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 420px"
              unoptimized
            />
          </div>
          <div className="flex flex-col justify-center p-6 md:p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-white/45">
              Video drilldown
            </p>
            <h1 className="font-display mt-2 text-3xl font-semibold leading-tight text-white md:text-[2.1rem]">
              {v.title}
            </h1>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/55">
              <span>{formatViews(v.views)} views</span>
              <span>Published {v.publishedAt}</span>
              <span>Analyzed {v.analyzedAt}</span>
              <span className="text-white/75">
                {v.commentsAnalyzed.toLocaleString()} comments scored
              </span>
            </div>
            <div className="mt-8 flex flex-col items-stretch gap-8 md:flex-row md:items-center">
              <SentimentDonut split={v.overallSentiment} />
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-wider text-white/45">
                  Overall audience tone
                </p>
                <SentimentBar split={v.overallSentiment} size="lg" />
                <SentimentLegend split={v.overallSentiment} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl text-white">Cast mentions</h2>
        <p className="mt-1 max-w-2xl text-sm text-white/55">
          Sorted by mention volume. Signal cards surface bring-back and fatigue
          phrases from real comments.
        </p>
        <ul className="mt-6 grid gap-5 md:grid-cols-2">
          {[...v.cast]
            .sort((a, b) => b.mentionCount - a.mentionCount)
            .map((c) => (
              <li key={c.slug} className="frosted-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/cast/${c.slug}`}
                      className="font-display text-xl text-white hover:text-[var(--cast-gold)]"
                    >
                      {c.name}
                    </Link>
                    <p className="mt-1 text-sm text-white/50">
                      {c.mentionCount.toLocaleString()} comments
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full bg-[var(--cast-gold)]"
                        style={{
                          opacity: c.sentiment.positive / 100 + 0.2,
                        }}
                      />
                      <span className="text-xs text-white/45">
                        sentiment mix
                      </span>
                    </div>
                    <SentimentBar split={c.sentiment} size="sm" />
                  </div>
                </div>
                <div className="mt-5 space-y-4 border-t border-white/10 pt-5">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-positive">
                      Top positive
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-white/85">
                      “{c.topPositiveQuote}”
                    </p>
                  </div>
                  {c.topNegativeQuote ? (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-negative">
                        Top negative
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-white/75">
                        “{c.topNegativeQuote}”
                      </p>
                    </div>
                  ) : null}
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-xs">
                  {c.bringBack ? (
                    <span className="rounded-md border border-[var(--cast-gold)]/35 bg-[var(--cast-gold)]/10 px-2.5 py-1 text-[var(--cast-gold)]">
                      Bring-back signal
                    </span>
                  ) : null}
                  {c.fatigue ? (
                    <span className="rounded-md border border-[#c75c5c]/35 bg-[#c75c5c]/10 px-2.5 py-1 text-[#e8918e]">
                      Fatigue signal
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
        </ul>
      </section>

      <section className="frosted-card p-6 md:p-8">
        <h2 className="font-display text-xl text-white">Format feedback</h2>
        <p className="mt-1 text-sm text-white/50">
          Comments that did not name a cast member but still shaped perception
          of the concept, pacing, or production.
        </p>
        <ul className="mt-5 space-y-4">
          {v.generalComments.map((g, i) => (
            <li
              key={i}
              className="border-l-2 border-white/15 pl-4 text-sm leading-relaxed text-white/78"
            >
              <span
                className={
                  g.sentiment === "positive"
                    ? "text-positive"
                    : g.sentiment === "negative"
                      ? "text-negative"
                      : "text-white/55"
                }
              >
                [{g.sentiment}]
              </span>{" "}
              {g.text}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
