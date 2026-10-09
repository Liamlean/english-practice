import urllib.request, urllib.parse, os, time, re, json

SEED = open("server/seed.js", encoding="utf-8").read()
words = list(dict.fromkeys(re.findall(r'\{\s*en:\s*"([^"]+)"', SEED)))
print("words:", len(words), flush=True)

outdir = "public/audio/en"
os.makedirs(outdir, exist_ok=True)

UA = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
    "Referer": "https://translate.google.com/",
}

def tts_url(word):
    q = urllib.parse.quote(word)
    return f"https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en-GB&q={q}"

manifest, fails = [], []
for i, w in enumerate(words, 1):
    dest = os.path.join(outdir, w + ".mp3")
    # Skip words that already have a valid file — only fetch new ones.
    if os.path.exists(dest) and os.path.getsize(dest) > 500:
        manifest.append(w)
        print(f"[{i}/{len(words)}] {w:14s} (đã có)", flush=True)
        continue
    ok, size = False, 0
    for attempt in range(4):
        try:
            req = urllib.request.Request(tts_url(w), headers=UA)
            with urllib.request.urlopen(req, timeout=25) as r:
                data = r.read()
            if len(data) > 500 and (data[:3] == b"ID3" or data[0] == 0xFF):
                open(dest, "wb").write(data)
                ok, size = True, len(data)
                break
        except Exception as e:
            last = str(e)[:60]
        time.sleep(1.2)
    if ok:
        manifest.append(w)
        print(f"[{i}/{len(words)}] {w:14s} {size}B", flush=True)
    else:
        fails.append(w)
        print(f"[{i}/{len(words)}] {w:14s} FAIL", flush=True)
    time.sleep(0.25)

json.dump(sorted(manifest), open("public/audio/manifest.json", "w", encoding="utf-8"), ensure_ascii=False)
print(f"DONE ok={len(manifest)} fails={fails}", flush=True)
