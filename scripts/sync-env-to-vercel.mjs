#!/usr/bin/env node
/**
 * Loads .env.local and pushes vars to Vercel Production (--force replaces).
 * Run: node scripts/sync-env-to-vercel.mjs
 * Does not print secret values.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const envPath = path.join(root, ".env.local");

function parseDotEnv(txt) {
  /** @type {Record<string, string>} */
  const out = {};
  for (let line of txt.split("\n")) {
    line = line.trim();
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 1) continue;
    const k = line.slice(0, i).trim();
    let v = line.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    out[k] = v;
  }
  return out;
}

const keysNeeded = [
  "YOUTUBE_API_KEY",
  "ANTHROPIC_API_KEY",
  "YOUTUBE_CHANNEL_ID",
  "CHANNEL_CAST_NAMES",
];

if (!fs.existsSync(envPath)) {
  console.error("Missing .env.local");
  process.exit(1);
}

const env = parseDotEnv(fs.readFileSync(envPath, "utf8"));

for (const name of keysNeeded) {
  if (!(name in env)) {
    console.log(`SKIP (not set in .env.local): ${name}`);
    continue;
  }
  const value = env[name];
  try {
    execFileSync(
      "npx",
      [
        "vercel@latest",
        "env",
        "add",
        name,
        "production",
        "--yes",
        "--force",
      ],
      {
        cwd: root,
        stdio: ["pipe", "inherit", "inherit"],
        encoding: "utf8",
        input: value,
        env: process.env,
      }
    );
    console.log(`OK: ${name} → Vercel production`);
  } catch {
    console.error(`FAIL: ${name}`);
    process.exitCode = 1;
  }
}
