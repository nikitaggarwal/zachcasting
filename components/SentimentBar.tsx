import type { SentimentSplit } from "@/lib/types";

export function SentimentBar({
  split,
  size = "md",
}: {
  split: SentimentSplit;
  size?: "sm" | "md" | "lg";
}) {
  const h =
    size === "sm" ? "h-2" : size === "lg" ? "h-4" : "h-2.5";
  return (
    <div
      className={`flex w-full overflow-hidden rounded-full ${h} ring-1 ring-white/10`}
      title={`${split.positive}% positive · ${split.negative}% negative · ${split.neutral}% neutral`}
    >
      <div
        className="bg-[var(--cast-gold)] transition-all"
        style={{ width: `${split.positive}%` }}
      />
      <div
        className="bg-[#c75c5c]/90 transition-all"
        style={{ width: `${split.negative}%` }}
      />
      <div
        className="bg-white/35 transition-all"
        style={{ width: `${split.neutral}%` }}
      />
    </div>
  );
}

export function SentimentLegend({ split }: { split: SentimentSplit }) {
  return (
    <div className="mt-2 flex flex-wrap gap-4 text-xs text-white/55">
      <span>
        <span className="text-positive font-medium">{split.positive}%</span>{" "}
        positive
      </span>
      <span>
        <span className="text-negative font-medium">{split.negative}%</span>{" "}
        negative
      </span>
      <span>
        <span className="font-medium text-white/65">{split.neutral}%</span>{" "}
        neutral
      </span>
    </div>
  );
}
