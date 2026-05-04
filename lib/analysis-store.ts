import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { VideoAnalysis } from "@/lib/types";

type BetterCtor = typeof import("better-sqlite3");
type SqlConn = InstanceType<BetterCtor>;

function resolveDataDir(): string {
  const fromEnv = process.env.DATA_DIR?.trim();
  if (fromEnv) return fromEnv;
  if (process.env.VERCEL === "1") {
    return path.join("/tmp", "zachcasting-data");
  }
  return path.join(process.cwd(), "data");
}

const DATA_DIR = resolveDataDir();
const DB_FILE = path.join(DATA_DIR, "analyses.sqlite");

let dbInstance: SqlConn | null = null;
let dbInitFailed = false;
let opening: Promise<SqlConn | null> | null = null;

function ensureSchema(database: SqlConn) {
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

async function resolveDb(): Promise<SqlConn | null> {
  if (dbInitFailed) return null;
  if (dbInstance) return dbInstance;

  opening ??= (async (): Promise<SqlConn | null> => {
    try {
      const mod = await import("better-sqlite3");
      const BetterSqlite = (mod as { default?: BetterCtor } & Partial<BetterCtor>)
        .default ?? (mod as unknown as BetterCtor);
      fs.mkdirSync(DATA_DIR, { recursive: true });
      const database = new BetterSqlite(DB_FILE);
      ensureSchema(database);
      dbInstance = database;
      return database;
    } catch (e) {
      dbInitFailed = true;
      console.warn(
        "[analysis-store] SQLite unavailable (read-only disk or missing native build); continuing without persistence.",
        e
      );
      return null;
    }
  })().finally(() => {
    opening = null;
  });

  return opening;
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

export async function upsertVideoAnalysis(
  input: UpsertVideoAnalysisInput
): Promise<void> {
  const db = await resolveDb();
  if (!db) return;
  const payload = JSON.stringify(input.analysis);
  const now = Date.now();
  try {
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
  } catch (e) {
    console.warn("[analysis-store] upsert failed", e);
  }
}

/** Latest saved analysis for a video (any channel / roster). */
export async function getStoredVideoAnalysis(
  youtubeId: string
): Promise<VideoAnalysis | null> {
  const db = await resolveDb();
  if (!db) return null;
  try {
    const row = db
      .prepare(
        `SELECT payload_json FROM video_analysis WHERE youtube_id = ? LIMIT 1`
      )
      .get(youtubeId) as { payload_json: string } | undefined;
    if (!row) return null;
    return JSON.parse(row.payload_json) as VideoAnalysis;
  } catch {
    return null;
  }
}

/**
 * Pulse-only warm read: skip YouTube / Claude until TTL expires and cast list matches.
 */
export async function tryGetWarmPulseAnalysis(args: {
  youtubeId: string;
  pulseChannelId: string;
  castSignature: string;
  maxAgeSeconds: number;
}): Promise<VideoAnalysis | null> {
  const db = await resolveDb();
  if (!db) return null;
  try {
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

    return JSON.parse(row.payload_json) as VideoAnalysis;
  } catch {
    return null;
  }
}
