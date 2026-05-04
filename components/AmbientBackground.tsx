export function AmbientBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      {/* Subtle dot field — reads as "analytics canvas" not decoration copy */}
      <div
        className="ambient-dots absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* Soft color mesh — amber / teal / muted coral */}
      <div
        className="absolute -left-[20%] top-[18%] h-[58vmin] w-[58vmin] rounded-full bg-[rgba(212,162,76,0.11)] blur-3xl"
        style={{ animation: "ambient-blob-a 38s ease-in-out infinite" }}
      />
      <div
        className="absolute -right-[12%] top-[8%] h-[42vmin] w-[42vmin] rounded-full bg-[rgba(95,160,150,0.14)] blur-3xl"
        style={{
          animation: "ambient-blob-b 44s ease-in-out infinite",
          animationDelay: "-12s",
        }}
      />
      <div
        className="absolute -right-[8%] bottom-[12%] h-[52vmin] w-[52vmin] rounded-full bg-[rgba(80,130,125,0.12)] blur-3xl"
        style={{
          animation: "ambient-blob-a 42s ease-in-out infinite reverse",
          animationDelay: "-20s",
        }}
      />
      <div
        className="absolute left-[25%] bottom-[5%] h-[38vmin] w-[38vmin] rounded-full bg-[rgba(199,92,92,0.06)] blur-3xl"
        style={{
          animation: "ambient-blob-b 36s ease-in-out infinite",
          animationDelay: "-6s",
        }}
      />
      <div className="absolute left-[45%] top-[40%] -translate-x-1/2 -translate-y-1/2">
        <div
          className="h-[28vmin] w-[28vmin] rounded-full bg-[rgba(255,255,255,0.04)] blur-2xl"
          style={{
            animation: "ambient-blob-a 50s ease-in-out infinite",
            animationDelay: "-25s",
          }}
        />
      </div>

      {/* Large thin rings — slow drift + rotation, no text */}
      <div
        className="absolute left-1/2 top-[42%] h-[min(140vmin,1400px)] w-[min(140vmin,1400px)] rounded-full border border-white/[0.07]"
        style={{ animation: "ambient-ring 100s linear infinite" }}
      />
      <div
        className="absolute left-[42%] top-[48%] h-[min(95vmin,900px)] w-[min(95vmin,900px)] rounded-full border border-white/[0.05]"
        style={{
          animation: "ambient-ring-reverse 140s linear infinite",
        }}
      />
      <div
        className="absolute right-[-5%] top-[20%] h-[min(55vmin,500px)] w-[min(55vmin,500px)] rounded-full border border-[rgba(212,162,76,0.08)]"
        style={{
          animation: "ambient-drift-ring 48s ease-in-out infinite",
        }}
      />

      {/* Soft arc fragment — SVG, suggests charts without being literal */}
      <svg
        className="absolute -right-[8%] bottom-[22%] h-[min(45vmin,420px)] w-[min(45vmin,420px)] text-white/[0.06]"
        viewBox="0 0 200 200"
        fill="none"
        aria-hidden
        style={{ animation: "ambient-svg-drift 55s ease-in-out infinite" }}
      >
        <path
          d="M 20 120 A 80 80 0 0 1 160 100"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        <path
          d="M 40 150 A 95 95 0 0 1 170 130"
          stroke="currentColor"
          strokeWidth="0.75"
          strokeOpacity="0.7"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
