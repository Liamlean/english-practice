// language: JavaScript (ESM), file: public/js/views/study.js
// *The study engine. One deck feeds two modes: flashcards (Anh→Việt) and quiz (Việt→Anh).*

import { state, setStats } from "../store.js";
import { api } from "../api.js";
import { navigate, reload } from "../router.js";
import { renderTopbar, toast, escapeHtml } from "../ui.js";
import { playWord } from "../audio.js";

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function renderStudy(el, { mode }) {
  const isQuiz = mode === "quiz";
  el.innerHTML = `<div class="loading">Đang tải…</div>`;

  let deck;
  try {
    ({ deck } = await api.deck(state.level));
  } catch (e) {
    el.innerHTML = `<div class="panel">${escapeHtml(e.message)}</div>`;
    return;
  }

  if (!deck || !deck.length) {
    el.innerHTML = `<div class="panel">Chưa có từ vựng cho cấp độ này. Hãy chọn cấp độ khác ở trang chủ.</div>`;
    return;
  }

  if (isQuiz) runQuiz(el, deck);
  else runFlash(el, deck);
}

/* ------------------------------ result ------------------------------ */

function resultView(el, { icon, title, sub }) {
  const s = state.stats || {};
  el.innerHTML = `
    <div class="result">
      <div class="big">${icon}</div>
      <h2>${title}</h2>
      <p>${sub}</p>
      <div class="stat-grid" style="margin-bottom:18px">
        <div class="stat-card"><b>${s.current_streak || 0}</b><span>Chuỗi 🔥</span></div>
        <div class="stat-card"><b>${s.xp || 0}</b><span>XP</span></div>
        <div class="stat-card"><b>${s.learned || 0}</b><span>Đã thuộc</span></div>
      </div>
      <div class="row">
        <button class="btn btn-primary" id="againBtn">Học tiếp →</button>
        <button class="btn btn-ghost" id="homeBtn">Trang chủ</button>
      </div>
    </div>`;
  el.querySelector("#againBtn").addEventListener("click", () => reload());
  el.querySelector("#homeBtn").addEventListener("click", () => navigate("/dashboard"));
}

/* ---------------------------- flashcards ---------------------------- */

function runFlash(el, deck) {
  let i = 0;
  const total = deck.length;
  let known = 0;

  function shell() {
    const w = deck[i];
    el.innerHTML = `
      <div class="study-head">
        <button class="back" id="back">‹ Trang chủ</button>
        <span class="study-title">🃏 Thẻ ghi nhớ</span>
        <span class="study-count">${i + 1}/${total}</span>
      </div>
      <div class="progress"><div style="width:${(i / total) * 100}%"></div></div>

      <div class="card" id="card">
        <div class="card-inner">
          <div class="face front">
            <div class="emoji">${w.emoji || "📘"}</div>
            <div class="word">${escapeHtml(w.en)}</div>
            <div class="ipa">${escapeHtml(w.ipa || "")} · ${w.level}</div>
            <button class="speak" id="speak">🔊 Nghe</button>
          </div>
          <div class="face back">
            <div class="vi-label">Nghĩa tiếng Việt</div>
            <div class="vi">${escapeHtml(w.vi)}</div>
            <div class="example">${escapeHtml(w.example_en || "")}<br><span class="ex-vi">${escapeHtml(w.example_vi || "")}</span></div>
          </div>
        </div>
      </div>

      <p class="hint">👆 Chạm để lật thẻ</p>
      <div class="fc-actions">
        <button class="btn btn-ghost" id="again">🔁 Chưa thuộc</button>
        <button class="btn btn-primary" id="known">✅ Đã thuộc</button>
      </div>`;

    const card = el.querySelector("#card");
    card.addEventListener("click", (e) => {
      if (!e.target.closest("#speak")) card.classList.toggle("flipped");
    });
    el.querySelector("#speak").addEventListener("click", (e) => {
      e.stopPropagation();
      playWord(w.en);
    });
    el.querySelector("#back").addEventListener("click", () => navigate("/dashboard"));
    el.querySelector("#again").addEventListener("click", () => answer(false));
    el.querySelector("#known").addEventListener("click", () => answer(true));
  }

  async function answer(correct) {
    const w = deck[i];
    if (correct) known++;
    try {
      const res = await api.review(w.id, correct);
      setStats(res.stats);
      renderTopbar();
    } catch (e) {
      toast(e.message);
    }
    i++;
    if (i >= total) {
      resultView(el, {
        icon: "🎉",
        title: "Xong bộ thẻ!",
        sub: `Bạn đánh dấu ${known}/${total} từ là đã thuộc.`,
      });
      return;
    }
    shell();
  }

  shell();
}

/* ------------------------------- quiz ------------------------------- */

function runQuiz(el, deck) {
  const order = shuffle([...deck]);
  const total = order.length;
  let i = 0;
  let score = 0;
  let locked = false;

  function optionsFor(w) {
    const set = new Set([w.en]);
    const pool = shuffle([...deck]);
    for (const o of pool) {
      if (set.size >= 4) break;
      set.add(o.en);
    }
    return shuffle([...set]);
  }

  function shell() {
    const w = order[i];
    locked = false;
    const opts = optionsFor(w);

    el.innerHTML = `
      <div class="study-head">
        <button class="back" id="back">‹ Trang chủ</button>
        <span class="study-title">🎯 Đoán từ</span>
        <span class="study-count">${i + 1}/${total}</span>
      </div>
      <div class="progress"><div style="width:${(i / total) * 100}%"></div></div>

      <div class="question">
        <div class="emoji">${w.emoji || "📘"}</div>
        <div class="q-vi">Từ tiếng Anh của <b>${escapeHtml(w.vi)}</b> là gì?</div>
      </div>

      <div class="options" id="options">
        ${opts.map((o) => `<button class="option" data-en="${escapeHtml(o)}">${escapeHtml(o)}</button>`).join("")}
      </div>
      <div class="feedback" id="fb"></div>`;

    el.querySelector("#back").addEventListener("click", () => navigate("/dashboard"));
    el.querySelector("#options").addEventListener("click", (e) => {
      const btn = e.target.closest(".option");
      if (btn) answer(btn, btn.dataset.en);
    });
  }

  async function answer(btn, choice) {
    if (locked) return;
    locked = true;
    const w = order[i];
    const correct = choice === w.en;
    const fb = el.querySelector("#fb");

    if (correct) {
      score++;
      btn.classList.add("correct");
      fb.textContent = "🎉 Chính xác!";
      fb.className = "feedback ok";
    } else {
      btn.classList.add("wrong");
      fb.textContent = "❌ Đáp án đúng: " + w.en;
      fb.className = "feedback no";
      el.querySelectorAll(".option").forEach((b) => {
        if (b.dataset.en === w.en) b.classList.add("correct");
      });
    }
    el.querySelectorAll(".option").forEach((b) => (b.disabled = true));

    playWord(w.en); // pronounce the word to reinforce it
    try {
      const res = await api.review(w.id, correct);
      setStats(res.stats);
      renderTopbar();
    } catch (e) {
      toast(e.message);
    }

    setTimeout(() => {
      i++;
      if (i >= total) {
        resultView(el, {
          icon: score / total >= 0.8 ? "🏆" : "💪",
          title: `Đúng ${score}/${total}`,
          sub: score / total >= 0.8 ? "Tuyệt vời, bạn nhớ từ rất tốt!" : "Cố lên, ôn thêm một lượt nữa nhé.",
        });
      } else {
        shell();
      }
    }, correct ? 750 : 1500);
  }

  shell();
}
