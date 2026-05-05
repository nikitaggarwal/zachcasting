import Link from "next/link";

const nav = [
  { href: "/roster", label: "Cast Roster" },
  { href: "/videos", label: "Recent uploads" },
  { href: "/pulse#videos", label: "Channel pulse" },
  { href: "/add-video", label: "Add video" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative z-10 flex min-h-screen flex-col">
      <header className="frosted-card mx-4 mt-4 border-white/[0.12] px-5 py-4 md:mx-8 md:mt-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-white/45">
              Dropouts-adjacent · Audience intel
            </p>
            <Link href="/roster" className="group mt-1 inline-block">
              <h1 className="font-display text-3xl font-semibold tracking-tight text-white md:text-4xl">
                CastBoard
              </h1>
              <span className="mt-1 block h-px w-0 bg-[var(--cast-gold)] transition-all group-hover:w-full" />
            </Link>
          </div>
          <nav className="flex flex-wrap gap-2 md:gap-3">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg border border-white/[0.12] bg-white/[0.06] px-4 py-2.5 text-sm text-white/85 transition hover:border-white/25 hover:bg-white/[0.1]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="relative flex-1 px-4 py-8 md:px-8 md:py-10">
        {children}
      </main>
    </div>
  );
}
