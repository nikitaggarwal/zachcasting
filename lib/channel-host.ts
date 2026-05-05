import { slugifyName } from "./slug";
import { PULSE_FIRST_RUN_CAST_NAMES } from "./channel-cast-defaults";

/** Display name for the channel owner (not ranked with on-camera cast). */
export function resolveChannelHostDisplayName(): string {
  const fromEnv = process.env.CHANNEL_HOST_NAME?.trim();
  if (fromEnv) return fromEnv;
  return PULSE_FIRST_RUN_CAST_NAMES[0] ?? "Channel host";
}

/** Slug for profile links; must match Claude cast detection for “Zach Justice”. */
export function resolveChannelHostSlug(): string {
  return slugifyName(resolveChannelHostDisplayName());
}
