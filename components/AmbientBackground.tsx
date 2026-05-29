export function AmbientBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      {/* Halftone dot field — analog print feel */}
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(244,234,213,0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 40%, #000 0%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 40%, #000 0%, transparent 100%)",
        }}
      />

      {/* Vertical column rules — broadcast deck grid */}
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(244,234,213,0.04) 1px, transparent 1px)",
          backgroundSize: "calc((100% - 2rem) / 12) 100%",
          backgroundPosition: "1rem 0",
        }}
      />

      {/* Warm corner wash */}
      <div
        className="absolute -left-[18%] -top-[8%] h-[68vmin] w-[68vmin] rounded-full bg-[rgba(224,169,109,0.08)] blur-[100px]"
        style={{ animation: "ambient-blob-a 38s ease-in-out infinite" }}
      />
      <div
        className="absolute -bottom-[12%] -right-[10%] h-[58vmin] w-[58vmin] rounded-full bg-[rgba(255,77,60,0.05)] blur-[100px]"
        style={{
          animation: "ambient-blob-b 44s ease-in-out infinite",
          animationDelay: "-12s",
        }}
      />

      {/* Ghost serif mark — "Z" for Zach, drifts behind everything */}
      <div
        className="absolute left-1/2 top-1/2 text-[min(80vw,80vh)] leading-none text-[var(--cream)] select-none"
        style={{
          fontFamily: "var(--font-instrument), Georgia, serif",
          fontStyle: "italic",
          fontWeight: 400,
          animation: "ghost-mark-drift 32s ease-in-out infinite",
        }}
      >
        Z
      </div>

      {/* Concentric registration ring — single, deliberate */}
      <div
        className="absolute left-[88%] top-[18%] h-[min(38vmin,360px)] w-[min(38vmin,360px)] rounded-full border border-[rgba(224,169,109,0.12)]"
        style={{ animation: "ambient-ring 120s linear infinite" }}
      />
      <div
        className="absolute left-[88%] top-[18%] h-[min(38vmin,360px)] w-[min(38vmin,360px)] rounded-full border border-[rgba(244,234,213,0.05)]"
        style={{
          transform: "scale(0.75)",
          transformOrigin: "left top",
          animation: "ambient-ring-reverse 90s linear infinite",
        }}
      />

      {/* Tick marks around an arc — broadcast clock fragment */}
      <svg
        className="absolute -left-[6%] bottom-[12%] h-[min(34vmin,300px)] w-[min(34vmin,300px)] text-[var(--cream)]/[0.08]"
        viewBox="0 0 200 200"
        fill="none"
        aria-hidden
        style={{ animation: "ambient-svg-drift 60s ease-in-out infinite" }}
      >
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i / 24) * Math.PI * 2;
          const x1 = 100 + Math.cos(angle) * 78;
          const y1 = 100 + Math.sin(angle) * 78;
          const x2 = 100 + Math.cos(angle) * (i % 6 === 0 ? 64 : 72);
          const y2 = 100 + Math.sin(angle) * (i % 6 === 0 ? 64 : 72);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="currentColor"
              strokeWidth={i % 6 === 0 ? 1.5 : 0.75}
            />
          );
        })}
        <circle
          cx="100"
          cy="100"
          r="80"
          stroke="currentColor"
          strokeWidth="0.5"
        />
      </svg>

      {/* Top vignette */}
      <div
        className="absolute inset-x-0 top-0 h-32"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,9,8,0.6) 0%, transparent 100%)",
        }}
      />
      {/* Bottom vignette */}
      <div
        className="absolute inset-x-0 bottom-0 h-32"
        style={{
          background:
            "linear-gradient(0deg, rgba(10,9,8,0.7) 0%, transparent 100%)",
        }}
      />
    </div>
  );
}
