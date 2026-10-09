// language: JavaScript (ESM), file: server/index.js
// *Local entry point: init the DB, seed if empty, then listen. Vercel does NOT use this file.*

import "dotenv/config";
import app from "./app.js";
import { initDb } from "./db.js";
import { seedIfEmpty } from "./seed.js";

await initDb();
await seedIfEmpty();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n  Học Tiếng Anh đang chạy → http://localhost:${PORT}\n`);
});
