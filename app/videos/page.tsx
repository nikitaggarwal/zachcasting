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
    <div className="mx-auto max-w-6xl space-y-10">
      <header className="max-w-3xl">
        <h2 className="font-display text-4xl font-semibold tracking-tight text-white md:text-5xl">
          Recent uploads
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-white/60">
          Every public video on the channel, newest first (from the uploads
          playlist). Open one for comment sentiment when analysis is available.
        </p>
        {configured ? (
          <p className="mt-3 text-sm tabular-nums text-white/45">
            {rows.length} video{rows.length === 1 ? "" : "s"}
          </p>
        ) : (
          <p className="mt-4 text-sm text-[#c75c5c]/90">
            Set <code className="text-xs">YOUTUBE_API_KEY</code> and{" "}
            <code className="text-xs">YOUTUBE_CHANNEL_ID</code> in the
            environment to load this list.
          </p>
        )}
      </header>

      {configured && rows.length === 0 ? (
        <p className="text-white/55">
          No videos returned—check the channel id and API key, or try again
          later.
        </p>
      ) : null}

      <ul className="space-y-3">
        {rows.map((v) => {
          const thumb = `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`;
          return (
            <li key={v.youtubeId}>
              <Link
                href={`/video/${v.youtubeId}`}
                className="frosted-card group flex gap-4 overflow-hidden p-3 transition hover:border-white/25 hover:bg-white/[0.12] md:gap-5 md:p-4"
              >
                <div className="relative h-[4.5rem] w-[8rem] shrink-0 overflow-hidden rounded-md bg-black/40 sm:h-[5.25rem] sm:w-[9.25rem]">
                  <Image
                    src={thumb}
                    alt=""
                    fill
                    className="object-cover transition duration-300 group-hover:scale-[1.03]"
                    sizes="148px"
                    unoptimized
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center py-0.5">
                  <p className="text-xs text-white/45">{v.publishedAt}</p>
                  <h3 className="font-display mt-0.5 text-base leading-snug text-white group-hover:text-[var(--cast-gold)] sm:text-lg">
                    {v.title}
                  </h3>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      {!configured ? (
        <p className="text-sm text-white/45">
          Demo mode: add keys locally or on your host (see{" "}
          <code className="rounded bg-white/10 px-1">.env.example</code>
          ).
        </p>
      ) : null}
    </div>
  );
}
