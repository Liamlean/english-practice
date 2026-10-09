// language: JavaScript (ESM), file: public/js/views/admin.js
// *Admin panel: real usage numbers straight from our own database (admins only).*

import { state } from "../store.js";
import { api } from "../api.js";
import { navigate } from "../router.js";
import { escapeHtml } from "../ui.js";

export async function renderAdmin(el) {
  if (!state.user?.is_admin) {
    el.innerHTML = `
      <div class="study-head">
        <button class="back" id="back">‹ Trang chủ</button>
        <span class="study-title">📊 Quản trị</span>
        <span></span>
      </div>
      <div class="panel">
        <h2>Không có quyền truy cập</h2>
        <p class="sub">Trang này chỉ dành cho quản trị viên.</p>
      </div>`;
    el.querySelector("#back").addEventListener("click", () => navigate("/dashboard"));
    return;
  }

  el.innerHTML = `<div class="loading">Đang tải số liệu…</div>`;

  let data;
  try {
    data = await api.adminStats();
  } catch (e) {
    el.innerHTML = header() + `<div class="panel"><p class="error">${escapeHtml(e.message)}</p></div>`;
    bind(el);
    return;
  }

  const t = data.totals || {};
  const days = data.signups_7d || [];
  const max = Math.max(1, ...days.map((d) => d.count));

  el.innerHTML = `
    ${header()}

    <div class="stat-grid">
      <div class="stat-card"><b>${t.users || 0}</b><span>Tổng người dùng</span></div>
      <div class="stat-card"><b>${t.new_today || 0}</b><span>Mới hôm nay</span></div>
      <div class="stat-card"><b>${t.active_today || 0}</b><span>Hoạt động hôm nay</span></div>
      <div class="stat-card"><b>${t.reviews_today || 0}</b><span>Lượt học hôm nay</span></div>
      <div class="stat-card"><b>${t.reviews_total || 0}</b><span>Tổng lượt học</span></div>
      <div class="stat-card"><b>${t.learned_total || 0}</b><span>Từ đã thuộc (tất cả)</span></div>
    </div>

    <div class="section-title">📈 Đăng ký 7 ngày qua</div>
    <div class="panel">
      <div class="mini-bars">
        ${days
          .map(
            (d) =>
              `<div class="bar" style="height:${Math.round((d.count / max) * 100)}%" title="${d.date}: ${d.count}"></div>`
          )
          .join("")}
      </div>
      <div class="mini-bars-labels">
        ${days.map((d) => `<span>${d.date.slice(5)}</span>`).join("")}
      </div>
    </div>

    <div class="section-title">🏆 Bảng xếp hạng (theo XP)</div>
    <div class="panel">
      <table class="admin-table">
        <thead>
          <tr><th>#</th><th>Người dùng</th><th>🔥</th><th>🏅</th><th>XP</th><th>Thuộc</th></tr>
        </thead>
        <tbody>
          ${
            (data.top || [])
              .map(
                (u, i) => `
            <tr>
              <td><span class="rank">${i + 1}</span></td>
              <td>${escapeHtml(u.username)}</td>
              <td>${u.current_streak || 0}</td>
              <td>${u.longest_streak || 0}</td>
              <td>${u.xp || 0}</td>
              <td>${u.learned || 0}</td>
            </tr>`
              )
              .join("") || `<tr><td colspan="6" style="color:var(--muted)">Chưa có dữ liệu</td></tr>`
          }
        </tbody>
      </table>
    </div>`;

  bind(el);
}

function header() {
  return `
    <div class="study-head">
      <button class="back" id="back">‹ Trang chủ</button>
      <span class="study-title">📊 Quản trị</span>
      <span></span>
    </div>`;
}

function bind(el) {
  const back = el.querySelector("#back");
  if (back) back.addEventListener("click", () => navigate("/dashboard"));
}
