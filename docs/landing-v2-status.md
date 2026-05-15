# Landing v2 — Status Report cho Sếp

> Branch `feat/v2-upgrade` · 3 commits đã push: `262a7cc` → `e7fbeea` → `f5d5af8`
> Test trên local prod (port 3500), Vercel preview pending fix deploy.

---

## ✅ Đã hoàn thành

### Chat agent + persistence (commit `ef9e94d`, `ac659c8`)

> Sếp confirm tạm **PENDING** chat agent. Code + infra đã sẵn — khi nào resume chỉ cần set 1 env var trên Vercel.

- **Chat persistence wired** — visitor chat với widget góc dưới phải, message lưu vào DB (`chat_sessions` + `chat_messages`). Trước đó 2 bảng này orphan, không được dùng. Cookie session 30 ngày, anonymous.
- **Admin xem chat sessions** — `/admin/chats` list các session, click vào xem transcript user/assistant đầy đủ. Sales/marketing biết visitor hỏi gì để improve content + qualify lead.
- **Migration 009** đã apply: thêm permission `chats.view` + `chats.delete`, grant role super_admin/admin/viewer.
- **Bug fix AI provider** ([src/lib/ai/provider.ts](src/lib/ai/provider.ts)): 3 sửa để chat work mọi môi trường:
  1. ENV override — nếu Vercel có `ANTHROPIC_API_KEY` env → dùng trước, không gọi DB. Cho phép Vercel work mà không cần touch shared `sso.api_providers`.
  2. Rewrite Docker hostname `tbrain-ai-api-prod:8080` → `127.0.0.1:3010` (Bifrost host port mapping) — cho phép local dev gọi Bifrost gateway.
  3. Lowercase model name (`GLM-4.7` → `glm-4.7`) — Bifrost gateway case-sensitive, model name trong DB sai case.
- **Auth/OAuth login fix** ([src/lib/admin/bootstrap.ts](src/lib/admin/bootstrap.ts) + Supabase config): admin login Google trên `/admin/login` từng redirect về `management.tbrain.ai` thay vì landing. Đã thêm 3 URL vào Supabase `GOTRUE_URI_ALLOW_LIST`:
  - `http://localhost:3500/**`
  - `https://prj-tbrain-landing.vercel.app/**`
  - `https://prj-tbrain-landing-*.vercel.app/**` (wildcard cho preview branches)
  Container `supabase-auth` đã recreate với env mới. Login giờ redirect đúng.
- **Promote admin script** ([scripts/promote-admin.mjs](scripts/promote-admin.mjs)): one-shot helper khi GoTrue admin user-list endpoint fail. Đã dùng để add `vietanh951325@gmail.com` thành super_admin.

### Bug fix: Terminal Bench request approval

- Migration 013: restore unique constraint `(client_id, batch_id)` trên `passcodes` (mất khi migration 005 merge access_grants → batch_passcodes). Trước đó approve request fail với error "no unique or exclusion constraint matching the ON CONFLICT specification".
- API `/data/terminal-bench/api/auth/request` set thêm `product_id` khi insert (trước đó NULL → request không hiện trong `/admin/products/terminal-bench/requests`).
- Backfill data cũ bằng SQL UPDATE.

### Visual + Theme (PR-A)
- Toàn site dùng theme light theo template `/casestudy` (homepage cũ là dark — đã convert)
- Header tự adapt, h1 weight đồng nhất `font-semibold` mọi trang
- Sửa 5 lỗi spelling Anh-Anh → Anh-Mỹ (artefact, recognised, flavour)
- Bỏ "Singapore" + "Sheridan, WY" khỏi footer/CTA, giữ Hanoi

### Cấu trúc nội dung mới (PR-B)
- **`/services`** chia 2 sections: "What we deliver" (3 service) + "Domains & Expert Pods" (6 domain — Coding & Medical lên đầu theo Sếp request)
- **`/platform`** (page mới): showcase Expert OS với 4 features placeholder
- Admin CRUD đầy đủ — media tự edit content qua UI:
  - `/admin/domains` (6 domain)
  - `/admin/expert-os` (4 platform feature)
  - `/admin/case-studies` (đã có thêm upload PDF)
- Schema migration 012 + 013 đã apply prod DB

### Security + Performance + Lead capture (PR-C)
- Rate limit `/api/newsletter` (chống spam)
- Footer Turnstile bypass đã đóng
- PDF upload kiểm tra magic bytes (chống upload file giả)
- Custom 404 + error page (light theme)
- `/api/health` endpoint cho uptime monitor
- Blog ISR (Lighthouse + SEO improve)
- Sitemap auto include blog slugs + case studies + `/platform`
- Cover image dùng `next/image` (nhanh + responsive)
- **UTM attribution toàn pipeline**: utm_source/medium/campaign từ URL → CRM → /admin/contacts thấy "Channel" column
- Terminal Bench: nút download per-sample (khách không phải tải full batch)

---

## ⚠️ Cần Sếp confirm (block dev tiếp)

### 1. Trang `/data/physical-ai` — quyết định
Page hiện 100% claim hallucinated (829h dataset, 5.2mm precision, hardware $2k-4.5k). Khách click "Request access" → dead-end. **Rủi ro uy tín B2B.**

→ Chọn 1: (a) **Xoá**, (b) Giữ marketing + bỏ CTA Request, (c) Repurpose layout cho Coding/Medical

### 2. Case Studies PDF — chọn cách
3 mục đích: social proof + lead qualification + sales asset.

| # | Cách | Pro/Con |
|---|---|---|
| 1 | Web only, no PDF | Đơn giản · không capture lead |
| 2 | PDF tải tự do | Nhanh · không capture lead |
| 3 | **PDF email gate** (recommend) | Lead → CRM, sales 24h · cần thiết kế PDF |
| 4 | "Request detailed" form | Sales chat trực tiếp · slower |

→ Nếu chọn (3): cần thiết kế 5 PDF brochure (1 per case) + decide email gate yêu cầu nhập gì.

### 3. Hero copy mới
Sếp gợi ý: H1 = `"Trusted Human Infrastructure for Agentic AI"`. Confirm wording chính xác + subtitle (data factory + Coding + Agentic + Robotics).

### 4. `/platform` flow
Static showcase, hay full request-demo flow giống Terminal Bench? (request-demo = thêm ~2h dev cho form + admin approval + email template).

### 5. Vercel branch strategy
Push thẳng `feat/v2-upgrade` → Vercel auto build. OK chưa, hay cần PR review trước mỗi push?

### 6. Chat agent — khi nào resume?

Sếp confirm pending. Khi resume:
- Set `ANTHROPIC_API_KEY` (key thật từ console.anthropic.com) trong Vercel env → chat work ngay
- Hoặc Bifrost public expose → dùng `ANTHROPIC_BASE_URL=https://<bifrost-public>` + Bifrost gateway key
- Code đã ưu tiên env override → không cần redeploy code, chỉ set env + redeploy Vercel

Decision: chờ Sếp confirm timeline + budget Anthropic API.

---

## 📝 Cần Media verify (block ship content sạch)

### Số liệu marketing — đang hiện trên site nhưng chưa verify

| Số hiện tại | Trang | Action |
|---|---|---|
| **48,000+ AI Training Experts** | /about | Số thật? Hay xoá hẳn? |
| **250+ Projects Delivered** | /about | Verify? |
| **17+ Countries** | /about | List 17 nước? Hay đổi "multi-country"? |
| **15+ Years Combined Leadership** | /about | Confirm với Tam + David |
| **8+ Domains** | / + marketing | List 8 cụ thể |
| **GPT-5 Pass ≤20%** | Terminal Bench | GPT-5 chưa release thật → đổi sang GPT-4o / Claude Sonnet 4? |
| **48K Annotations / 90% Accuracy** | /casestudy | Verify project + khách nào? |
| Bio Tam Le "15+ years Google/Adobe/Asana/Turing" | /about | Verify với Tam |
| Bio David Do "20 years 500+ engineers" | /about | Verify với David |

### Content cần fill (qua admin, không cần dev)

| Item | Owner | Where |
|---|---|---|
| Mô tả 6 domains (Coding, Medical, Manufacturing, Languages, Robotics, RL) + chọn icon | Media | `/admin/domains` |
| Mô tả 4 Expert OS features (Knowledge Base, LLM-as-Judge, Workflows, Identity & Soul) | Media | `/admin/expert-os` |
| Languages domain — list cụ thể (Asian = CN/JP/KR? Spanish? Portuguese? Baltic = LT/LV/EE?) | Media | `/admin/domains` |
| Ảnh chân dung team (rest leadership/expert) | Drake/Tam | Public folder |
| Ảnh office Hanoi (1-2 ảnh chất lượng cao) | Drake/Tam | Public folder |
| Screenshot/demo management.tbrain.ai (3-5 ảnh) cho `/platform` | Media | Public folder |
| 5 PDF case study brochure (nếu chọn cách 3 ở mục 2) | Designer | — |

---

## 🛠 Cần infra/DevOps (Drake)

| Item | Effort | Tại sao |
|---|---|---|
| **Verify Resend domain `tbrain.ai`** | 30min + DNS wait | Email từ `no-reply@tbrain.ai` đang fail → tạm dùng `onboarding@resend.dev` (test domain). Cần add 4 DNS records (TXT/MX/2 CNAME) vào DNS provider. |
| **Cloudflare Turnstile keys** | 30min | CAPTCHA hiện disabled toàn site → bot có thể spam form. |
| **Vercel deploy unstuck** | 5min | 3 commits đã push GitHub nhưng Vercel `prj-tbrain-landing.vercel.app` vẫn serve bản cũ. Check Vercel Dashboard → Deployments xem build có queue/fail không. |
| **Audit `.env.local` git history** | 30min | Nếu file từng commit lên git → cần rotate SUPABASE_SERVICE_ROLE_KEY, GCS_PRIVATE_KEY, RESEND_API_KEY, TB_AUTH_SECRET. |

---

## 🚀 Sau khi confirm xong

Dev còn ~1-2 ngày để:
- Replace số liệu hallucinated với data thật từ Media
- Apply quyết định Physical AI page
- Build PDF download public flow (nếu Sếp chọn cách 3)
- Update hero copy theo Sếp confirm
- Push prod (tbrain.ai cutover từ master cũ → v2)

**Sau đó site v2 sạch, ready for marketing campaigns.**

---

## 🔮 Defer (3+ tháng, sau khi v2 ổn)

- Slack webhook cho hot leads (sales response real-time)
- Audit + chuyển 45 page khác từ `force-dynamic` → ISR (Lighthouse +30 điểm)
- i18n full (Vietnamese + Asian languages)
- Lead scoring + automated follow-up
- Bifrost public expose (chat agent re-enable trên Vercel)
- Migrate hardcoded `/casestudy/details/{slug}` sang dynamic CMS route
- Customer dashboard cho Terminal Bench (xem lịch sử download)

---

## Reference

- Plan chi tiết: `/root/.claude/plans/overall-visual-looks-great-replicated-clarke.md`
- Test trên local: `http://localhost:3500/`
- Vercel preview: `https://prj-tbrain-landing.vercel.app/` (đang stuck commit cũ)
- Production hiện tại: `https://tbrain.ai/` (nhánh master, chưa cutover sang v2)
- Repo: `git@github.com:Tbrain-AI/prj-tbrain-landing.git` (branch `feat/v2-upgrade`)
