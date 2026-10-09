// language: JavaScript (ESM), file: server/app.js
// *Builds the Express app (no listening). Used by server/index.js locally and api/[...path].js on Vercel.*

import express from "express";
import cookieParser from "cookie-parser";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { initDb } from "./db.js";
import authRoutes from "./routes/auth.js";
import wordRoutes from "./routes/words.js";
import studyRoutes from "./routes/study.js";
import statsRoutes from "./routes/stats.js";
import adminRoutes from "./routes/admin.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());
app.use(cookieParser());

// Make sure the schema exists (memoized, cheap after the first request).
app.use(async (_req, _res, next) => {
  try {
    await initDb();
    next();
  } catch (e) {
    next(e);
  }
});

app.use("/api/auth", authRoutes);
app.use("/api", wordRoutes);
app.use("/api/study", studyRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", (_req, res) => res.status(404).json({ error: "Không tìm thấy API." }));

// Serves static files in local development. On Vercel the CDN serves public/ directly.
const publicDir = path.resolve(__dirname, "..", "public");
app.use(express.static(publicDir));
app.get("*", (_req, res) => res.sendFile(path.join(publicDir, "index.html")));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Lỗi máy chủ." });
});

export default app;
