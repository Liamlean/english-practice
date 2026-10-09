// language: JavaScript (ESM), file: server/routes/admin.js
// *Aggregate usage numbers for the admin page. Admins only — everything comes from our own DB.*

import { Router } from "express";
import { all, get, addDays, isAdminUser } from "../db.js";
import { requireAuth } from "../auth.js";

const router = Router();
const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const num = (v) => Number(v) || 0;

router.get(
  "/stats",
  requireAuth,
  ah(async (req, res) => {
    const me = await get("SELECT id, username FROM users WHERE id = ?", [req.userId]);
    if (!me || !(await isAdminUser(me.id, me.username))) {
      return res.status(403).json({ error: "Chỉ quản trị viên mới xem được." });
    }

    const today = DATE_RE.test(req.query.today || "")
      ? req.query.today
      : new Date().toISOString().slice(0, 10);
    const weekAgo = addDays(today, -6);
    const count = async (sql, args = []) => num((await get(sql, args))?.c);

    const totals = {
      users: await count("SELECT COUNT(*) AS c FROM users"),
      new_today: await count("SELECT COUNT(*) AS c FROM users WHERE substr(created_at, 1, 10) = ?", [today]),
      active_today: await count("SELECT COUNT(DISTINCT user_id) AS c FROM reviews WHERE local_date = ?", [today]),
      reviews_today: await count("SELECT COUNT(*) AS c FROM reviews WHERE local_date = ?", [today]),
      reviews_total: await count("SELECT COUNT(*) AS c FROM reviews"),
      learned_total: await count("SELECT COUNT(*) AS c FROM word_state WHERE status = 'known'"),
      words: await count("SELECT COUNT(*) AS c FROM words"),
    };

    const rows = await all(
      `SELECT substr(created_at, 1, 10) AS day, COUNT(*) AS count
       FROM users WHERE substr(created_at, 1, 10) >= ?
       GROUP BY day ORDER BY day`,
      [weekAgo]
    );
    const byDate = Object.fromEntries(rows.map((r) => [r.day, num(r.count)]));
    const signups_7d = [];
    for (let i = 6; i >= 0; i--) {
      const d = addDays(today, -i);
      signups_7d.push({ date: d, count: byDate[d] || 0 });
    }

    const top = await all(
      `SELECT u.username, s.current_streak, s.longest_streak, s.xp,
              (SELECT COUNT(*) FROM word_state ws WHERE ws.user_id = u.id AND ws.status = 'known') AS learned
       FROM stats s JOIN users u ON u.id = s.user_id
       ORDER BY s.xp DESC, u.id ASC
       LIMIT 10`
    );

    res.json({
      today,
      totals,
      signups_7d,
      top: top.map((r) => ({
        username: r.username,
        current_streak: num(r.current_streak),
        longest_streak: num(r.longest_streak),
        xp: num(r.xp),
        learned: num(r.learned),
      })),
    });
  })
);

export default router;
