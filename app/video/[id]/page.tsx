import { findMockVideo } from "@/lib/data";
import { fetchPulseCachedAnalysisForVideo } from "@/lib/channel-pulse";
import { VideoDrilldown } from "@/components/VideoDrilldown";
import { isLikelyYoutubeVideoId } from "@/lib/youtube";

type Props = { params: Promise<{ id: string }> };

export default async function VideoPage({ params }: Props) {
  const { id } = await params;
  const mock = findMockVideo(id) ?? null;

  const youtubeLookup = mock?.youtubeId ?? (isLikelyYoutubeVideoId(id) ? id : null);

  const pulseAnalysis =
    youtubeLookup !== null
      ? await fetchPulseCachedAnalysisForVideo(youtubeLookup)
      : null;

  const initialMock = mock && pulseAnalysis === null ? mock : null;

  return (
    <VideoDrilldown
      routeId={id}
      initialMock={initialMock}
      initialPulseAnalysis={pulseAnalysis ?? null}
    />
  );
}
