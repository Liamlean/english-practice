// language: JavaScript (ESM), file: public/js/audio.js
// *Plays the real British audio files in /audio/en/<word>.mp3.*
// *Falls back to browser speech synthesis if a file is missing or blocked.*

import { speak } from "./speech.js";

const BASE = "/audio";
let available = null; // Set of words that have an mp3
let loaded = null;
let current = null;

function loadManifest() {
  if (!loaded) {
    loaded = fetch(`${BASE}/manifest.json`)
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => {
        available = new Set(Array.isArray(list) ? list : []);
        return available;
      })
      .catch(() => {
        available = new Set();
        return available;
      });
  }
  return loaded;
}

// Warms the manifest so the first tap has no delay.
export function preloadAudio() {
  loadManifest();
}

export async function playWord(word) {
  const w = String(word || "").trim();
  if (!w) return;
  await loadManifest();

  if (current) {
    try {
      current.pause();
      current.currentTime = 0;
    } catch {}
    current = null;
  }

  if (available && available.has(w)) {
    const a = new Audio(`${BASE}/en/${encodeURIComponent(w)}.mp3`);
    current = a;
    // If the file fails to load, degrade to the browser voice.
    a.addEventListener("error", () => speak(w), { once: true });
    try {
      await a.play();
      return;
    } catch {
      speak(w);
      return;
    }
  }

  speak(w);
}
