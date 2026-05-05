"use client";

import { useEffect, useState } from "react";

const TEN_MORE = 10;

type Limits = {
  defaultMaxVideos: number;
  defaultPlaylistScanDepth: number;
  hardCapMaxVideos: number;
  isVercel: boolean;
  maxDurationSeconds: number;
  note: string;
};

export function AnalyzeUnseenUploadsButton() {
  const [limits, setLimits] = useState<Limits | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/channel/backfill")
      .then((r) => r.json())
      .then((j) =>
        setLimits({
          defaultMaxVideos: Number(j.defaultMaxVideos) || 50,
          defaultPlaylistScanDepth: Number(j.defaultPlaylistScanDepth) || 500,
          hardCapMaxVideos: Number(j.hardCapMaxVideos) || 80,
          isVercel: !!j.isVercel,
          maxDurationSeconds: Number(j.maxDurationSeconds) || 900,
          note: typeof j.note === "string" ? j.note : "",
        })
      )
      .catch(() =>
        setLimits({
          defaultMaxVideos: 50,
          defaultPlaylistScanDepth: 500,
          hardCapMaxVideos: 80,
          isVercel: false,
          maxDurationSeconds: 900,
          note: "",
        })
      );
  }, []);

  async function run() {
    const L = limits;
    if (!L) return;
    const dv = L.defaultMaxVideos;
    const dd = L.defaultPlaylistScanDepth;
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/channel/backfill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maxVideos: dv,
          playlistScanDepth: dd,
        }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        error?: string;
        analyzedYoutubeIds?: string[];
        skipped?: { youtubeId: string; reason: string }[];
        deploymentShortRun?: boolean;
      };
      if (!data.ok) {
        setStatus(data.error ?? "Backfill failed");
        return;
      }
      const n = data.analyzedYoutubeIds?.length ?? 0;
      const sk = data.skipped?.length ?? 0;
      const tail =
        data.deploymentShortRun && n >= 1
          ? " Click again for the next batch."
          : " Run again for the next batch, then refresh.";
      setStatus(
        `Saved ${n} new analyses.${sk > 0 ? ` ${sk} skipped.` : ""}${tail}`
      );
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  async function runTenMore() {
    const L = limits;
    if (!L) return;
    setBusy(true);
    setStatus(null);
    let totalSaved = 0;
    let totalSkip = 0;

    try {
      const per = L.isVercel
        ? L.hardCapMaxVideos
        : Math.min(TEN_MORE, L.hardCapMaxVideos);
      const batches = L.isVercel ? Math.ceil(TEN_MORE / per) : 1;
      const dd = L.defaultPlaylistScanDepth;

      for (let b = 0; b < batches; b++) {
        const maxVideos = L.isVercel ? per : TEN_MORE;
        setStatus(
          L.isVercel && batches > 1
            ? `… ${b + 1}/${batches}`
            : "Processing…"
        );

        const res = await fetch("/api/channel/backfill", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ maxVideos, playlistScanDepth: dd }),
        });
        const data = (await res.json()) as {
          ok: boolean;
          error?: string;
          analyzedYoutubeIds?: string[];
          skipped?: { youtubeId: string; reason: string }[];
        };
        if (!data.ok) {
          setStatus(data.error ?? "Backfill failed");
          return;
        }
        totalSaved += data.analyzedYoutubeIds?.length ?? 0;
        totalSkip += data.skipped?.length ?? 0;
      }

      setStatus(
        `Done: ${totalSaved} saved, ${totalSkip} skipped. Refresh roster if needed.`
      );
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  const maxV = limits?.defaultMaxVideos ?? "—";
  const scan = limits?.defaultPlaylistScanDepth ?? "—";
  const isVercel = limits?.isVercel;

  return (
    <div className="frosted-card max-w-xl space-y-2 rounded-lg border-white/[0.08] p-3">
      <p className="text-xs leading-snug text-white/55">
        Add analyses for uploads not in the DB yet. Recent playlist scan:{" "}
        <span className="tabular-nums text-white/75">{scan}</span> IDs · up to{" "}
        <span className="tabular-nums text-white/75">{maxV}</span>/request.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy || limits === null}
          onClick={run}
          className="rounded-md border border-[var(--cast-gold)]/35 bg-[var(--cast-gold)]/12 px-3 py-2 text-xs font-medium text-[var(--cast-gold)] transition hover:bg-[var(--cast-gold)]/20 disabled:opacity-50"
        >
          {busy
            ? "…"
            : limits
              ? isVercel
                ? `Next batch · ${maxV} max`
                : `Find more · ${maxV} max`
              : "…"}
        </button>
        <button
          type="button"
          disabled={busy || limits === null}
          onClick={runTenMore}
          className="rounded-md border border-white/18 bg-white/[0.06] px-3 py-2 text-xs font-medium text-white/88 transition hover:bg-white/[0.1] disabled:opacity-50"
        >
          {busy ? "…" : `+${TEN_MORE} videos`}
        </button>
      </div>
      <details className="text-xs text-white/45">
        <summary className="cursor-pointer select-none text-white/50 hover:text-white/65">
          Deployment limits &amp; tips
        </summary>
        <div className="mt-2 space-y-1.5 border-t border-white/[0.08] pt-2 pl-0.5">
          {!limits ? (
            <p>Loading…</p>
          ) : isVercel ? (
            <p>
              Vercel caps each run (~{limits.maxDurationSeconds}s). Use +{TEN_MORE} to
              chain short requests. Names propagate after saves.
            </p>
          ) : (
            <p>
              Long hosts can run large batches. Cast names from stored analyses feed
              the next run.
            </p>
          )}
          {limits?.note ? <p className="text-white/40">{limits.note}</p> : null}
          <p className="text-white/38">
            Sparse comments or nicknames can limit how many distinct names appear.
          </p>
        </div>
      </details>
      {status ? (
        <p className="line-clamp-3 text-xs leading-snug text-white/65">{status}</p>
      ) : null}
    </div>
  );
}
