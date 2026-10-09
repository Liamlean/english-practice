// language: JavaScript (ESM), file: public/js/views/auth.js
// *Login / register screen. Username + password only.*

import { api } from "../api.js";
import { setUser, setStats } from "../store.js";
import { reload } from "../router.js";
import { toast } from "../ui.js";

export function renderAuth(el) {
  let mode = "login";

  el.innerHTML = `
    <div class="auth-wrap">
      <div class="auth-card">
        <div class="auth-logo">📚</div>
        <h1 class="auth-title">Học Tiếng Anh</h1>
        <p class="auth-sub">Luyện từ vựng mỗi ngày — giữ chuỗi 🔥 không đứt.</p>

        <div class="seg" id="seg">
          <button data-m="login" class="active" type="button">Đăng nhập</button>
          <button data-m="register" type="button">Đăng ký</button>
        </div>

        <form id="authForm" novalidate>
          <label class="field">
            <span>Tên đăng nhập</span>
            <input id="u" autocomplete="username" placeholder="ví dụ: minh123" maxlength="20" />
          </label>
          <label class="field">
            <span>Mật khẩu</span>
            <input id="p" type="password" autocomplete="current-password" placeholder="ít nhất 6 ký tự" />
          </label>
          <button class="btn btn-primary btn-block" type="submit" id="submitBtn">Đăng nhập</button>
        </form>

        <p class="error" id="authErr"></p>
      </div>
    </div>`;

  const seg = el.querySelector("#seg");
  const form = el.querySelector("#authForm");
  const u = el.querySelector("#u");
  const p = el.querySelector("#p");
  const err = el.querySelector("#authErr");
  const submitBtn = el.querySelector("#submitBtn");

  function setMode(next) {
    mode = next;
    seg.querySelectorAll("button").forEach((b) => b.classList.toggle("active", b.dataset.m === next));
    submitBtn.textContent = next === "login" ? "Đăng nhập" : "Tạo tài khoản";
    p.setAttribute("autocomplete", next === "login" ? "current-password" : "new-password");
    err.textContent = "";
  }
  seg.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => setMode(b.dataset.m)));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    err.textContent = "";
    const username = u.value.trim();
    const password = p.value;

    if (!username || !password) {
      err.textContent = "Nhập đầy đủ tên đăng nhập và mật khẩu.";
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Đang xử lý…";
    try {
      const fn = mode === "login" ? api.login : api.register;
      const { user, stats } = await fn(username, password);
      setUser(user);
      setStats(stats);
      toast(mode === "login" ? `Chào mừng trở lại, ${user.username}!` : "Tạo tài khoản thành công 🎉");
      reload();
    } catch (ex) {
      err.textContent = ex.message;
      submitBtn.disabled = false;
      submitBtn.textContent = mode === "login" ? "Đăng nhập" : "Tạo tài khoản";
    }
  });
}
