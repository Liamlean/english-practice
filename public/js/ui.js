// language: JavaScript (ESM), file: public/js/ui.js
// *Theme handling, the top bar, and the toast — shared chrome across every view.*

import { state, setUser, setStats } from "./store.js";
import { api } from "./api.js";
import { navigate, reload } from "./router.js";

/* ---------------------------- theme ---------------------------- */

export function applyTheme(t) {
  document.documentElement.dataset.theme = t;
  const btn = document.getElementById("themeBtn");
  if (btn) btn.textContent = t === "dark" ? "☀️" : "🌙";
  try {
    localStorage.setItem("ep_theme", t);
  } catch {}
}

export function toggleTheme() {
  applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
}

export function initTheme() {
  let t = null;
  try {
    t = localStorage.getItem("ep_theme");
  } catch {}
  if (!t) t = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  applyTheme(t);
}

/* ---------------------------- topbar ---------------------------- */

export function renderTopbar() {
  const bar = document.getElementById("topbar");
  if (!state.user) {
    bar.hidden = true;
    bar.innerHTML = "";
    return;
  }
  bar.hidden = false;
  const s = state.stats || {};
  bar.innerHTML = `
    <div class="topbar">
      <a class="brand" href="#/dashboard"><span class="flag">🇬🇧</span><span>Học Tiếng Anh</span></a>
      <div class="top-actions">
        <div class="streak-pill" title="Chuỗi ngày học liên tiếp">🔥 <b id="topStreak">${s.current_streak || 0}</b></div>
        <button class="icon-btn" id="themeBtn" title="Sáng / Tối">🌙</button>
        <div class="user-chip">
          <span>${escapeHtml(state.user.username)}</span>
          <button class="icon-btn small" id="logoutBtn" title="Đăng xuất">⎋</button>
        </div>
      </div>
    </div>`;

  document.getElementById("themeBtn").textContent =
    document.documentElement.dataset.theme === "dark" ? "☀️" : "🌙";
  document.getElementById("themeBtn").addEventListener("click", toggleTheme);
  document.getElementById("logoutBtn").addEventListener("click", async () => {
    try {
      await api.logout();
    } catch {}
    setUser(null);
    setStats(null);
    navigate("/");
    reload();
  });
}

/* ---------------------------- toast ---------------------------- */

let toastTimer = null;
export function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 1800);
}

export function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}
