// language: JavaScript (ESM), file: public/js/api.js
// *Thin fetch wrapper around the backend API. Sends cookies with every request.*

export function todayLocal() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

async function request(method, url, body) {
  const opt = { method, headers: {}, credentials: "same-origin" };
  if (body !== undefined) {
    opt.headers["Content-Type"] = "application/json";
    opt.body = JSON.stringify(body);
  }
  const res = await fetch(url, opt);
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }
  if (!res.ok) {
    const msg = (data && data.error) || `Lỗi ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export const api = {
  register: (username, password) => request("POST", "/api/auth/register", { username, password }),
  login: (username, password) => request("POST", "/api/auth/login", { username, password }),
  logout: () => request("POST", "/api/auth/logout"),
  me: () => request("GET", "/api/auth/me"),
  meta: () => request("GET", "/api/meta"),
  stats: () => request("GET", "/api/stats?today=" + todayLocal()),
  deck: (level, size = 20) =>
    request("GET", `/api/deck?level=${encodeURIComponent(level || "all")}&size=${size}`),
  review: (wordId, correct) =>
    request("POST", "/api/study/review", { wordId, correct, localDate: todayLocal() }),
  setGoal: (daily_goal) => request("POST", "/api/stats/goal", { daily_goal, localDate: todayLocal() }),
  adminStats: () => request("GET", "/api/admin/stats?today=" + todayLocal()),
};
