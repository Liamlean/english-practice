// language: JavaScript (ESM), file: public/js/app.js
// *Boots the SPA: theme, session check, hash router, and the auth guard.*

import { api } from "./api.js";
import { state, setUser, setStats, setMeta } from "./store.js";
import { setReload } from "./router.js";
import { initTheme, renderTopbar } from "./ui.js";
import { preloadAudio } from "./audio.js";
import { renderAuth } from "./views/auth.js";
import { renderDashboard } from "./views/dashboard.js";
import { renderStudy } from "./views/study.js";
import { renderProfile } from "./views/profile.js";
import { renderAdmin } from "./views/admin.js";

const viewEl = () => document.getElementById("view");

function render() {
  renderTopbar();

  // Not signed in -> always the auth screen.
  if (!state.user) {
    renderAuth(viewEl());
    return;
  }

  const hash = location.hash.replace(/^#/, "");
  const [seg, sub] = hash.split("/").filter(Boolean);

  switch (seg) {
    case "study":
      return renderStudy(viewEl(), { mode: sub || "flash" });
    case "profile":
      return renderProfile(viewEl());
    case "admin":
      return renderAdmin(viewEl());
    default:
      return renderDashboard(viewEl());
  }
}

setReload(render);
window.addEventListener("hashchange", render);

(async function boot() {
  initTheme();
  preloadAudio();
  try {
    const { user, stats } = await api.me();
    setUser(user);
    setStats(stats);
  } catch {
    setUser(null);
  }
  try {
    setMeta(await api.meta());
  } catch {}
  render();
})();
