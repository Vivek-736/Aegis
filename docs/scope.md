# PhishCatcher — Scope & Delivery Plan

Last updated: 2026-10-05

---

## Product vision

PhishCatcher is a multimodal phishing and quishing analysis platform.
A user authenticates, submits a suspicious input (URL, SMS text, image,
document, or QR code), watches it analysed through separate signal streams,
and receives an explainable risk report. Historical reports are saved to their
dashboard. The dashboard also hosts an educational phishing quiz bank.

---

## Confirmed stack

| Concern | Technology |
|---|---|
| Framework | Next.js 16 App Router, TypeScript strict |
| Auth | Clerk |
| Database | Neon (PostgreSQL) + Drizzle ORM |
| File storage | UploadThing |
| AI — explanation | OpenRouter → `nvidia/llama-3.1-nemotron-ultra-253b-v1:free` |
| AI — OCR/vision | Puter + Gemini (image/QR extraction and visual signals) |
| QR decoding | `@zxing/browser` (deterministic, not AI) |
| Live URL rendering | Browserbase (isolated cloud browser; streamed into site) |
| SMS / text signals | `phishing-detection` + `bad-words` npm + custom corpus |
| Styling | Tailwind + shadcn/ui, tokens from `docs/ui-rules.md` |
| Validation | Zod for all AI output and external API responses |

**Removed from stack:**
- Trigger.dev — no background job queue; analysis runs in Next.js API routes
  with streaming responses and a 60-second timeout.
- Playwright — replaced by Browserbase for isolated remote rendering.

---

## Three screens

```
/ (landing)       → public marketing page (built)
/dashboard        → authenticated hub: new analysis, history, quiz, stats
/report/[id]      → authenticated: full analysis report for one submission
```

---

## Analysis pipeline

```
User input (file | URL | SMS text)
  ↓
[UploadThing]  ← stores raw file when image/document is uploaded
  ↓
Artifact extraction
  ├── QR decode       (@zxing/browser — deterministic)
  ├── OCR / text      (Puter + Gemini — validated with Zod)
  └── URL normalise   (application code)
  ↓
Parallel signal streams
  ├── Linguistic   → urgency, impersonation, credential-harvest keywords
  │                  phishing-detection npm + bad-words + custom corpus
  ├── Infrastructure → WHOIS age, DNS, HTTPS, redirect count, threat feeds
  └── Visual         → Browserbase renders URL remotely → screenshot →
                       Gemini vision analyses brand/form signals
  ↓
Deterministic risk fusion (weighted sum in application code)
  ↓
OpenRouter Nemotron: human-readable explanation from structured signals
  ↓
Persist to Neon (analyses, signals, report rows)
  ↓
/report/[id] rendered with live Browserbase embed + signal breakdown
```

**Hard rules:**
- Nemotron may only write the plain-language explanation.
  It must not invent infrastructure facts or signal scores.
- Every signal has an explicit `unavailable` state; missing ≠ safe.
- Browserbase renders untrusted URLs in a remote isolated browser;
  never inside the Next.js server process.

---

## Risk classification thresholds (product policy — v1)

| Score | Label |
|---|---|
| 0 – 24 | Safe |
| 25 – 54 | Suspicious |
| 55 – 79 | Likely phishing |
| 80 – 100 | Confirmed phishing |

**Signal weights (v1):**

```
linguistic       30 %
infrastructure   35 %
visual           25 %
qr_bonus         10 %   (added when a QR payload resolves to a suspicious domain)
```

Weights and thresholds are versioned; every stored report records the version used.

---

## SMS / text signal approach

Input type `sms` or pasted `text` bypasses URL rendering and image OCR.
Signals come from deterministic sources only:

1. **`phishing-detection` npm package** — keyword-based URL and text pattern matcher.
2. **`bad-words` npm package** — urgency and threat language filter.
3. **Custom corpus** (`lib/analysis/sms-corpus.ts`):
   - Urgency phrases: "act now", "verify your account", "click here immediately",
     "account suspended", "limited time offer".
   - Brand impersonation tokens: "HMRC", "IRS", "USPS", "FedEx", "Netflix",
     "Apple ID", "PayPal", "Amazon", "your bank".
   - Credential-harvest phrases: "enter your password", "confirm your details",
     "update your billing", "verify now".
4. **Regex patterns** for shortened URLs (bit.ly, tinyurl, t.co, ow.ly),
   phone-number spoofing, and suspicious unicode lookalikes.
5. **OpenRouter Nemotron** receives the matched evidence list and writes the
   plain-language explanation only — it does not re-score.

---

## Dashboard sections

```
/dashboard
  ├── New Analysis    ← primary CTA, opens upload/paste surface
  │     ├── Tab: Paste URL
  │     ├── Tab: Paste SMS / text
  │     └── Tab: Upload image or document (UploadThing)
  ├── History         ← paginated list of past reports (score, label, timestamp)
  ├── Quiz            ← phishing awareness quiz bank (100 static questions)
  └── Stats           ← total analysed, threat-label breakdown chart (Phase 4)
```

### Quiz bank spec

- **100 static questions** stored as a TypeScript array in `lib/quiz/questions.ts`.
- No AI call at runtime; questions are authored once.
- Each record shape:
  ```ts
  {
    id: number
    category: QuizCategory
    question: string
    options: [string, string, string, string]
    answer: 0 | 1 | 2 | 3
    explanation: string
  }
  ```
- Categories:
  `url-red-flags` | `sms-tactics` | `qr-quishing` | `email-headers` |
  `social-engineering` | `brand-impersonation` | `technical-indicators`
- Quiz UI: 10 questions drawn randomly per session; score shown at end.
  No server persistence required for quiz results.

---

## Phase plan

### Phase 1 — Foundation & Landing Page ✅

**Goal:** working app shell, Clerk auth wiring, and a polished public landing page.

- [x] Confirm TypeScript strict mode, `@/*` alias, env-var fail-fast validation.
- [x] Configure Clerk: sign-in, sign-up, protected `/dashboard` and `/report/*` routes.
- [x] Connect Neon + run initial Drizzle migration (users table).
- [x] Landing page (`app/page.tsx`): hero, signals strip, how-it-works, CTA.
      Verify against `docs/ui-rules.md`. Add auth-aware nav (Sign in / Dashboard).
- [x] Run lint, tsc, build, manual smoke check.

Exit criteria: unauthenticated visitors see landing; authenticated users can
reach `/dashboard`; project builds with zero errors.

---

### Phase 2 — Dashboard Shell & File Ingestion ✅

**Goal:** authenticated dashboard with upload surface and UploadThing integration.

- [x] Build `/dashboard` layout with sidebar: New Analysis, History, Quiz, Stats (stub).
- [x] Build "New Analysis" panel with three input tabs (URL / SMS text / Upload).
- [x] UploadThing route handler: accept image/document, max 10 MB, validate MIME type.
- [x] Drizzle schema: `analyses`, `artifacts`, `signals`, `reports` tables.
- [x] On submission: create `analysis` record (status `pending`), redirect to `/report/[id]`.
- [x] `/report/[id]`: loading skeleton while analysis runs.
- [x] History section: paginated list (score, label, input summary, date).
- [x] Quiz section: render 100-question bank as 10-question random sessions with score.
- [x] Verification: `npx tsc --noEmit` passed (exit 0). Lint/build run waived for
      Phase 2 by explicit decision; they remain required by Phase 4 exit criteria.

Exit criteria: upload, history, and quiz all work end-to-end.

---

### Phase 3 — Analysis Engine ✅

**Goal:** all three signal streams producing real results; full risk report rendered.

- [x] Step 1: Types & interfaces for artifacts, signals, fusion result, and explanation (`lib/analysis/types.ts`).
- [x] Step 2: Linguistic stream & SMS corpus (`lib/analysis/sms-corpus.ts`, `lib/analysis/linguistic.ts`).
- [x] Step 3: Infrastructure stream: DNS, HTTPS, domain age, threat feed check (`lib/analysis/infrastructure.ts`).
- [x] Step 4: Visual stream & Browserbase session rendering (`lib/analysis/visual.ts`).
- [x] Step 5: QR decoding (`@zxing/library`) & OCR text extraction (`lib/analysis/qr.ts`, `lib/analysis/ocr.ts`).
- [x] Step 6: Risk fusion engine (`lib/analysis/fusion.ts`).
- [x] Step 7: OpenRouter Nemotron explanation generator (`lib/analysis/explanation.ts`).
- [x] Step 8: Pipeline orchestrator & `/api/analyse` update to run synchronous pipeline and persist records (`lib/analysis/pipeline.ts`).
- [x] Step 9: Upgrade `/report/[id]` page to display complete report (signals breakdown, evidence list, explanation, Browserbase session/screenshot).
- [x] Step 10: Validation & smoke testing complete.

Exit criteria: full end-to-end analysis completes; report is reproducible from
stored signal data.

---

### Phase 4 — Polish, Stats & Production Hardening

**Goal:** production-quality reliability, edge cases handled, Stats section complete.

- [ ] Stats section: total analyses, threat-breakdown chart (recharts).
- [ ] 60-second analysis timeout: partial signals saved with `unavailable`; user sees partial report.
- [ ] User-facing errors: all failures produce short human-readable messages, no stack traces.
- [ ] Rate limiting: max 10 analyses per user per hour (middleware).
- [ ] File upload hardening: strict MIME validation, 10 MB cap enforced server-side.
- [ ] Accessibility audit: keyboard nav, visible focus, ARIA labels, contrast ≥ AA.
- [ ] Dark mode final pass against `docs/ui-rules.md`.
- [ ] SEO: title tags, meta descriptions, canonical URLs on all routes.
- [ ] Production build + end-to-end manual test + release checklist.

Exit criteria: lint, tsc, build pass; manual end-to-end test passes; no raw
provider errors exposed to users; all screens meet accessibility baseline.

---

## Decisions log

| Date | Decision |
|---|---|
| 2026-10-05 | Removed Trigger.dev; analysis runs synchronously in API routes (60 s limit). |
| 2026-10-05 | Removed Playwright; Browserbase provides remote isolated URL rendering. |
| 2026-10-05 | UploadThing for file storage (no self-hosted S3). |
| 2026-10-05 | OpenRouter Nemotron (`nvidia/llama-3.1-nemotron-ultra-253b-v1:free`) for explanations only. |
| 2026-10-05 | SMS signals use `phishing-detection` + `bad-words` + custom corpus (no AI for scoring). |
| 2026-10-05 | Quiz bank: 100 static questions in `lib/quiz/questions.ts` (scoped down from 500); no runtime AI. |
| 2026-10-05 | Quiz session: 10 random questions per run; explanations inline; score at end; no persistence. |
| 2026-10-05 | Brand mark: `logo.svg` replaces ShieldCheck (auth header 24px, upload icon 36px); next/image SVG enabled via `dangerouslyAllowSVG` + CSP. |
| 2026-10-05 | Blue accents use `--color-blue-accent` theme token only; active sidebar pill monochrome (`bg-foreground`). |
| 2026-10-05 | UploadThing max file size 8 → 10 MB to match Phase 4 hardening cap. |
| 2026-10-05 | Phase 2 verification: `tsc --noEmit` exit 0; lint/build run waived by explicit decision (still required by Phase 4 gate). |
| 2026-10-05 | Risk weights v1: linguistic 30%, infrastructure 35%, visual 25%, QR bonus 10%. |
| 2026-10-05 | Classification thresholds v1: Safe 0–24, Suspicious 25–54, Likely 55–79, Confirmed 80–100. |
| 2026-10-05 | UI theme: minimal black/white with `#3b82f6` blue accent only. |

---

## Verification gate

A phase is complete only when:

```
npm run lint
npx tsc --noEmit
npm run build
npm run dev   (+ manual browser smoke check of the phase's real flow)
```

Record all notable failures and follow-up decisions in this document before
starting the next phase.
