"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CastStatus, RosterRow } from "@/lib/types";

const COLS = [
  { key: "name", label: "Name" },
  { key: "totalAppearances", label: "Appearances" },
  { key: "avgSentimentPositive", label: "Avg. positive" },
  { key: "lastAppearanceDate", label: "Last seen" },
  { key: "trend", label: "Trend" },
  { key: "status", label: "Status" },
] as const;

type SortKey = (typeof COLS)[number]["key"];

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

export function RosterTable({ rows }: { rows: RosterRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("avgSentimentPositive");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<CastStatus | "all">("all");

  const sorted = useMemo(() => {
    const list =
      statusFilter === "all"
        ? [...rows]
        : rows.filter((r) => r.status === statusFilter);
    list.sort((a, b) => {
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
  }, [rows, sortKey, sortDir, statusFilter]);

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
    <div className="space-y-6">
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
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/45">
              {COLS.map((c) => (
                <th key={c.key} className="px-4 py-3 font-medium">
                  <button
                    type="button"
                    onClick={() => toggleCol(c.key)}
                    className="inline-flex items-center gap-1 hover:text-white/80"
                  >
                    {c.label}
                    {sortKey === c.key ? (
                      <span className="text-[var(--cast-gold)]">
                        {sortDir === "asc" ? "▲" : "▼"}
                      </span>
                    ) : null}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr
                key={r.slug}
                className="border-b border-white/[0.06] transition hover:bg-white/[0.04]"
              >
                <td className="px-4 py-4">
                  <Link
                    href={`/cast/${r.slug}`}
                    className="font-display text-base text-white hover:text-[var(--cast-gold)]"
                  >
                    {r.name}
                  </Link>
                </td>
                <td className="px-4 py-4 text-white/70">{r.totalAppearances}</td>
                <td className="px-4 py-4 text-positive">
                  {r.avgSentimentPositive}%
                </td>
                <td className="px-4 py-4 text-white/60">{r.lastAppearanceDate}</td>
                <td className="px-4 py-4">
                  <TrendArrow t={r.trend} />
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-block rounded-md border px-2.5 py-1 text-xs ${statusStyle(r.status)}`}
                  >
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
