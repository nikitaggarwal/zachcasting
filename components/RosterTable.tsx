"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CastStatus, RosterRow } from "@/lib/types";

const CAST_COLS = [
  { key: "rank" as const, label: "#" },
  { key: "name", label: "Name" },
  { key: "totalAppearances", label: "Appearances" },
  { key: "avgSentimentPositive", label: "Avg. positive" },
  { key: "lastAppearanceDate", label: "Last seen" },
  { key: "trend", label: "Trend" },
  { key: "status", label: "Status" },
] as const;

const HOST_COLS = CAST_COLS.filter((c) => c.key !== "rank");

type SortKey = Exclude<(typeof CAST_COLS)[number]["key"], "rank">;

function TrendArrow({ t }: { t: RosterRow["trend"] }) {
  if (t === "up") return <span className="text-positive">↑ Up</span>;
  if (t === "down") return <span className="text-negative">↓ Down</span>;
  return <span className="text-white/50">→ Flat</span>;
}

function statusStyle(s: CastStatus) {
  switch (s) {
    case "Hot":
      return "border-[var(--cast-gold)]/35 text-[var(--cast-gold)] bg-[var(--cast-gold)]/10";
    case "Resting":
      return "border-[#c75c5c]/35 text-[#e8918e] bg-[#c75c5c]/10";
    case "Overexposed":
      return "border-amber-200/25 text-amber-100/90 bg-amber-100/10";
    default:
      return "border-white/20 text-white/70 bg-white/5";
  }
}

function RosterCells({
  r,
  rank,
}: {
  r: RosterRow;
  rank?: number;
}) {
  const muted = r.noCommentDataYet ? " text-white/45" : "";
  const nameEl = r.noCommentDataYet ? (
    <span className={`font-display text-base${muted}`}>{r.name}</span>
  ) : (
    <Link
      href={`/cast/${r.slug}`}
      className="font-display text-base text-white hover:text-[var(--cast-gold)]"
    >
      {r.name}
    </Link>
  );
  return (
    <>
      {rank != null ? (
        <td className="w-10 px-2 py-4 text-center font-mono text-sm text-white/45">
          {rank}
        </td>
      ) : null}
      <td className="min-w-[9rem] px-4 py-4">{nameEl}</td>
      <td className={`min-w-[7rem] px-4 py-4 text-white/70 tabular-nums${muted}`}>
        {r.noCommentDataYet ? (
          <span title="Not mentioned in analyzed comments yet">—</span>
        ) : (
          r.totalAppearances
        )}
      </td>
      <td className={`min-w-[5.5rem] px-4 py-4 tabular-nums${muted}`}>
        {r.noCommentDataYet ? (
          <span className="text-white/50" title="Not mentioned in analyzed comments yet">
            —
          </span>
        ) : (
          <span className="text-positive">{r.avgSentimentPositive}%</span>
        )}
      </td>
      <td className={`min-w-[8rem] whitespace-nowrap px-4 py-4 text-white/60${muted}`}>
        {r.noCommentDataYet ? (
          <span title="Not mentioned in analyzed comments yet">—</span>
        ) : (
          r.lastAppearanceDate
        )}
      </td>
      <td className={`min-w-[5rem] px-4 py-4${muted}`}>
        {r.noCommentDataYet ? (
          <span className="text-white/50" title="Not mentioned in analyzed comments yet">
            —
          </span>
        ) : (
          <TrendArrow t={r.trend} />
        )}
      </td>
      <td className={`min-w-[6rem] px-4 py-4${muted}`}>
        {r.noCommentDataYet ? (
          <span className="rounded-md border border-white/15 px-2.5 py-1 text-xs text-white/50">
            —
          </span>
        ) : (
          <span
            className={`inline-block rounded-md border px-2.5 py-1 text-xs ${statusStyle(r.status)}`}
          >
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
    <div className="space-y-8">
      {hostRow ? (
        <section className="space-y-3">
          <h3 className="text-xs uppercase tracking-wider text-white/45">
            Channel host
          </h3>
          <p className="text-sm text-white/50">
            {hostLabel} — not ranked with on-camera cast; same comment metrics.
          </p>
          <div className="frosted-card overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/45">
                  {HOST_COLS.map((c) => (
                    <th key={c.key} className="px-4 py-3 font-medium">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/[0.06] bg-[var(--cast-gold)]/[0.06] transition hover:bg-white/[0.04]">
                  <RosterCells r={hostRow} />
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-xs uppercase tracking-wider text-white/45">
            On-camera cast
          </h3>
          <p className="max-w-3xl text-sm text-white/50">
            {castRows.length === 0 ? (
              <>
                No cast data in storage yet. Open{" "}
                <Link
                  href="/pulse#videos"
                  className="text-[var(--cast-gold)] underline-offset-4 hover:underline"
                >
                  Channel pulse
                </Link>{" "}
                (or analyze a video); results persist locally—refresh this page after.
              </>
            ) : (
              <>
                Everyone listed appears in your saved comment analyses (local DB). Refresh
                the page after pulse runs to pick up new faces. Scroll sideways on narrow
                screens to see all columns.
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs uppercase tracking-wider text-white/45">
            Filter
          </span>
          {statuses.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                statusFilter === s
                  ? "border-[var(--cast-gold)]/50 bg-[var(--cast-gold)]/15 text-[var(--cast-gold)]"
                  : "border-white/12 bg-white/[0.05] text-white/65 hover:border-white/20"
              }`}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>

        <div className="frosted-card overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/45">
                {CAST_COLS.map((c) => (
                  <th key={c.key} className="px-4 py-3 font-medium">
                    {c.key === "rank" ? (
                      <span className="text-white/45">#</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleCol(c.key as SortKey)}
                        className="inline-flex items-center gap-1 hover:text-white/80"
                      >
                        {c.label}
                        {sortKey === c.key ? (
                          <span className="text-[var(--cast-gold)]">
                            {sortDir === "asc" ? "▲" : "▼"}
                          </span>
                        ) : null}
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
                  className="border-b border-white/[0.06] transition hover:bg-white/[0.04]"
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
