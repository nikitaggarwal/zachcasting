import { listRosterRows } from "@/lib/data";
import { RosterTable } from "@/components/RosterTable";

export default function RosterPage() {
  const rows = listRosterRows();
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
      </header>
      <RosterTable rows={rows} />
    </div>
  );
}
