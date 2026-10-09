// language: JavaScript (ESM), file: public/js/views/profile.js
// *Account panel: who you are, your numbers, and logout.*

import { state, setUser, setStats } from "../store.js";
import { api } from "../api.js";
import { navigate, reload } from "../router.js";
import { escapeHtml, toast } from "../ui.js";

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

      <details class="pw" id="pwBox">
        <summary>🔒 Đổi mật khẩu</summary>
        <form id="pwForm" novalidate>
          <label class="field">
            <span>Mật khẩu hiện tại</span>
            <input id="pwCur" type="password" autocomplete="current-password" />
          </label>
          <label class="field">
            <span>Mật khẩu mới</span>
            <input id="pwNew" type="password" autocomplete="new-password" placeholder="ít nhất 6 ký tự" />
          </label>
          <label class="field">
            <span>Nhập lại mật khẩu mới</span>
            <input id="pwNew2" type="password" autocomplete="new-password" />
          </label>
          <p class="error" id="pwErr"></p>
          <button class="btn btn-primary btn-block" type="submit" id="pwBtn">Cập nhật mật khẩu</button>
        </form>
      </details>

      ${u.is_admin ? `<button class="btn btn-ghost btn-block" id="admin">📊 Trang quản trị</button>` : ""}
      <button class="btn btn-danger btn-block" id="logout">Đăng xuất</button>
    </div>`;

  el.querySelector("#back").addEventListener("click", () => navigate("/dashboard"));
  const adminBtn = el.querySelector("#admin");
  if (adminBtn) adminBtn.addEventListener("click", () => navigate("/admin"));

  const pwForm = el.querySelector("#pwForm");
  const pwErr = el.querySelector("#pwErr");
  const pwBtn = el.querySelector("#pwBtn");
  pwForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    pwErr.textContent = "";
    const cur = el.querySelector("#pwCur").value;
    const nw = el.querySelector("#pwNew").value;
    const nw2 = el.querySelector("#pwNew2").value;

    if (!cur || !nw) {
      pwErr.textContent = "Nhập đầy đủ mật khẩu hiện tại và mật khẩu mới.";
      return;
    }
    if (nw.length < 6) {
      pwErr.textContent = "Mật khẩu mới phải có ít nhất 6 ký tự.";
      return;
    }
    if (nw !== nw2) {
      pwErr.textContent = "Hai mật khẩu mới không khớp nhau.";
      return;
    }

    pwBtn.disabled = true;
    pwBtn.textContent = "Đang cập nhật…";
    try {
      await api.changePassword(cur, nw);
      pwForm.reset();
      toast("Đã đổi mật khẩu ✅");
    } catch (ex) {
      pwErr.textContent = ex.message;
    } finally {
      pwBtn.disabled = false;
      pwBtn.textContent = "Cập nhật mật khẩu";
    }
  });

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
