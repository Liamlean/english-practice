// language: JavaScript (ESM), file: server/routes/auth.js
// *Register / login / logout / who-am-I. Username + password only, no email.*

import { Router } from "express";
import { ensureStats, computeStats, get, run, isAdminUser } from "../db.js";
import {
  hashPassword,
  verifyPassword,
  signSession,
  setAuthCookie,
  clearAuthCookie,
  requireAuth,
} from "../auth.js";

const router = Router();
const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;
const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.post(
  "/register",
  ah(async (req, res) => {
    const { username, password } = req.body || {};

    if (!USERNAME_RE.test(username || "")) {
      return res.status(400).json({ error: "Tên đăng nhập 3–20 ký tự, chỉ gồm chữ, số và dấu gạch dưới." });
    }
    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ error: "Mật khẩu phải có ít nhất 6 ký tự." });
    }

    const exists = await get("SELECT id FROM users WHERE username = ?", [username]);
    if (exists) return res.status(409).json({ error: "Tên đăng nhập đã tồn tại." });

    const info = await run("INSERT INTO users (username, password_hash) VALUES (?, ?)", [
      username,
      hashPassword(password),
    ]);
    const id = info.lastInsertRowid;

    await ensureStats(id);
    const is_admin = await isAdminUser(id, username);
    setAuthCookie(res, signSession(id));
    res.json({ user: { id, username, is_admin }, stats: await computeStats(id) });
  })
);

router.post(
  "/login",
  ah(async (req, res) => {
    const { username, password } = req.body || {};
    const row = await get("SELECT * FROM users WHERE username = ?", [username || ""]);

    if (!row || !verifyPassword(String(password || ""), row.password_hash)) {
      return res.status(401).json({ error: "Tên đăng nhập hoặc mật khẩu không đúng." });
    }

    await ensureStats(row.id);
    const is_admin = await isAdminUser(row.id, row.username);
    setAuthCookie(res, signSession(row.id));
    res.json({ user: { id: row.id, username: row.username, is_admin }, stats: await computeStats(row.id) });
  })
);

router.post("/logout", (_req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

router.get(
  "/me",
  requireAuth,
  ah(async (req, res) => {
    const row = await get("SELECT id, username FROM users WHERE id = ?", [req.userId]);
    if (!row) {
      clearAuthCookie(res);
      return res.status(401).json({ error: "Chưa đăng nhập." });
    }
    const is_admin = await isAdminUser(row.id, row.username);
    res.json({ user: { id: row.id, username: row.username, is_admin }, stats: await computeStats(row.id) });
  })
);

// Change password for the logged-in user. No email needed: proving you know the
// current password is enough to replace it.
router.post(
  "/change-password",
  requireAuth,
  ah(async (req, res) => {
    const { current_password, new_password } = req.body || {};

    if (typeof new_password !== "string" || new_password.length < 6) {
      return res.status(400).json({ error: "Mật khẩu mới phải có ít nhất 6 ký tự." });
    }
    if (current_password === new_password) {
      return res.status(400).json({ error: "Mật khẩu mới phải khác mật khẩu hiện tại." });
    }

    const row = await get("SELECT * FROM users WHERE id = ?", [req.userId]);
    if (!row) {
      clearAuthCookie(res);
      return res.status(401).json({ error: "Chưa đăng nhập." });
    }
    if (!verifyPassword(String(current_password || ""), row.password_hash)) {
      return res.status(400).json({ error: "Mật khẩu hiện tại không đúng." });
    }

    await run("UPDATE users SET password_hash = ? WHERE id = ?", [hashPassword(new_password), req.userId]);
    // Refresh the session cookie so the 30-day window restarts.
    setAuthCookie(res, signSession(req.userId));
    res.json({ ok: true });
  })
);

export default router;
