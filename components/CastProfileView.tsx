"use client";

import Link from "next/link";
import Image from "next/image";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { CastProfile } from "@/lib/types";

export function CastProfileView({ profile }: { profile: CastProfile }) {
  const chartData = profile.trajectory.map((p) => ({
    label: p.date.slice(5),
    score: p.positivePct,
    title: p.videoTitle,
  }));

  return (
    <div className="mx-auto max-w-4xl space-y-12">
      <header className="reveal-up">
        <p className="eyebrow">◆ Player card</p>
        <h1 className="font-display mt-4 text-[clamp(3rem,8vw,6rem)] italic leading-[0.95] text-[var(--cream)]">
          {profile.name}
        </h1>
        {profile.social ? (
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.2em] text-[var(--gold)]">
            {profile.social}
          </p>
        ) : null}
        <div className="mt-8 grid grid-cols-3 gap-px overflow-hidden border border-[var(--rule)] bg-[var(--rule)]">
          <div className="stat-tile bg-[var(--ink)]">
            <p className="eyebrow">Appearances</p>
            <p className="mt-2 font-display text-3xl text-[var(--cream)]">
              {profile.appearanceCount}
            </p>
          </div>
          <div className="stat-tile bg-[var(--ink)]">
            <p className="eyebrow">Avg. positive</p>
            <p className="mt-2 font-display text-3xl text-[var(--gold)]">
              {profile.avgPositivePct}%
            </p>
          </div>
          <div className="stat-tile bg-[var(--ink)]">
            <p className="eyebrow">Status</p>
            <p
              className="mt-2 font-display text-3xl"
              style={{
                color:
                  profile.status === "Hot"
                    ? "var(--gold)"
                    : profile.status === "Resting"
                      ? "#ff8478"
                      : "var(--cream)",
              }}
            >
              {profile.status}
            </p>
          </div>
        </div>
      </header>

      <section className="frosted-card p-6 md:p-8">
        <h2 className="font-display text-2xl text-white">Sentiment trajectory</h2>
        <p className="mt-2 max-w-xl text-sm text-white/55">
          Positive sentiment share across analyzed appearances — see where
          momentum peaks and where fatigue shows up.
        </p>
        <div className="mt-8 h-72 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
            >
              <CartesianGrid
                stroke="rgba(255,255,255,0.08)"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                stroke="rgba(255,255,255,0.35)"
                tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
              />
              <YAxis
                domain={[0, 100]}
                stroke="rgba(255,255,255,0.35)"
                tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
                width={36}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const p = payload[0].payload as {
                    label: string;
                    score: number;
                    title: string;
                  };
                  return (
                    <div
                      className="rounded-lg border border-white/12 px-3 py-2 shadow-xl"
                      style={{ background: "rgba(12,45,42,0.96)" }}
                    >
                      <p className="max-w-[220px] text-xs text-white/55">
                        {p.title}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[var(--cast-gold)]">
                        {p.score}% positive
                      </p>
                    </div>
                  );
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="var(--cast-gold)"
                strokeWidth={2.5}
                dot={{ fill: "var(--cast-gold)", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl text-white">Appearances</h2>
        <ul className="mt-4 space-y-4">
          {profile.videosAppeared.map((row) => {
            const thumb = `https://img.youtube.com/vi/${row.youtubeId}/hqdefault.jpg`;
            return (
              <li key={row.videoId}>
                <Link
                  href={`/video/${row.videoId}`}
                  className="frosted-card flex flex-col gap-4 p-4 transition hover:border-white/25 md:flex-row md:items-center"
                >
                  <div className="relative aspect-video w-full shrink-0 md:h-24 md:w-40 md:aspect-auto">
                    <Image
                      src={thumb}
                      alt=""
                      fill
                      className="rounded-lg object-cover md:rounded-md"
                      sizes="160px"
                      unoptimized
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-lg text-white">
                      {row.videoTitle}
                    </p>
                    <p className="text-sm text-white/45">{row.date}</p>
                    <p className="mt-2 text-xs uppercase tracking-wider text-positive">
                      {row.positivePct}% positive · representative comment
                    </p>
                    <p className="mt-1 text-sm text-white/75">
                      “{row.topComment}”
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="frosted-card border-[var(--cast-gold)]/25 bg-[var(--cast-gold)]/5 p-8">
        <h2 className="font-display text-xl text-white">Recommendation</h2>
        <p className="mt-4 text-base leading-relaxed text-white/80">
          {profile.recommendation}
        </p>
      </section>
    </div>
  );
}
