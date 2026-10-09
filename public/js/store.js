// language: JavaScript (ESM), file: public/js/store.js
// *Tiny shared app state. Views read/write this instead of prop-drilling.*

export const state = {
  user: null,
  stats: null,
  meta: null,
  level: localStorage.getItem("ep_level") || "all",
};

export function setUser(u) {
  state.user = u;
}
export function setStats(s) {
  state.stats = s;
}
export function setMeta(m) {
  state.meta = m;
}
export function setLevel(level) {
  state.level = level;
  try {
    localStorage.setItem("ep_level", level);
  } catch {}
}
