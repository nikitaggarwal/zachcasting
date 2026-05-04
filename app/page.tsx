import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchLiveChannelPulse, pulseChannelDigest, type ChannelPulsePayload } from "@/lib/channel-pulse";
import { getAlerts, listPulseSummaries } from "@/lib/data";
import { SentimentBar, SentimentLegend } from "@/components/SentimentBar";
import type { PulseAlert, VideoPulseSummary } from "@/lib/types";

/** Skip static pre-render; page is dynamic on every request but the shell renders instantly via Suspense. */
export const dynamic = "force-dynamic";
/** Native SQLite + long pulse pipeline — keep on Node; increase limit on Vercel Pro if needed. */
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

function VideosSection({ videos }: { videos: VideoPulseSummary[] }) {
  return (
    <section>
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
                  <p className="text-xs text-white/45">
                    Analyzed {v.analyzedAt}
                  </p>
                  <h4 className="font-display mt-1 text-xl text-white group-hover:text-[var(--cast-gold)] md:text-2xl">
                    {v.title}
                  </h4>
                  <p className="mt-2 text-sm text-white/50">
                    {v.commentsAnalyzed.toLocaleString()} comments in the
                    model
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
  const alerts = pulse?.alerts ?? getAlerts();
  const videos = pulse?.summaries ?? listPulseSummaries();
  const channelDigest = pulse ? pulseChannelDigest() : null;

  return (
    <div className="space-y-12">
      {channelDigest ? (
        <p className="text-xs tracking-wide text-white/40">
          Live pulse · channel {channelDigest} · analyses persist under{" "}
          <code className="rounded bg-white/10 px-1 py-0.5 text-[11px]">data/</code>{" "}
          and refresh after CHANNEL_PULSE_REVALIDATE_SECONDS
        </p>
      ) : null}
      <AlertsSection alerts={alerts} />
      <VideosSection videos={videos} />
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
    <div className="mx-auto max-w-6xl space-y-12">
      <header className="max-w-3xl">
        <h2 className="font-display text-4xl font-semibold tracking-tight text-white md:text-5xl">
          Channel pulse
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-white/60">
          Quick read on recent uploads: who commenters are rallying behind, who
          they&apos;re getting sick of, and which videos actually landed — based
          on what people wrote in the comments.
        </p>
      </header>

      <Suspense fallback={<PulseBody pulse={null} />}>
        <LivePulseBody pulsePromise={pulsePromise} />
      </Suspense>
    </div>
  );
}
