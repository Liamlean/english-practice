// language: JavaScript (ESM), file: server/routes/stats.js
// *Dashboard numbers: streak, XP, learned counts, today's progress, and the daily-goal setting.*

import { Router } from "express";
import { run, computeStats } from "../db.js";
import { requireAuth } from "../auth.js";

const router = Router();
const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

router.get(
  "/",
  requireAuth,
  ah(async (req, res) => {
    const today = DATE_RE.test(req.query.today || "") ? req.query.today : null;
    res.json({ stats: await computeStats(req.userId, today) });
  })
);

router.post(
  "/goal",
  requireAuth,
  ah(async (req, res) => {
    const goal = Math.min(Math.max(parseInt(req.body?.daily_goal, 10) || 20, 5), 200);
    await run("UPDATE stats SET daily_goal = ? WHERE user_id = ?", [goal, req.userId]);
    const today = DATE_RE.test(req.body?.localDate || "") ? req.body.localDate : null;
    res.json({ stats: await computeStats(req.userId, today) });
  })
);

export default router;
