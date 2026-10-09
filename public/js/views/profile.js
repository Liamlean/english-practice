// language: JavaScript (ESM), file: public/js/views/profile.js
// *Account panel: who you are, your numbers, and logout.*

import { state, setUser, setStats } from "../store.js";
import { api } from "../api.js";
import { navigate, reload } from "../router.js";
import { escapeHtml } from "../ui.js";

export function renderProfile(el) {
  const s = state.stats || {};
  const u = state.user || {};

  el.innerHTML = `
    <div class="study-head">
      <button class="back" id="back">‹ Trang chủ</button>
      <span class="study-title">👤 Tài khoản</span>
      <span></span>
    </div>

    <div class="panel">
      <h2>${escapeHtml(u.username || "")}</h2>
      <p class="sub">Tài khoản cục bộ trên máy này.</p>

      <div class="kv"><span>Chuỗi hiện tại</span><b>🔥 ${s.current_streak || 0} ngày</b></div>
      <div class="kv"><span>Chuỗi dài nhất</span><b>🏅 ${s.longest_streak || 0} ngày</b></div>
      <div class="kv"><span>Tổng điểm XP</span><b>${s.xp || 0}</b></div>
      <div class="kv"><span>Từ đã thuộc</span><b>${s.learned || 0} / ${s.total_words || 0}</b></div>
      <div class="kv" style="border-bottom:0"><span>Mục tiêu mỗi ngày</span><b>${s.daily_goal || 20} thẻ</b></div>

      ${u.is_admin ? `<button class="btn btn-ghost btn-block" id="admin">📊 Trang quản trị</button>` : ""}
      <button class="btn btn-danger btn-block" id="logout">Đăng xuất</button>
    </div>`;

  el.querySelector("#back").addEventListener("click", () => navigate("/dashboard"));
  const adminBtn = el.querySelector("#admin");
  if (adminBtn) adminBtn.addEventListener("click", () => navigate("/admin"));
  el.querySelector("#logout").addEventListener("click", async () => {
    try {
      await api.logout();
    } catch {}
    setUser(null);
    setStats(null);
    navigate("/");
    reload();
  });
}
