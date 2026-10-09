# Học Tiếng Anh — Ứng dụng luyện từ vựng cho người Việt

Full-stack: **thẻ ghi nhớ**, **đoán từ**, **đăng nhập**, **chuỗi ngày học (streak)**, **6 cấp độ A1–C2**.
Frontend là SPA thuần (HTML/CSS/JS), backend là Node + Express, dữ liệu lưu trên **Turso** (libSQL — tương thích SQLite).
Chạy online với **Vercel + Turso**, cả hai đều **miễn phí và không cần thẻ tín dụng**.

---

## 1. Chạy thử trên máy (không cần tài khoản nào)

Yêu cầu: **Node.js 18+** — tải tại https://nodejs.org (bản LTS).

```bash
cd english-practice
cp .env.example .env        # Windows: copy .env.example .env
npm install
npm start
```

Mở **http://localhost:3000**. Lần đầu chạy sẽ tự tạo file SQLite cục bộ `data/app.db` và nạp 225 từ.

> Để trống `TURSO_DATABASE_URL` trong `.env` thì app dùng file cục bộ — hoàn toàn offline.

- `npm run dev` — tự khởi động lại khi sửa code.
- `npm run seed` — nạp thêm từ mới vào kho (thêm chứ không xoá, an toàn với dữ liệu người học; dùng `--force` để xoá sạch rồi nạp lại).

---

## 2. Đưa lên mạng miễn phí (Vercel + Turso)

### Bước A — Tạo database Turso

1. Cài Turso CLI (một lần):
   - macOS/Linux: `curl -sSfL https://get.tur.so/install.sh | bash`
   - Windows: dùng WSL, hoặc tạo DB trực tiếp trên web https://turso.tech
2. Đăng nhập và tạo DB:
   ```bash
   turso auth login
   turso db create english-practice
   turso db show english-practice --url          # → libsql://...  (TURSO_DATABASE_URL)
   turso db tokens create english-practice       # → chuỗi token   (TURSO_AUTH_TOKEN)
   ```

### Bước B — Nạp từ vựng lên DB đám mây

Điền `TURSO_DATABASE_URL` và `TURSO_AUTH_TOKEN` vào file `.env`, rồi chạy:

```bash
npm run seed
```

(Nạp từ máy bạn lên Turso — chỉ cần làm một lần.)

### Bước C — Đẩy code lên GitHub

```bash
git init
git add .
git commit -m "Học Tiếng Anh"
git branch -M main
git remote add origin https://github.com/<tên-bạn>/english-practice.git
git push -u origin main
```

`.gitignore` đã loại `node_modules/`, `.env`, và `data/*.db` — bí mật không bị đẩy lên.

### Bước D — Deploy trên Vercel

1. Vào https://vercel.com → **Add New → Project** → chọn repo vừa đẩy.
2. Vercel tự nhận: `public/` là frontend tĩnh, `api/` là serverless function. Không cần đổi build.
3. Thêm **Environment Variables** (Settings → Environment Variables):
   | Tên | Giá trị |
   |---|---|
   | `TURSO_DATABASE_URL` | `libsql://...` |
   | `TURSO_AUTH_TOKEN` | token vừa tạo |
   | `JWT_SECRET` | một chuỗi ngẫu nhiên dài |
4. **Deploy**. Xong — mở domain `*.vercel.app`.

> Cookie đăng nhập được đặt `secure` khi `NODE_ENV=production` (Vercel tự set), nên phải chạy trên HTTPS — Vercel lo sẵn.

---

## 3. Tính năng

| Tính năng | Mô tả |
|---|---|
| Đăng ký / Đăng nhập | Chỉ **tên đăng nhập + mật khẩu**. Mật khẩu băm bcrypt, phiên đăng nhập bằng JWT trong cookie httpOnly. |
| Đổi mật khẩu | Trong **Hồ sơ → 🔒 Đổi mật khẩu**: nhập mật khẩu hiện tại + mật khẩu mới (≥ 6 ký tự). Không cần email. |
| Phát âm | Phát file ghi âm thật trong `public/audio/en/*.mp3` (giọng **Anh–Anh**). Nếu thiếu file, tự động chuyển sang giọng trình duyệt — chọn trong **Hồ sơ → 🔊 Giọng dự phòng**. |
| Thẻ ghi nhớ | Anh → Việt. Lật thẻ xem nghĩa + câu ví dụ, nghe phát âm, đánh dấu "đã thuộc / chưa thuộc". |
| Đoán từ | Việt → Anh. Chọn 1 trong 4 đáp án, có phản hồi và phát âm. |
| Chuỗi ngày học 🔥 | Học mỗi ngày để giữ chuỗi, bỏ một ngày chuỗi về 1. Lưu cả kỷ lục. |
| Mục tiêu mỗi ngày | Chọn 10 / 20 / 30 / 50 thẻ, có vòng tròn tiến độ hôm nay. |
| Cấp độ (độ khó) | A1 → C2, lọc bộ thẻ theo cấp độ. |
| Sáng / Tối | Nút ☀️/🌙, ghi nhớ lựa chọn. |
| XP & tiến độ | +10 điểm (đúng), +2 (sai). Từ "đã thuộc" sau 2 lần đúng. |

## 4. Cách tính streak

Mỗi lần trả lời, client gửi ngày địa phương (`localDate`). Server so với ngày hoạt động gần nhất:
hôm qua → **+1**, cùng ngày → giữ nguyên, khác → **reset về 1**.

## 5. Cấu trúc thư mục

```
english-practice/
├── api/
│   └── [...path].js      # entry cho Vercel: mọi /api/* đổ vào Express
├── server/
│   ├── app.js            # dựng Express app (không listen)
│   ├── index.js          # chạy cục bộ: init DB, seed, listen
│   ├── db.js             # libSQL/Turso + schema + streak/stats
│   ├── auth.js           # bcrypt, JWT cookie, guard
│   ├── seed.js           # kho 225 từ vựng
│   └── routes/           # auth · words · study · stats · admin
├── public/               # FRONTEND
│   ├── index.html
│   ├── css/styles.css
│   ├── audio/            # phát âm Anh–Anh: en/*.mp3 + manifest.json
│   └── js/               # app · api · audio · speech · store · router · ui · views/
├── scripts/
│   └── gen_audio.py      # tạo lại file phát âm bằng TTS giọng Anh–Anh
├── package.json
├── .env.example
└── README.md
```

> **Âm thanh phát âm:** nằm sẵn trong `public/audio/en/` (một file `.mp3` cho mỗi từ, giọng Anh–Anh).
> Khi thêm từ mới, chạy lại `python3 scripts/gen_audio.py` (cần Python 3) rồi commit thư mục `public/audio`.
> Script dùng endpoint TTS công khai của Google (`tl=en-GB`) — chỉ chạy lúc build, không gọi lúc dùng app.

## 6. API

| Phương thức | Đường dẫn | Việc |
|---|---|---|
| POST | `/api/auth/register` | `{ username, password }` → tạo tài khoản |
| POST | `/api/auth/login` | `{ username, password }` → đăng nhập |
| POST | `/api/auth/logout` | đăng xuất |
| GET | `/api/auth/me` | tài khoản hiện tại |
| POST | `/api/auth/change-password` | `{ current_password, new_password }` → đổi mật khẩu |
| GET | `/api/meta` | danh sách cấp độ + số từ |
| GET | `/api/deck?level=A1&size=20` | bộ thẻ để học |
| POST | `/api/study/review` | `{ wordId, correct, localDate }` |
| GET | `/api/stats?today=YYYY-MM-DD` | số liệu + tiến độ hôm nay |
| POST | `/api/stats/goal` | `{ daily_goal, localDate }` |
| GET | `/api/admin/stats?today=YYYY-MM-DD` | số liệu tổng hợp — chỉ admin |

## 7. Thêm từ vựng

Mở `server/seed.js`, thêm vào mảng `WORDS`:

```js
{ en: "sunflower", vi: "hoa hướng dương", level: "A2", category: "Thiên nhiên",
  emoji: "🌻", ipa: "/ˈsʌn.flaʊ.ər/",
  example_en: "The sunflower faces the sun.", example_vi: "Hoa hướng dương hướng về mặt trời." },
```

Rồi chỉ cần **push lên GitHub** — Vercel sẽ tự động:
- **Đồng bộ từ mới vào database** (`scripts/deploy_tasks.js` → `INSERT OR IGNORE`, thêm chứ không xoá, an toàn 100% với dữ liệu người học);
- **Sinh file audio tiếng Anh (Anh-Anh)** cho từ mới còn thiếu (`scripts/gen_audio.py`, chỉ tạo file chưa có);
- Deploy xong, mở lại trang web là số từ và âm thanh đã cập nhật.

Không cần chạy lệnh nào thủ công trên máy nữa. Nếu muốn dùng thủ công cho mục đích chạy thử, vẫn chạy được: `npm run seed`.

## 8. Trang quản trị (đếm người dùng)

Mở **`#/admin`** — nút **📊 Trang quản trị** sẽ hiện trong trang *Tài khoản* nếu bạn là admin. Trang này đọc thẳng từ database của bạn (không cần Google Analytics, không cookie theo dõi):

- Tổng số tài khoản, số **đăng ký mới hôm nay**, số **người hoạt động hôm nay**
- Lượt học hôm nay / tổng lượt học, tổng số từ đã thuộc
- Biểu đồ đăng ký **7 ngày qua**
- **Bảng xếp hạng** theo XP (chuỗi hiện tại, kỷ lục, số từ đã thuộc)

**Ai là admin?**
- Nếu đặt `ADMIN_USERS=ten1,ten2` trong `.env` (và cả trên Vercel) → đúng những tên đó.
- Nếu để trống → **tài khoản đăng ký đầu tiên** trở thành admin.

> Trên Vercel, nhớ thêm biến `ADMIN_USERS` (không bắt buộc) và bấm **Redeploy** sau khi đổi biến.

## 9. Xử lý sự cố

- **Trang trắng / 404 file tĩnh:** Vercel nên tự phục vụ `public/`. Nếu không, thêm file `vercel.json` với `{ "outputDirectory": "public" }` và deploy lại.
- **`TURSO_*` sai:** API trả "Lỗi máy chủ". Kiểm tra lại URL/token trong Environment Variables.
- **Chậm lần đầu:** serverless function "nguội" sau khi không dùng — lần vào đầu chậm vài giây, sau đó nhanh.
- **Đã đổi mật khẩu/secret:** đăng nhập lại; cookie cũ tự hết hạn.
