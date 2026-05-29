import Image from "next/image";
import Link from "next/link";
import { fetchAllChannelUploads } from "@/lib/youtube";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 120;

export default async function VideosPage() {
  const ytKey = process.env.YOUTUBE_API_KEY ?? "";
  const channelId = (process.env.YOUTUBE_CHANNEL_ID ?? "").trim();

  const rows =
    ytKey && channelId
      ? await fetchAllChannelUploads(channelId, ytKey)
      : [];

  const configured = Boolean(ytKey && channelId);

  return (
    <div className="mx-auto max-w-6xl">
      <section className="relative">
        <p className="eyebrow reveal-up">◆ § 02 — The catalog</p>
        <h2 className="reveal-up delay-1 mt-5 font-mono text-[clamp(2.25rem,6vw,4.5rem)] font-semibold uppercase leading-[0.92] tracking-[-0.03em] text-[var(--cream)]">
          Recent{" "}
          <span className="font-display italic text-[var(--gold)] lowercase">
            uploads
          </span>
        </h2>
        <p className="reveal-up delay-2 mt-6 max-w-2xl text-base leading-relaxed text-[var(--text-muted)] md:text-lg">
          Every public video on the channel, newest first. Click one for
          comment sentiment when analysis is available.
        </p>
        {configured ? (
          <p className="reveal-up delay-3 mt-4 font-mono text-xs uppercase tracking-[0.2em] tabular-nums text-[var(--text-faint)]">
            {String(rows.length).padStart(3, "0")} video
            {rows.length === 1 ? "" : "s"} on file
          </p>
        ) : (
          <p className="mt-4 text-sm text-[#ffb0a8]">
            Set <code className="text-xs">YOUTUBE_API_KEY</code> and{" "}
            <code className="text-xs">YOUTUBE_CHANNEL_ID</code> in the
            environment to load this list.
          </p>
        )}
      </section>

      {configured && rows.length === 0 ? (
        <p className="mt-10 text-[var(--text-muted)]">
          No videos returned — check the channel id and API key, or try again
          later.
        </p>
      ) : null}

      <div className="section-rule mt-16 mb-8">
        <span className="eyebrow-strong">— The feed</span>
      </div>

      <ul className="divide-y divide-[var(--rule)] border-y border-[var(--rule)]">
        {rows.map((v, i) => {
          const thumb = `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`;
          return (
            <li key={v.youtubeId}>
              <Link
                href={`/video/${v.youtubeId}`}
                className="group grid grid-cols-[3rem_9rem_1fr_auto] items-center gap-5 px-2 py-4 transition hover:bg-[var(--cream)]/[0.03] md:gap-7"
              >
                <span className="font-mono text-xs text-[var(--text-faint)] tabular-nums">
                  {String(i + 1).padStart(3, "0")}
                </span>
                <div className="relative aspect-video w-36 shrink-0 overflow-hidden rounded-sm bg-black/40">
                  <Image
                    src={thumb}
                    alt=""
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.04]"
                    sizes="148px"
                    unoptimized
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-faint)]">
                    {v.publishedAt}
                  </p>
                  <h3 className="font-display mt-1 text-xl italic leading-snug text-[var(--cream)] transition group-hover:text-[var(--gold)] md:text-2xl">
                    {v.title}
                  </h3>
                </div>
                <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-faint)] transition group-hover:text-[var(--gold)] md:inline">
                  Open →
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      {!configured ? (
        <p className="mt-8 text-sm text-[var(--text-muted)]">
          Demo mode: add keys locally or on your host (see{" "}
          <code className="rounded bg-[var(--cream)]/10 px-1">
            .env.example
          </code>
          ).
        </p>
      ) : null}
    </div>
  );
}
