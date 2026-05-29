import Link from "next/link";

const nav = [
  { href: "/roster", label: "Roster" },
  { href: "/videos", label: "Uploads" },
  { href: "/pulse#videos", label: "Pulse" },
  { href: "/add-video", label: "Add" },
];

const tickerItems = [
  "S01 · W22 BROADCAST DECK",
  "AUDIENCE INTEL FOR THE ZACH JUSTICE CHANNEL",
  "DROPOUTS-ADJACENT",
  "WHO TO CAST / WHO TO REST",
  "COMMENT SENTIMENT TRACKER",
  "TALENT ROSTER + WEEKLY PULSE",
];

function FormattedDate() {
  const now = new Date();
  const iso = now
    .toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "2-digit",
      year: "numeric",
    })
    .toUpperCase();
  return <span suppressHydrationWarning>{iso}</span>;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative z-10 flex min-h-screen flex-col">
      {/* Top utility bar — broadcast control strip */}
      <div className="border-b border-[var(--rule)] bg-[rgba(10,9,8,0.55)] backdrop-blur-md">
        <div className="flex items-center gap-4 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--text-faint)] md:px-8">
          <span className="inline-flex items-center gap-2 text-[var(--red)]">
            <span className="live-dot" />
            LIVE
          </span>
          <span className="hidden text-[var(--text-faint)] sm:inline">
            CH · ZACH JUSTICE
          </span>
          <span className="hidden text-[var(--text-faint)] md:inline">
            FEED · YOUTUBE COMMENTS
          </span>
          <span className="ml-auto text-[var(--text-faint)]">
            <FormattedDate />
          </span>
        </div>
      </div>

      {/* Masthead */}
      <header className="relative border-b border-[var(--rule)]">
        <div className="px-4 pb-6 pt-8 md:px-8 md:pb-10 md:pt-12">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="reveal-up">
              <p className="eyebrow">
                <span className="inline-flex items-center gap-2">
                  <span className="smpte-bars">
                    <span style={{ background: "#c0c0c0" }} />
                    <span style={{ background: "#c0c000" }} />
                    <span style={{ background: "#00c0c0" }} />
                    <span style={{ background: "#00c000" }} />
                    <span style={{ background: "#c000c0" }} />
                    <span style={{ background: "#c00000" }} />
                    <span style={{ background: "#0000c0" }} />
                  </span>
                  ISSUE №022 · AUDIENCE INTEL
                </span>
              </p>
              <Link
                href="/roster"
                className="group mt-3 inline-flex items-baseline gap-3"
              >
                <h1 className="font-mono text-4xl font-semibold uppercase tracking-[-0.02em] text-[var(--cream)] md:text-5xl">
                  CASTBOARD
                </h1>
                <span className="font-display text-2xl text-[var(--gold)] md:text-3xl">
                  / a stat sheet
                </span>
              </Link>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--text-muted)]">
                A weekly read on who&apos;s landing with the audience —
                line-by-line, comment-by-comment.
              </p>
            </div>
            <nav className="reveal-up delay-1 flex flex-wrap items-center gap-x-6 gap-y-3 md:justify-end">
              {nav.map((item, i) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group relative font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--cream)] transition hover:text-[var(--gold)]"
                >
                  <span className="mr-2 text-[var(--text-faint)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="link-rule">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Marquee ticker */}
        <div className="border-y border-[var(--rule)] bg-[rgba(244,234,213,0.02)] py-2">
          <div className="marquee">
            <div className="marquee-track font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--text-muted)]">
              {[...tickerItems, ...tickerItems].map((item, i) => (
                <span key={i} className="inline-flex items-center gap-3">
                  <span className="text-[var(--gold)]">◆</span>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="relative flex-1 px-4 py-10 md:px-8 md:py-14">
        {children}
      </main>

      <footer className="border-t border-[var(--rule)] px-4 py-6 md:px-8">
        <div className="flex flex-col gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--text-faint)] md:flex-row md:items-center md:justify-between">
          <span>
            CASTBOARD · BUILT FOR THE ZACH JUSTICE CHANNEL · DROPOUTS-ADJACENT
          </span>
          <span>
            END-OF-FEED · <FormattedDate />
          </span>
        </div>
      </footer>
    </div>
  );
}
