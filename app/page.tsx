import { after } from "next/server";
import { getRosterView } from "@/lib/data";
import { fetchLiveChannelPulse } from "@/lib/channel-pulse";
import { RosterTable } from "@/components/RosterTable";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
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
  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <header className="max-w-2xl">
        <h2 className="font-display text-4xl font-semibold text-white md:text-5xl">
          Cast roster
        </h2>
        <p className="mt-4 text-lg text-white/60">
          Planning view for next week: sort by momentum, filter who is hot or
          needs a rest, then click through to full trajectories.
        </p>
        <p className="mt-4 text-sm text-white/45">
          <Link
            href="/videos"
            className="text-[var(--cast-gold)] underline-offset-4 hover:underline"
          >
            Recent uploads
          </Link>{" "}
          ·{" "}
          <Link
            href="/pulse#videos"
            className="text-[var(--cast-gold)] underline-offset-4 hover:underline"
          >
            Comment pulse
          </Link>
        </p>
      </header>
      <RosterTable hostRow={hostRow} castRows={castRows} hostLabel={hostLabel} />
    </div>
  );
}
