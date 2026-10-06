# PhisCatcher --- Agent Instructions

## What this is

PhisCatcher is a multimodal phishing and quishing analysis application.

A user can upload an image/document or paste a URL/text. The system
extracts useful artifacts, detects QR codes, analyzes text with Gemini,
checks URL/infrastructure signals, optionally renders suspicious
destinations in an isolated browser, combines the signals into a risk
score, explains the result, stores the analysis, and can later support
notification/mitigation actions.

The patent specification is the architectural reference for the
detection pipeline. It describes separate linguistic, infrastructure,
visual, QR, fusion, explainability, and mitigation stages. Do not
flatten these into a single "Gemini says phishing" step.

Read `scope.md` before building anything. It is the living plan and the
source of truth for what is decided, what is complete, and what remains.

Read `ui-rules.md` before touching any UI.

## How to work

### Before every build step

Before writing code, state in a few plain sentences:

-   what is being built;
-   why it is the next step;
-   what existing decision or feature it depends on.

Then stop and wait for explicit approval to build.

Every feature gets this treatment, including apparently obvious work.

### Genuine forks

If there is a real architectural/product fork where two reasonable
choices materially affect implementation, ask one question at a time.

Give two or three concrete options.

Do not ask a long questionnaire. For ordinary implementation details,
decide yourself and record the decision in `scope.md`.

### During the build

When a build step starts:

1.  Create a short checklist of only the work genuinely being done.
2.  Put that checklist into the relevant section of `scope.md`.
3.  Check items off as actual work completes.
4.  If implementation proves the original plan wrong, update the plan.
5.  Explain the change in `scope.md`.
6.  Fix the implementation to match the corrected plan.

The files must make a fresh conversation productive without requiring
the project history to be re-explained.

### After the build

Before marking a step complete:

-   run the application;
-   run TypeScript/typecheck;
-   run lint;
-   run a production build;
-   manually exercise the real flow in a browser or with a lightweight
    HTTP request;
-   fix failures before calling the step done.

Do not install a test runner or browser automation framework merely for
verification. Manual browser/HTTP verification is the project's chosen
verification method.

Browser automation such as Playwright is allowed only when it is part of
the actual PhisCatcher product architecture for isolated webpage
rendering.

Report back in short concrete bullets. Put detailed reasoning and
permanent decisions in `scope.md`.

## Rules

-   Functional style by default.
-   Prefer pure functions and immutable data.
-   Use `const` and `readonly`.
-   Avoid shared mutable state.
-   Strict TypeScript.
-   Never use `any`.
-   Feature-oriented folders, not giant layer-wide folders.
-   Fail fast on missing required environment variables.
-   Never silently continue with missing provider/API configuration.
-   Keep side effects at system boundaries.
-   Every screen needs an accessibility baseline: semantic HTML,
    keyboard operation, visible focus, readable contrast, and sensible
    loading/error states.
-   Never expose raw provider exceptions, stack traces, or raw API error
    JSON to users.
-   Convert failures into short human-readable explanations with a retry
    action where appropriate.
-   Shared spacing, colors, typography, radii, shadows, and repeated UI
    patterns belong in the design system.
-   Do not copy the same UI pattern into multiple files when it should
    be a component.
-   Do not use raw hex colors or literal Tailwind color families in
    JSX/TSX.
-   All UI colors must come from semantic theme tokens defined
    centrally, as specified in `ui-rules.md`.
-   The interface is minimal, black-and-white, with `#3b82f6` blue as the
    only accent colour. Do not introduce colourful Holi-style tokens,
    random blue/indigo/purple SaaS styling, or a second visual language.
    All colours must come from semantic theme tokens in `globals.css`
    as specified in `ui-rules.md`.
-   Do not invent a second visual language for individual pages.
-   Do not modify the structural intent of the supplied sketches unless
    the written scope explicitly changes it.
-   If a sketch and written scope genuinely contradict each other, stop
    and ask which one wins.
-   Do not add features simply because they are technically easy.
-   Never claim something is done without actually running and checking
    it.

## Fixed stack

The current application stack is:

-   Next.js App Router
-   TypeScript
-   Tailwind
-   shadcn/ui
-   Drizzle ORM
-   Neon PostgreSQL
-   Clerk
-   UploadThing for file storage
-   Puter + Gemini for OCR/vision extraction
-   OpenRouter → `nvidia/llama-3.1-nemotron-ultra-253b-v1:free` for plain-language explanations
-   Browserbase for isolated remote URL rendering
-   `phishing-detection` + `bad-words` npm packages for SMS/text signals

Additional supporting technologies may be introduced when they solve a
specific architecture requirement and are recorded in `scope.md`.

Confirmed supporting technologies:

-   `@zxing/browser` for QR/barcode decoding (deterministic);
-   Zod for all AI output and external API response validation.

**Not in stack:**
-   Trigger.dev — removed; analysis runs synchronously in API routes.
-   Playwright — removed; Browserbase provides remote isolated rendering.
-   pgvector — not needed at MVP stage.

Do not add a new database, queue, vector store, auth provider, or AI
gateway without a real architectural reason and an explicit scope
decision.

## Detection architecture

The system is multimodal.

Do not implement the core detection flow as:

``` text
input → Gemini → phishing/not phishing
```

The intended pipeline is:

``` text
Input
  ↓
Artifact extraction
  ↓
QR / URL / text extraction
  ↓
Parallel analysis streams
  ├── linguistic
  ├── infrastructure
  └── visual
  ↓
Risk fusion
  ↓
Policy decision
  ↓
Explainable result
  ↓
History / notification / mitigation
```

The patent specification describes linguistic, infrastructure, and
visual telemetry streams and a composite risk score. It also explicitly
includes QR decoding as a path into URL/infrastructure/visual analysis.
Preserve that separation.

## QR rules

QR detection is deterministic infrastructure work, not an LLM
hallucination task.

Preferred flow:

``` text
Image/document
    ↓
QR decoder
    ↓
decoded payload
    ↓
URL normalization
    ↓
infrastructure + visual analysis
```

Use Gemini OCR/vision for surrounding text and visual interpretation,
not as the only QR decoder.

Do not claim a QR code exists unless a decoder actually detects one.

## AI rules

### Puter + Gemini

Used for:

-   OCR/vision extraction from uploaded images and documents;
-   visual interpretation of Browserbase screenshots;
-   surrounding-text analysis of QR codes.

Gemini must not fabricate deterministic infrastructure facts (domain age,
DNS records, certificate dates, redirect counts).

Use Zod-validated structured output wherever Gemini returns data consumed
by application logic.

### OpenRouter Nemotron

Model: `nvidia/llama-3.1-nemotron-ultra-253b-v1:free` via OpenRouter.

Used **only** for:

-   generating the plain-language explanation shown to the user in the report.

Nemotron must **not**:

-   invent, adjust, or re-score signal values;
-   fabricate infrastructure facts;
-   produce the final risk score or classification.

Always validate the output is a non-empty string before persisting.

## Infrastructure rules

Infrastructure signals should come from deterministic or external
intelligence sources.

Potential signals:

-   normalized hostname;
-   HTTPS;
-   domain age;
-   certificate transparency history;
-   DNS/IP/ASN information;
-   redirect count;
-   threat-feed matches.

The system may combine these signals into an infrastructure risk score.

Do not silently treat an unavailable intelligence source as "safe".

## Visual analysis rules (Browserbase)

Browserbase is the confirmed tool for isolated URL rendering.

Flow:

``` text
URL
 ↓
Browserbase remote browser session (cloud-isolated)
 ↓
render page
 ↓
capture screenshot + DOM/form signals
 ↓
Gemini vision analyses screenshot
 ↓
VisualSignal { score, screenshotUrl, formDetected, unavailable }
```

The live Browserbase session is embedded directly in `/report/[id]`
so the user can see the rendered page without leaving PhishCatcher.

Untrusted pages must never be rendered inside the Next.js server process.

Document any isolation shortfall in `scope.md` — do not pretend
Browserbase provides guarantees it does not.

## Risk scoring

Do not ask Gemini to invent the final risk score.

Use deterministic application logic to combine the available signals.

The fusion layer can combine:

-   linguistic score;
-   infrastructure score;
-   visual score;
-   QR-related signals.

Every score must have a traceable source.

If a signal is unavailable, represent that state explicitly rather than
inventing a value.

The final classification thresholds are product policy and must be
documented in `scope.md`.

## Data sources

Proposed sources are separate from the application's own analysis data.

Potential intelligence/evaluation sources include:

-   PhishTank;
-   URLhaus;
-   Phishpedia-style phishing webpage/brand data;
-   CIC-Trap4Phish for QR/quishing evaluation;
-   Certificate Transparency data.

Do not silently treat any external feed as authoritative truth. Store
source/provenance where practical.

## Authentication and ownership

Clerk is the identity source.

Neon/Drizzle stores application records tied to the Clerk user ID.

Authenticated users can create analyses and view their own history.

Any public result/share feature must be explicitly enabled by scope
before being implemented.

## Analysis synchrony

Analysis runs synchronously inside Next.js API routes with a hard
60-second timeout. There is no background queue.

- Long sub-tasks (Browserbase render, WHOIS, DNS) run concurrently
  with `Promise.allSettled`.
- If a stream times out or errors, mark its signal `unavailable`.
  Save the partial result; never block the report page.
- A user-triggered analysis must never be confused with a scheduled job.

## File upload rules

- Use UploadThing for all file storage.
- Accept: image/jpeg, image/png, image/webp, image/gif, application/pdf.
- Maximum file size: 10 MB.
- Validate MIME type server-side; reject mismatches.
- Store the UploadThing file key, not the raw bytes, in Neon.

## Observability

Add useful application observability around:

-   analysis submitted;
-   analysis completed;
-   analysis failed;
-   QR detected;
-   URL extracted;
-   classification produced;
-   notification/mitigation action attempted.

Do not log sensitive uploaded content or secrets unnecessarily.

## Context files

If nested context files are created for a specific part of the codebase,
list them here.

Currently none.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
