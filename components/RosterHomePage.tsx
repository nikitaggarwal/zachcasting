import { after } from "next/server";
import Link from "next/link";
import { fetchLiveChannelPulse } from "@/lib/channel-pulse";
import { getRosterView } from "@/lib/data";
import { RosterTable } from "@/components/RosterTable";
import type { RosterRow } from "@/lib/types";

/** Shared roster landing used at `/roster`; `/` redirects here. */
export async function RosterHomePage() {
  const yt = process.env.YOUTUBE_API_KEY?.trim();
  const anth = process.env.ANTHROPIC_API_KEY?.trim();
  const channelId = process.env.YOUTUBE_CHANNEL_ID?.trim();
  if (yt && anth && channelId) {
    after(() => {
      void fetchLiveChannelPulse().catch((e) => {
        console.warn("[home] background pulse failed", e);
      });
    });
  }

  const { hostRow, castRows, hostLabel } = await getRosterView();

  const stats = computeStats(castRows);

  return (
    <div className="mx-auto max-w-6xl">
      {/* Hero */}
      <section className="relative">
        <p className="eyebrow reveal-up">
          ◆ Cover story · The casting question
        </p>
        <h2 className="reveal-up delay-1 mt-5 font-mono text-[clamp(2.5rem,7vw,5.5rem)] font-semibold uppercase leading-[0.9] tracking-[-0.035em] text-[var(--cream)]">
          Who to cast.
          <br />
          Who to{" "}
          <span className="font-display italic text-[var(--gold)] lowercase">
            rest.
          </span>
        </h2>
        <div className="reveal-up delay-2 mt-8 grid max-w-4xl gap-8 md:grid-cols-[1.4fr_1fr]">
          <p className="text-base leading-relaxed text-[var(--text-muted)] md:text-lg">
            A planning view for next week. Sort by momentum, filter who&apos;s
            hot or needs a rest, click through to the full trajectory.
            Numbers from real audience comments — not vibes.
          </p>
          <div className="flex flex-col gap-2 border-l border-[var(--rule)] pl-6 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
            <span className="text-[var(--text-faint)]">Cross-refs</span>
            <Link
              href="/videos"
              className="link-rule text-[var(--cream)] hover:text-[var(--gold)]"
            >
              → Recent uploads
            </Link>
            <Link
              href="/pulse#videos"
              className="link-rule text-[var(--cream)] hover:text-[var(--gold)]"
            >
              → Comment pulse
            </Link>
          </div>
        </div>
      </section>

      {/* Stat strip */}
      <section className="reveal-up delay-3 mt-14 grid grid-cols-2 gap-px overflow-hidden rounded border border-[var(--rule)] bg-[var(--rule)] md:grid-cols-4">
        <StatTile
          label="On the board"
          value={String(stats.totalTracked)}
          sub="cast members tracked"
        />
        <StatTile
          label="Top performer"
          value={stats.topName ?? "—"}
          sub={
            stats.topPct != null
              ? `${stats.topPct}% positive`
              : "no data yet"
          }
          accent="gold"
        />
        <StatTile
          label="Biggest mover"
          value={stats.moverName ?? "—"}
          sub={stats.moverDir === "up" ? "↑ trending up" : "→ steady"}
        />
        <StatTile
          label="Resting / overexposed"
          value={String(stats.cooling)}
          sub="due for a break"
          accent="red"
        />
      </section>

      {/* Section divider */}
      <div className="section-rule mt-20 mb-8">
        <span className="eyebrow-strong">§ 01 — The roster</span>
      </div>

      <div className="reveal-up delay-4">
        <RosterTable
          hostRow={hostRow}
          castRows={castRows}
          hostLabel={hostLabel}
        />
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent?: "gold" | "red";
}) {
  const accentColor =
    accent === "gold"
      ? "var(--gold)"
      : accent === "red"
        ? "var(--red)"
        : "var(--cream)";
  return (
    <div className="stat-tile bg-[var(--ink)]">
      <p className="eyebrow">{label}</p>
      <p
        className="mt-3 truncate font-display text-3xl leading-none md:text-4xl"
        style={{ color: accentColor }}
        title={value}
      >
        {value}
      </p>
      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
        {sub}
      </p>
    </div>
  );
}

function computeStats(rows: RosterRow[]) {
  const withData = rows.filter((r) => !r.noCommentDataYet);
  const top = [...withData].sort(
    (a, b) => b.avgSentimentPositive - a.avgSentimentPositive,
  )[0];
  const mover = withData.find((r) => r.trend === "up");
  const cooling = withData.filter(
    (r) => r.status === "Resting" || r.status === "Overexposed",
  ).length;
  return {
    totalTracked: rows.length,
    topName: top?.name ?? null,
    topPct: top?.avgSentimentPositive ?? null,
    moverName: mover?.name ?? null,
    moverDir: mover?.trend ?? "flat",
    cooling,
  };
}
