// language: JavaScript (ESM), file: public/js/speech.js
// *Text-to-speech helper. Prefers a British (en-GB) voice and remembers the user's pick.*

const LS_KEY = "ep_voice";

let voices = [];
let voicesReady = null;

function isEnglish(v) {
  return /^en([-_]|$)/i.test(v.lang || "");
}

export function isBritishVoice(v) {
  return /en[-_]?gb/i.test(v.lang || "") || /(uk|british|united kingdom)/i.test(v.name || "");
}

// getVoices() is async on Chrome/Edge: it fills in after `voiceschanged`.
function loadVoices() {
  if (!("speechSynthesis" in window)) return Promise.resolve([]);
  const now = window.speechSynthesis.getVoices();
  if (now.length) {
    voices = now;
    return Promise.resolve(voices);
  }
  if (!voicesReady) {
    voicesReady = new Promise((resolve) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        voices = window.speechSynthesis.getVoices();
        resolve(voices);
      };
      try {
        window.speechSynthesis.addEventListener("voiceschanged", finish);
      } catch {}
      // Fallback poll for browsers that never fire the event.
      let tries = 0;
      const t = setInterval(() => {
        if (window.speechSynthesis.getVoices().length || ++tries > 25) {
          clearInterval(t);
          finish();
        }
      }, 120);
    });
  }
  return voicesReady;
}

export async function englishVoices() {
  await loadVoices();
  return voices.filter(isEnglish);
}

export function getSavedVoiceName() {
  try {
    return localStorage.getItem(LS_KEY) || "";
  } catch {
    return "";
  }
}

export function saveVoiceName(name) {
  try {
    if (name) localStorage.setItem(LS_KEY, name);
    else localStorage.removeItem(LS_KEY);
  } catch {}
}

// Nicer-sounding voices first, when the device has them.
const PREFERRED = [
  "Google UK English Female",
  "Google UK English Male",
  "Microsoft Libby",
  "Microsoft Ryan",
  "Microsoft Sonia",
  "Daniel",
  "Serena",
  "Kate",
  "Oliver",
  "Arthur",
];

function pickVoice() {
  const en = voices.filter(isEnglish);
  if (!en.length) return null;

  const saved = getSavedVoiceName();
  if (saved) {
    const v = voices.find((x) => x.name === saved);
    if (v) return v;
  }
  for (const p of PREFERRED) {
    const v = en.find((x) => x.name.includes(p));
    if (v) return v;
  }
  // Otherwise any British voice, else any English one.
  return en.find(isBritishVoice) || en[0];
}

export async function speak(text, lang) {
  if (!("speechSynthesis" in window) || !text) return;
  await loadVoices();
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const v = pickVoice();
  if (v) u.voice = v;
  u.lang = lang || (v ? v.lang : "en-GB");
  u.rate = 0.95;
  u.pitch = 1;
  window.speechSynthesis.speak(u);
}
