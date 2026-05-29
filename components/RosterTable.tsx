"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CastStatus, RosterRow } from "@/lib/types";

const CAST_COLS = [
  { key: "rank" as const, label: "#" },
  { key: "name", label: "Name" },
  { key: "totalAppearances", label: "Apps" },
  { key: "avgSentimentPositive", label: "Sentiment" },
  { key: "lastAppearanceDate", label: "Last seen" },
  { key: "trend", label: "Trend" },
  { key: "status", label: "Status" },
] as const;

const HOST_COLS = CAST_COLS.filter((c) => c.key !== "rank");

type SortKey = Exclude<(typeof CAST_COLS)[number]["key"], "rank">;

function TrendArrow({ t }: { t: RosterRow["trend"] }) {
  if (t === "up")
    return (
      <span className="inline-flex items-center gap-1 font-mono text-xs text-[var(--gold)]">
        <span className="text-base leading-none">↗</span>UP
      </span>
    );
  if (t === "down")
    return (
      <span className="inline-flex items-center gap-1 font-mono text-xs text-[#ff8478]">
        <span className="text-base leading-none">↘</span>DN
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 font-mono text-xs text-[var(--text-muted)]">
      <span className="text-base leading-none">→</span>FLAT
    </span>
  );
}

function statusStyle(s: CastStatus) {
  switch (s) {
    case "Hot":
      return {
        wrap: "border-[var(--gold)]/40 text-[var(--gold)] bg-[var(--gold)]/[0.08]",
        dot: "bg-[var(--gold)]",
      };
    case "Resting":
      return {
        wrap: "border-[#ff8478]/40 text-[#ffb0a8] bg-[#ff4d3c]/[0.08]",
        dot: "bg-[#ff8478]",
      };
    case "Overexposed":
      return {
        wrap: "border-amber-200/30 text-amber-100/90 bg-amber-100/[0.06]",
        dot: "bg-amber-200/80",
      };
    default:
      return {
        wrap: "border-[var(--cream)]/20 text-[var(--cream)]/75 bg-[var(--cream)]/[0.04]",
        dot: "bg-[var(--cream)]/60",
      };
  }
}

function SentimentMicroBar({ pct }: { pct: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-sm text-[var(--gold)] tabular-nums">
        {pct}%
      </span>
      <div className="relative h-[3px] w-20 overflow-hidden rounded-full bg-[var(--cream)]/[0.08]">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-[var(--gold)]"
          style={{ width: `${Math.max(2, Math.min(100, pct))}%` }}
        />
      </div>
    </div>
  );
}

function RosterCells({
  r,
  rank,
}: {
  r: RosterRow;
  rank?: number;
}) {
  const muted = r.noCommentDataYet ? " text-[var(--text-muted)]" : "";
  const nameEl = r.noCommentDataYet ? (
    <span className={`font-display text-lg italic${muted}`}>{r.name}</span>
  ) : (
    <Link
      href={`/cast/${r.slug}`}
      className="font-display group inline-flex items-baseline gap-2 text-xl italic text-[var(--cream)] transition hover:text-[var(--gold)]"
    >
      <span className="link-rule">{r.name}</span>
    </Link>
  );
  const status = r.noCommentDataYet ? null : statusStyle(r.status);
  return (
    <>
      {rank != null ? (
        <td className="w-12 px-3 py-5 align-middle">
          <span className="font-mono text-xs text-[var(--text-faint)] tabular-nums">
            {String(rank).padStart(2, "0")}
          </span>
        </td>
      ) : null}
      <td className="min-w-[10rem] px-4 py-5 align-middle">{nameEl}</td>
      <td
        className={`min-w-[5rem] px-4 py-5 align-middle font-mono tabular-nums${muted}`}
      >
        {r.noCommentDataYet ? (
          <span
            className="text-[var(--text-faint)]"
            title="Not mentioned in analyzed comments yet"
          >
            —
          </span>
        ) : (
          <span className="text-[var(--cream)]/80">{r.totalAppearances}</span>
        )}
      </td>
      <td className={`min-w-[9rem] px-4 py-5 align-middle${muted}`}>
        {r.noCommentDataYet ? (
          <span
            className="text-[var(--text-faint)]"
            title="Not mentioned in analyzed comments yet"
          >
            —
          </span>
        ) : (
          <SentimentMicroBar pct={r.avgSentimentPositive} />
        )}
      </td>
      <td
        className={`min-w-[7rem] whitespace-nowrap px-4 py-5 align-middle font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]${muted}`}
      >
        {r.noCommentDataYet ? (
          <span title="Not mentioned in analyzed comments yet">—</span>
        ) : (
          r.lastAppearanceDate
        )}
      </td>
      <td className={`min-w-[4.5rem] px-4 py-5 align-middle${muted}`}>
        {r.noCommentDataYet ? (
          <span
            className="text-[var(--text-faint)]"
            title="Not mentioned in analyzed comments yet"
          >
            —
          </span>
        ) : (
          <TrendArrow t={r.trend} />
        )}
      </td>
      <td className={`min-w-[6.5rem] px-4 py-5 align-middle${muted}`}>
        {r.noCommentDataYet ? (
          <span className="rounded-sm border border-[var(--rule)] px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-[var(--text-faint)]">
            no data
          </span>
        ) : (
          <span
            className={`inline-flex items-center gap-2 rounded-sm border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] ${status!.wrap}`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${status!.dot}`}
            />
            {r.status}
          </span>
        )}
      </td>
    </>
  );
}

export function RosterTable({
  hostRow,
  hostLabel,
  castRows,
}: {
  hostRow: RosterRow | null;
  hostLabel: string;
  castRows: RosterRow[];
}) {
  const [sortKey, setSortKey] = useState<SortKey>("avgSentimentPositive");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<CastStatus | "all">("all");

  const sortedCast = useMemo(() => {
    const list =
      statusFilter === "all"
        ? [...castRows]
        : castRows.filter((r) => r.status === statusFilter);

    const numericSortKeys = new Set<SortKey>([
      "avgSentimentPositive",
      "totalAppearances",
    ]);

    list.sort((a, b) => {
      if (numericSortKeys.has(sortKey)) {
        const ad = a.noCommentDataYet ? 0 : 1;
        const bd = b.noCommentDataYet ? 0 : 1;
        if (ad !== bd) return bd - ad;
      }
      const av = a[sortKey];
      const bv = b[sortKey];
      let cmp = 0;
      if (typeof av === "number" && typeof bv === "number") {
        cmp = av - bv;
      } else if (typeof av === "string" && typeof bv === "string") {
        cmp = av.localeCompare(bv);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [castRows, sortKey, sortDir, statusFilter]);

  function toggleCol(k: SortKey) {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir(k === "name" || k === "lastAppearanceDate" ? "asc" : "desc");
    }
  }

  const statuses: (CastStatus | "all")[] = [
    "all",
    "Hot",
    "Fresh",
    "Overexposed",
    "Resting",
  ];

  return (
    <div className="space-y-12">
      {hostRow ? (
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="eyebrow-strong">— Host / on-mic</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-faint)]">
              {hostLabel}
            </span>
          </div>
          <p className="max-w-xl text-sm text-[var(--text-muted)]">
            Not ranked against on-camera cast; same comment metrics for
            context.
          </p>
          <div className="deck-card overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--rule)] font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-faint)]">
                  {HOST_COLS.map((c) => (
                    <th key={c.key} className="px-4 py-3 font-medium">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[var(--rule)] bg-[var(--gold)]/[0.04] transition hover:bg-[var(--gold)]/[0.08]">
                  <RosterCells r={hostRow} />
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className="space-y-6">
        <div className="space-y-3">
          <span className="eyebrow-strong">— On-camera cast</span>
          <p className="max-w-3xl text-sm leading-relaxed text-[var(--text-muted)]">
            {castRows.length === 0 ? (
              <>
                No cast data in storage yet. Open{" "}
                <Link
                  href="/pulse#videos"
                  className="link-rule text-[var(--gold)]"
                >
                  Channel pulse
                </Link>{" "}
                (or analyze a video); results persist locally — refresh after.
              </>
            ) : (
              <>
                Everyone listed appears in saved comment analyses. Refresh
                after pulse runs to pick up new faces.
              </>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-faint)]">
            Filter →
          </span>
          {statuses.map((s) => {
            const active = statusFilter === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`group relative rounded-sm border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] transition ${
                  active
                    ? "border-[var(--gold)]/60 bg-[var(--gold)]/[0.12] text-[var(--gold)]"
                    : "border-[var(--rule)] bg-transparent text-[var(--cream)]/65 hover:border-[var(--cream)]/30 hover:text-[var(--cream)]"
                }`}
              >
                {s === "all" ? "All" : s}
              </button>
            );
          })}
        </div>

        <div className="deck-card overflow-x-auto">
          <table className="w-full min-w-[880px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--rule)] font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-faint)]">
                {CAST_COLS.map((c) => (
                  <th key={c.key} className="px-4 py-4 font-medium">
                    {c.key === "rank" ? (
                      <span className="pl-1">#</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleCol(c.key as SortKey)}
                        className="inline-flex items-center gap-1.5 transition hover:text-[var(--cream)]"
                      >
                        {c.label}
                        <span className="text-[var(--gold)]">
                          {sortKey === c.key
                            ? sortDir === "asc"
                              ? "▲"
                              : "▼"
                            : ""}
                        </span>
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedCast.map((r, i) => (
                <tr
                  key={`cast-${i}-${r.slug}`}
                  className="group border-b border-[var(--rule)] transition hover:bg-[var(--cream)]/[0.03]"
                >
                  <RosterCells r={r} rank={i + 1} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
