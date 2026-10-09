#!/usr/bin/env node
// language: JavaScript (ESM), file: scripts/deploy_tasks.js
// *Runs automatically on every Vercel deploy via `npm run build` (see vercel.json).*
//
// 1) Database sync — inserts any NEW words from server/seed.js into the Turso DB
//    using INSERT OR IGNORE (additive only; existing rows and all student progress
//    are never touched). If this fails, the deploy is stopped on purpose so a stale
//    word count can never go live.
//
// 2) Audio sync — generates any missing British (en-GB) .mp3 files into
//    public/audio/en/ via scripts/gen_audio.py (incremental, never overwrites).
//    If this fails we still deploy: the app falls back to its built-in TTS voice.

import { execFile } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execFile);

async function findPython() {
  for (const candidate of ["python3", "python"]) {
    try {
      await exec(candidate, ["--version"]);
      return candidate;
    } catch {
      // keep looking
    }
  }
  return null;
}

async function main() {
  console.log("[build] deploy_tasks — bắt đầu đồng bộ...");

  // ---- 1. Database: sync any new words ----
  try {
    const { seedIfEmpty } = await import("../server/seed.js");
    await seedIfEmpty(false);
    console.log("[build] DB sync OK.");
  } catch (err) {
    console.error("[build] DB SYNC FAILED:", err?.message ?? err);
    process.exit(1); // block the deploy — the DB would disagree with the code
  }

  // ---- 2. Audio: generate any missing British .mp3 files ----
  const python = await findPython();
  if (!python) {
    console.warn("[build] audio SKIPPED — no python3/python in the build image (TTS fallback will be used).");
    return;
  }
  try {
    const { stdout, stderr } = await exec(python, ["scripts/gen_audio.py"], {
      cwd: process.cwd(),
      timeout: 180_000,
    });
    if (stdout) console.log(stdout);
    if (stderr) console.warn("[build] (audio stderr)", stderr.trim());
    console.log("[build] audio OK.");
  } catch (err) {
    console.warn("[build] audio gen FAILED (TTS fallback will be used):", err?.message ?? err);
  }
}

main().catch((e) => {
  console.error("[build] unexpected error:", e);
  process.exit(1);
});