import { AnalyzeUnseenUploadsButton } from "@/components/AnalyzeUnseenUploadsButton";
import { PulseHashScroll } from "@/components/PulseHashScroll";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  fetchLiveChannelPulse,
  pulseChannelDigest,
  type ChannelPulsePayload,
} from "@/lib/channel-pulse";
import { getAlerts, listPulseSummaries } from "@/lib/data";
import { SentimentBar, SentimentLegend } from "@/components/SentimentBar";
import type { PulseAlert, VideoPulseSummary } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 300;
export const runtime = "nodejs";

function alertToneClass(tone: "amber" | "coral" | "neutral") {
  if (tone === "amber")
    return "border-[var(--cast-gold)]/30 bg-[var(--cast-gold)]/10";
  if (tone === "coral") return "border-[#c75c5c]/35 bg-[#c75c5c]/10";
  return "border-white/15 bg-white/[0.07]";
}

function AlertsSection({ alerts }: { alerts: PulseAlert[] }) {
  return (
    <section>
      <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
        Alerts
      </h3>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {alerts.map((a) => (
          <div
            key={a.id}
            className={`frosted-card border p-5 ${alertToneClass(a.tone)}`}
          >
            <h4 className="font-display text-lg text-white">{a.headline}</h4>
            <p className="mt-3 text-sm leading-relaxed text-white/65">
              {a.detail}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function VideosSection({
  videos,
  id,
}: {
  videos: VideoPulseSummary[];
  id?: string;
}) {
  return (
    <section id={id} className="scroll-mt-5">
      <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
        Recently analyzed
      </h3>
      <ul className="mt-4 space-y-4">
        {videos.map((v) => {
          const thumb = `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`;
          return (
            <li key={v.id}>
              <Link
                href={`/video/${v.id}`}
                className="frosted-card group flex flex-col overflow-hidden transition hover:border-white/25 hover:bg-white/[0.14] md:flex-row"
              >
                <div className="relative aspect-video w-full shrink-0 md:w-72">
                  <Image
                    src={thumb}
                    alt=""
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.02]"
                    sizes="(max-width: 768px) 100vw, 288px"
                    unoptimized
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center p-5 md:p-6">
                  <p className="text-xs text-white/45">Analyzed {v.analyzedAt}</p>
                  <h4 className="font-display mt-1 text-xl text-white group-hover:text-[var(--cast-gold)] md:text-2xl">
                    {v.title}
                  </h4>
                  <p className="mt-2 text-sm text-white/50">
                    {v.commentsAnalyzed.toLocaleString()} comments in the model
                  </p>
                  <div className="mt-4 max-w-md">
                    <SentimentBar split={v.overallSentiment} />
                    <SentimentLegend split={v.overallSentiment} />
                  </div>
                  <div className="mt-4 border-t border-white/10 pt-4">
                    <p className="text-[10px] uppercase tracking-wider text-white/40">
                      Standout lines
                    </p>
                    <ul className="mt-2 space-y-2">
                      {v.standoutQuotes.map((q, i) => (
                        <li
                          key={i}
                          className="text-sm italic leading-snug text-white/70"
                        >
                          &ldquo;{q}&rdquo;
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function PulseBody({ pulse }: { pulse: ChannelPulsePayload | null }) {
  // Live pulse can return `{ summaries: [], alerts: [pulse-empty] }` on cold
  // serverless starts (empty /tmp cache + per-request Claude runs that can't
  // finish in the function timeout). Treat an empty live payload the same as
  // "no live data yet" so the page keeps showing demo content instead of
  // flashing real-then-empty when the user lands on it.
  const hasLiveSummaries = (pulse?.summaries.length ?? 0) > 0;
  const alerts = hasLiveSummaries ? pulse!.alerts : getAlerts();
  const videos = hasLiveSummaries ? pulse!.summaries : listPulseSummaries();
  const channelDigest = hasLiveSummaries ? pulseChannelDigest() : null;

  return (
    <div className="space-y-10">
      {channelDigest ? (
        <p className="text-[11px] tracking-wide text-white/35">
          Live pulse · {channelDigest}
        </p>
      ) : null}
      <VideosSection id="pulse-recent-videos" videos={videos} />
      <AlertsSection alerts={alerts} />
    </div>
  );
}

async function LivePulseBody({
  pulsePromise,
}: {
  pulsePromise: Promise<ChannelPulsePayload | null>;
}) {
  const pulse = await pulsePromise;
  return <PulseBody pulse={pulse} />;
}

export default function ChannelPulsePage() {
  const pulsePromise = fetchLiveChannelPulse();

  return (
    <div className="mx-auto max-w-6xl">
      <PulseHashScroll />
      <section className="relative">
        <p className="eyebrow reveal-up">◆ § 03 — Vital signs</p>
        <h2 className="reveal-up delay-1 mt-5 font-mono text-[clamp(2.25rem,6vw,4.5rem)] font-semibold uppercase leading-[0.92] tracking-[-0.03em] text-[var(--cream)]">
          Channel{" "}
          <span className="font-display italic text-[var(--gold)] lowercase">
            pulse
          </span>
        </h2>
        <p className="reveal-up delay-2 mt-6 max-w-2xl text-base leading-relaxed text-[var(--text-muted)] md:text-lg">
          A comment-driven read on recent uploads: who people are behind, who
          they&apos;re tired of, and which videos landed.
        </p>
      </section>

      <div className="section-rule mt-14 mb-8">
        <span className="eyebrow-strong">— Latest reads</span>
      </div>

      <div className="reveal-up delay-3">
        <Suspense fallback={<PulseBody pulse={null} />}>
          <LivePulseBody pulsePromise={pulsePromise} />
        </Suspense>
      </div>

      <div className="mt-16 max-w-xl border-t border-[var(--rule)] pt-8">
        <p className="eyebrow-strong mb-3">— Fetch more analyses</p>
        <AnalyzeUnseenUploadsButton />
      </div>
    </div>
  );
}
