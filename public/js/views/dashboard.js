// language: JavaScript (ESM), file: public/js/views/dashboard.js
// *Home screen: streak hero, today's goal ring, level (difficulty) picker, and the two study modes.*

import { state, setStats, setMeta, setLevel } from "../store.js";
import { api } from "../api.js";
import { navigate } from "../router.js";
import { toast, escapeHtml } from "../ui.js";

export async function renderDashboard(el) {
  const s = state.stats || {};

  // Pull the freshest numbers (today's progress) and metadata.
  try {
    setStats((await api.stats()).stats);
  } catch {}
  if (!state.meta) {
    try {
      setMeta(await api.meta());
    } catch {}
  }
  const stats = state.stats || {};
  const meta = state.meta || { levels: [], total: 0 };

  const goal = stats.daily_goal || 20;
  const today = stats.today_count || 0;
  const pct = Math.min(100, Math.round((today / goal) * 100));
  const done = today >= goal;

  const chips = [
    `<button class="chip ${state.level === "all" ? "active" : ""}" data-level="all">Tất cả <small>${meta.total}</small></button>`,
    ...meta.levels
      .filter((l) => l.count > 0)
      .map(
        (l) =>
          `<button class="chip ${
            state.level === l.level ? "active" : ""
          }" data-level="${l.level}">${l.level} <small>${l.count}</small></button>`
      ),
  ].join("");

  el.innerHTML = `
    <h1 class="hello">Xin chào, ${escapeHtml(state.user?.username || "")} 👋</h1>
    <p class="hello-sub">Học một chút mỗi ngày, đừng để chuỗi 🔥 tắt nhé.</p>

    <div class="hero">
      <div class="flame">🔥</div>
      <div>
        <div class="flame-n">${stats.current_streak || 0}</div>
        <div class="flame-l">ngày liên tiếp · kỷ lục ${stats.longest_streak || 0}</div>
      </div>
    </div>

    <div class="stat-grid">
      <div class="stat-card"><b>${stats.xp || 0}</b><span>Điểm XP</span></div>
      <div class="stat-card"><b>${stats.learned || 0}</b><span>Đã thuộc</span></div>
      <div class="stat-card"><b>${stats.learning || 0}</b><span>Đang học</span></div>
    </div>

    <div class="goal-card">
      <div class="ring" style="--p:${pct}">
        <div>${today}<small>/ ${goal}</small></div>
      </div>
      <div class="goal-info">
        <h3>${done ? "Đạt mục tiêu hôm nay 🎉" : "Mục tiêu hôm nay"}</h3>
        <p>${done ? "Xuất sắc! Học thêm cũng không sao." : `Còn ${Math.max(0, goal - today)} thẻ nữa để hoàn thành.`}</p>
        <div class="goal-preset" id="goalPreset">
          ${[10, 20, 30, 50].map((g) => `<button data-goal="${g}" class="${g === goal ? "active" : ""}">${g} thẻ</button>`).join("")}
        </div>
      </div>
    </div>

    <div class="section-title">🎚️ Cấp độ (độ khó)</div>
    <div class="chips" id="levelChips">${chips}</div>

    <div class="section-title">Bắt đầu học</div>
    <div class="action-grid">
      <button class="action" id="goFlash">
        <span class="ic">🃏</span>
        <b>Thẻ ghi nhớ</b>
        <span>Anh → Việt, lật thẻ để nhớ nghĩa</span>
      </button>
      <button class="action" id="goQuiz">
        <span class="ic">🎯</span>
        <b>Đoán từ</b>
        <span>Việt → Anh, chọn đáp án đúng</span>
      </button>
    </div>
  `;

  el.querySelector("#goFlash").addEventListener("click", () => navigate("/study/flash"));
  el.querySelector("#goQuiz").addEventListener("click", () => navigate("/study/quiz"));

  el.querySelector("#levelChips").addEventListener("click", (e) => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    setLevel(btn.dataset.level);
    renderDashboard(el);
  });

  const preset = el.querySelector("#goalPreset");
  if (preset) {
    preset.addEventListener("click", async (e) => {
      const btn = e.target.closest("button[data-goal]");
      if (!btn) return;
      try {
        setStats((await api.setGoal(Number(btn.dataset.goal))).stats);
        toast("Đã cập nhật mục tiêu");
        renderDashboard(el);
      } catch (ex) {
        toast(ex.message);
      }
    });
  }
}
