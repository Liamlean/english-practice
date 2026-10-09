// language: JavaScript (ESM), file: server/routes/study.js
// *Records one answer: logs the review, updates the word's state, awards XP, advances the streak.*

import { Router } from "express";
import { get, run, addXp, touchStreak, computeStats } from "../db.js";
import { requireAuth } from "../auth.js";

const router = Router();
const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

router.post(
  "/review",
  requireAuth,
  ah(async (req, res) => {
    const { wordId, correct, localDate } = req.body || {};

    const wid = parseInt(wordId, 10);
    const ok = correct ? 1 : 0;
    const date = DATE_RE.test(localDate || "") ? localDate : new Date().toISOString().slice(0, 10);

    const word = await get("SELECT id FROM words WHERE id = ?", [wid]);
    if (!word) return res.status(404).json({ error: "Không tìm thấy từ này." });

    await run("INSERT INTO reviews (user_id, word_id, correct, local_date) VALUES (?, ?, ?, ?)", [
      req.userId,
      wid,
      ok,
      date,
    ]);

    const prev = await get("SELECT * FROM word_state WHERE user_id = ? AND word_id = ?", [req.userId, wid]);

    const timesSeen = Number(prev?.times_seen || 0) + 1;
    const timesCorrect = Number(prev?.times_correct || 0) + ok;

    // Known after two correct answers; any miss drops it back to learning.
    const status = ok ? (timesCorrect >= 2 ? "known" : "learning") : "learning";

    await run(
      `INSERT INTO word_state (user_id, word_id, status, times_seen, times_correct, last_reviewed_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(user_id, word_id) DO UPDATE SET
         status = excluded.status,
         times_seen = excluded.times_seen,
         times_correct = excluded.times_correct,
         last_reviewed_at = excluded.last_reviewed_at`,
      [req.userId, wid, status, timesSeen, timesCorrect]
    );

    await addXp(req.userId, ok ? 10 : 2);
    await touchStreak(req.userId, date);

    res.json({ word_id: wid, status, stats: await computeStats(req.userId, date) });
  })
);

export default router;
