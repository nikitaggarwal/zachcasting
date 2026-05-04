import type { SentimentSplit } from "@/lib/types";

export function SentimentDonut({ split }: { split: SentimentSplit }) {
  const { positive, negative } = split;
  const grad = `conic-gradient(
    var(--cast-gold) 0% ${positive}%,
    #c75c5c ${positive}% ${positive + negative}%,
    rgba(255,255,255,0.38) ${positive + negative}% 100%
  )`;
  return (
    <div className="relative mx-auto h-40 w-40 shrink-0 md:h-48 md:w-48">
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: grad }}
      />
      <div className="absolute inset-[18%] flex flex-col items-center justify-center rounded-full bg-[rgba(12,45,42,0.92)] text-center shadow-inner ring-1 ring-white/10">
        <span className="text-2xl font-semibold text-white md:text-3xl">
          {positive}%
        </span>
        <span className="text-[10px] uppercase tracking-wider text-white/45">
          positive
        </span>
      </div>
    </div>
  );
}
