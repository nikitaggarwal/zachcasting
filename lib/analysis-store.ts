import "server-only";
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import type { VideoAnalysis } from "@/lib/types";

const DATA_DIR =
  process.env.DATA_DIR ?? path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "analyses.sqlite");

let dbInstance: Database.Database | null = null;

function ensureSchema(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS video_analysis (
      youtube_id TEXT PRIMARY KEY NOT NULL,
      channel_id TEXT NOT NULL,
      cast_signature TEXT NOT NULL,
      published_at TEXT NOT NULL,
      stored_at_ms INTEGER NOT NULL,
      payload_json TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_va_channel_published
      ON video_analysis (channel_id, published_at DESC);
  `);
  database.pragma("journal_mode = WAL");
}

function openDb(): Database.Database {
  if (dbInstance) return dbInstance;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const database = new Database(DB_FILE);
  ensureSchema(database);
  dbInstance = database;
  return database;
}

/** Stable key for TTL + cache invalidation when the cast roster changes */
export function normalizeCastSignature(castNames: string[]): string {
  return [...new Set(castNames.map((x) => x.trim()).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b))
    .join("|");
}

export type UpsertVideoAnalysisInput = {
  youtubeId: string;
  channelId: string;
  castSignature: string;
  analysis: VideoAnalysis;
};

export function upsertVideoAnalysis(input: UpsertVideoAnalysisInput): void {
  const db = openDb();
  const payload = JSON.stringify(input.analysis);
  const now = Date.now();
  db.prepare(
    `
    INSERT INTO video_analysis (
      youtube_id, channel_id, cast_signature,
      published_at, stored_at_ms, payload_json
    ) VALUES (
      @youtube_id, @channel_id, @cast_signature,
      @published_at, @stored_at_ms, @payload_json
    )
    ON CONFLICT(youtube_id) DO UPDATE SET
      channel_id = excluded.channel_id,
      cast_signature = excluded.cast_signature,
      published_at = excluded.published_at,
      stored_at_ms = excluded.stored_at_ms,
      payload_json = excluded.payload_json
    `
  ).run({
    youtube_id: input.youtubeId,
    channel_id: input.channelId,
    cast_signature: input.castSignature,
    published_at: input.analysis.publishedAt,
    stored_at_ms: now,
    payload_json: payload,
  });
}

/** Latest saved analysis for a video (any channel / roster). */
export function getStoredVideoAnalysis(
  youtubeId: string
): VideoAnalysis | null {
  const db = openDb();
  const row = db
    .prepare(
      `SELECT payload_json FROM video_analysis WHERE youtube_id = ? LIMIT 1`
    )
    .get(youtubeId) as { payload_json: string } | undefined;
  if (!row) return null;
  try {
    return JSON.parse(row.payload_json) as VideoAnalysis;
  } catch {
    return null;
  }
}

/**
 * Pulse-only warm read: skip YouTube / Claude until TTL expires and cast list matches.
 */
export function tryGetWarmPulseAnalysis(args: {
  youtubeId: string;
  pulseChannelId: string;
  castSignature: string;
  maxAgeSeconds: number;
}): VideoAnalysis | null {
  const db = openDb();
  const row = db
    .prepare(
      `SELECT channel_id, cast_signature, stored_at_ms, payload_json
       FROM video_analysis WHERE youtube_id = ? LIMIT 1`
    )
    .get(args.youtubeId) as
    | {
        channel_id: string;
        cast_signature: string;
        stored_at_ms: number;
        payload_json: string;
      }
    | undefined;

  if (!row) return null;
  if (row.channel_id !== args.pulseChannelId) return null;
  if (row.cast_signature !== args.castSignature) return null;
  if (
    Date.now() - row.stored_at_ms >
    Math.max(30, args.maxAgeSeconds) * 1000
  )
    return null;

  try {
    return JSON.parse(row.payload_json) as VideoAnalysis;
  } catch {
    return null;
  }
}
