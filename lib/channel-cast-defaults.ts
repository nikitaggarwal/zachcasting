/**
 * Names the comment model scans for when `CHANNEL_CAST_NAMES` is unset in `.env.local`.
 *
 * Seeds are geared toward Zach Justice blind-dating uploads (hosts + collaborators
 * people often shout out in threads). Swap or extend these for whoever matches
 * `YOUTUBE_CHANNEL_ID`; commit edits so the homepage pulse works without env cast list.
 */
export const TRACKED_CAST_NAME_DEFAULTS: readonly string[] = [
  "Zach Justice",
  "Indiana Massara",
  "Trevor Wallace",
];
