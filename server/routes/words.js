// language: JavaScript (ESM), file: server/routes/words.js
// *Vocabulary endpoints: the study deck (smart-ordered) and app metadata (levels, categories).*

import { Router } from "express";
import { all, get } from "../db.js";
import { requireAuth } from "../auth.js";

const router = Router();
const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

// GET /api/deck?level=A1&size=20
// Learning words first, then new, then known (light review). Random within each bucket.
router.get(
  "/deck",
  requireAuth,
  ah(async (req, res) => {
    const level = String(req.query.level || "all").toUpperCase();
    const size = Math.min(Math.max(parseInt(req.query.size, 10) || 20, 1), 100);

    const base = `
      SELECT w.id, w.en, w.vi, w.ipa, w.emoji, w.example_en, w.example_vi, w.level, w.category,
             COALESCE(s.status, 'new') AS status,
             COALESCE(s.times_seen, 0) AS times_seen,
             COALESCE(s.times_correct, 0) AS times_correct
      FROM words w
      LEFT JOIN word_state s ON s.word_id = w.id AND s.user_id = ?
    `;

    const rows =
      level === "ALL" || !LEVELS.includes(level)
        ? await all(base, [req.userId])
        : await all(base + " WHERE w.level = ?", [req.userId, level]);

    const priority = { learning: 0, new: 1, known: 2 };
    for (const r of rows) r._r = Math.random();
    rows.sort((a, b) => priority[a.status] - priority[b.status] || a._r - b._r);

    const deck = rows.slice(0, size).map(({ _r, ...w }) => w);
    res.json({ deck });
  })
);

// GET /api/meta -> levels with word counts, for the difficulty chips
router.get(
  "/meta",
  ah(async (_req, res) => {
    const counts = await all("SELECT level, COUNT(*) AS c FROM words GROUP BY level");
    const byLevel = Object.fromEntries(counts.map((r) => [r.level, Number(r.c)]));
    const total = Number((await get("SELECT COUNT(*) AS c FROM words")).c);
    res.json({
      levels: LEVELS.map((l) => ({ level: l, count: byLevel[l] || 0 })),
      total,
    });
  })
);

export default router;
