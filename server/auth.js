// language: JavaScript (ESM), file: server/auth.js
// *Password hashing (bcrypt), JWT session tokens in an httpOnly cookie, and the route guards.*

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const SESSION_DAYS = Number(process.env.SESSION_DAYS || 30);
const COOKIE = "ep_token";

if (!process.env.JWT_SECRET) {
  console.warn("[auth] JWT_SECRET not set — using an insecure dev secret. Set it in .env before deploying.");
}

export function hashPassword(pw) {
  return bcrypt.hashSync(pw, 10);
}

export function verifyPassword(pw, hash) {
  return bcrypt.compareSync(pw, hash);
}

export function signSession(userId) {
  return jwt.sign({ uid: userId }, SECRET, { expiresIn: `${SESSION_DAYS}d` });
}

export function readSession(token) {
  try {
    const payload = jwt.verify(token, SECRET);
    return payload.uid;
  } catch {
    return null;
  }
}

export function setAuthCookie(res, token) {
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(COOKIE);
}

// 401 if there is no valid session
export function requireAuth(req, res, next) {
  const uid = readSession(req.cookies?.[COOKIE]);
  if (!uid) return res.status(401).json({ error: "Chưa đăng nhập." });
  req.userId = uid;
  next();
}

// Attaches req.userId if a session exists, otherwise continues anonymously
export function maybeAuth(req, _res, next) {
  req.userId = readSession(req.cookies?.[COOKIE]) || null;
  next();
}
