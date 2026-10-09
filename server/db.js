// language: JavaScript (ESM), file: server/db.js
// *Database layer over libSQL (Turso in the cloud, a local file in development).*
// *Same SQL as before — only the driver changed from better-sqlite3 to @libsql/client (async).*

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";

// In production, set TURSO_DATABASE_URL=libsql://... and TURSO_AUTH_TOKEN.
// With neither set, it falls back to a local file so `npm run dev` works offline.
const url = process.env.TURSO_DATABASE_URL || "file:data/app.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

if (url.startsWith("file:")) {
  const filePath = url.slice("file:".length);
  fs.mkdirSync(path.dirname(path.resolve(filePath)), { recursive: true });
}

export const client = createClient(authToken ? { url, authToken } : { url });

/* --------------------------- query helpers --------------------------- */

export async function run(sql, args = []) {
  const r = await client.execute({ sql, args });
  return {
    rowsAffected: Number(r.rowsAffected || 0),
    lastInsertRowid: r.lastInsertRowid != null ? Number(r.lastInsertRowid) : null,
  };
}

export async function get(sql, args = []) {
  const r = await client.execute({ sql, args });
  return r.rows[0] ?? null;
}

export async function all(sql, args = []) {
  const r = await client.execute({ sql, args });
  return r.rows;
}

/* ------------------------------ schema ------------------------------ */

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (
     id            INTEGER PRIMARY KEY AUTOINCREMENT,
     username      TEXT NOT NULL UNIQUE COLLATE NOCASE,
     password_hash TEXT NOT NULL,
     created_at    TEXT NOT NULL DEFAULT (datetime('now'))
   )`,
  `CREATE TABLE IF NOT EXISTS words (
     id         INTEGER PRIMARY KEY AUTOINCREMENT,
     en         TEXT NOT NULL UNIQUE,
     vi         TEXT NOT NULL,
     ipa        TEXT,
     emoji      TEXT,
     example_en TEXT,
     example_vi TEXT,
     level      TEXT NOT NULL DEFAULT 'A1',
     category   TEXT NOT NULL DEFAULT 'Chung'
   )`,
  `CREATE TABLE IF NOT EXISTS word_state (
     user_id          INTEGER NOT NULL,
     word_id          INTEGER NOT NULL,
     status           TEXT NOT NULL DEFAULT 'new',
     times_seen       INTEGER NOT NULL DEFAULT 0,
     times_correct    INTEGER NOT NULL DEFAULT 0,
     last_reviewed_at TEXT,
     PRIMARY KEY (user_id, word_id)
   )`,
  `CREATE TABLE IF NOT EXISTS reviews (
     id         INTEGER PRIMARY KEY AUTOINCREMENT,
     user_id    INTEGER NOT NULL,
     word_id    INTEGER NOT NULL,
     correct    INTEGER NOT NULL,
     local_date TEXT NOT NULL,
     created_at TEXT NOT NULL DEFAULT (datetime('now'))
   )`,
  `CREATE INDEX IF NOT EXISTS idx_reviews_user_date ON reviews(user_id, local_date)`,
  `CREATE TABLE IF NOT EXISTS stats (
     user_id          INTEGER PRIMARY KEY,
     current_streak   INTEGER NOT NULL DEFAULT 0,
     longest_streak   INTEGER NOT NULL DEFAULT 0,
     last_active_date TEXT,
     xp               INTEGER NOT NULL DEFAULT 0,
     daily_goal       INTEGER NOT NULL DEFAULT 20
   )`,
];

// Runs once per warm instance; safe to call on every request.
let migrated = null;
export function initDb() {
  if (!migrated) {
    migrated = (async () => {
      for (const stmt of SCHEMA) await client.execute(stmt);
    })().catch((e) => {
      migrated = null;
      throw e;
    });
  }
  return migrated;
}

/* ------------------------- date + stats ------------------------- */

export function addDays(dateStr, delta) {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

export async function ensureStats(userId) {
  await run("INSERT OR IGNORE INTO stats (user_id) VALUES (?)", [userId]);
}

// Admin = a username listed in ADMIN_USERS, or (if that is empty) the first account.
export async function isAdminUser(userId, username) {
  const list = (process.env.ADMIN_USERS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (list.length) return list.includes(String(username || "").toLowerCase());

  const row = await get("SELECT MIN(id) AS first_id FROM users");
  return !!row && Number(row.first_id) === Number(userId);
}

const num = (v) => Number(v) || 0;

export async function computeStats(userId, today = null) {
  await ensureStats(userId);
  const s = await get("SELECT * FROM stats WHERE user_id = ?", [userId]);

  const totalWords = num((await get("SELECT COUNT(*) AS c FROM words")).c);
  const learned = num(
    (await get("SELECT COUNT(*) AS c FROM word_state WHERE user_id = ? AND status = 'known'", [userId])).c
  );
  const learning = num(
    (await get("SELECT COUNT(*) AS c FROM word_state WHERE user_id = ? AND status = 'learning'", [userId])).c
  );
  const todayCount = today
    ? num(
        (await get("SELECT COUNT(*) AS c FROM reviews WHERE user_id = ? AND local_date = ?", [userId, today])).c
      )
    : 0;

  return {
    current_streak: num(s.current_streak),
    longest_streak: num(s.longest_streak),
    last_active_date: s.last_active_date ?? null,
    xp: num(s.xp),
    daily_goal: num(s.daily_goal) || 20,
    today_count: todayCount,
    learned,
    learning,
    total_words: totalWords,
  };
}

// Same day -> no change. Yesterday -> +1. Anything else -> reset to 1.
export async function touchStreak(userId, localDate) {
  await ensureStats(userId);
  const s = await get("SELECT * FROM stats WHERE user_id = ?", [userId]);
  if (s.last_active_date === localDate) return;

  const yesterday = addDays(localDate, -1);
  const streak = s.last_active_date === yesterday ? num(s.current_streak) + 1 : 1;
  const longest = Math.max(streak, num(s.longest_streak));

  await run(
    "UPDATE stats SET current_streak = ?, longest_streak = ?, last_active_date = ? WHERE user_id = ?",
    [streak, longest, localDate, userId]
  );
}

export async function addXp(userId, amount) {
  await run("UPDATE stats SET xp = xp + ? WHERE user_id = ?", [amount, userId]);
}
