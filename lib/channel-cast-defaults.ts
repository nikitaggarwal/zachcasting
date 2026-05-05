/**
 * Cold start: when SQLite has no prior analyses, pulse uses these seeds so Claude has
 * a baseline list. Every saved run also stores whoever appears in comments; the next run
 * merges those names from the DB (see `resolvePulseCastNamesForChannel`).
 *
 * Optional: set `CHANNEL_CAST_NAMES` in `.env.local` only if you need a manual override.
 */
export const PULSE_FIRST_RUN_CAST_NAMES: readonly string[] = [
  "Zach Justice",
  "Indiana Massara",
  "Trevor Wallace",
];

/** Rare override — leave empty so names come from saved analyses. */
export function parseOptionalChannelCastNamesFromEnv(): string[] {
  const castRaw = (process.env.CHANNEL_CAST_NAMES ?? "").trim();
  return [
    ...new Set(
      castRaw
        .split(/[,|\n]+/)
        .map((s) => s.trim())
        .filter(Boolean)
    ),
  ];
}
