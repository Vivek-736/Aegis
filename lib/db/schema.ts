import {
  pgTable,
  text,
  timestamp,
  integer,
  real,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";

// ── Users ─────────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: text("id").primaryKey(), // clerk user id
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Enums ─────────────────────────────────────────────────────────────────────
export const inputTypeEnum = pgEnum("input_type", [
  "url",
  "sms",
  "image",
  "document",
]);

export const statusEnum = pgEnum("status", [
  "pending",
  "running",
  "complete",
  "failed",
]);

export const labelEnum = pgEnum("label", [
  "safe",
  "suspicious",
  "likely_phishing",
  "confirmed_phishing",
]);

// ── Analyses ──────────────────────────────────────────────────────────────────
export const analyses = pgTable("analyses", {
  id: text("id").primaryKey(), // cuid
  userId: text("user_id").notNull().references(() => users.id),
  inputType: inputTypeEnum("input_type").notNull(),
  /** Raw text input (URL or SMS) — null for file uploads */
  inputText: text("input_text"),
  /** UploadThing file key — null for text inputs */
  fileKey: text("file_key"),
  /** Public UploadThing URL for display */
  fileUrl: text("file_url"),
  status: statusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

// ── Artifacts ─────────────────────────────────────────────────────────────────
// Concrete things extracted from a submission (QR payload, normalised URL,
// OCR'd text) before signal analysis runs.
export const artifacts = pgTable("artifacts", {
  id: text("id").primaryKey(),
  analysisId: text("analysis_id")
    .notNull()
    .references(() => analyses.id, { onDelete: "cascade" }),
  /** 'qr' | 'url' | 'text' */
  kind: text("kind").notNull(),
  value: text("value").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Signals ───────────────────────────────────────────────────────────────────
// One row per signal stream per analysis
export const signals = pgTable("signals", {
  id: text("id").primaryKey(),
  analysisId: text("analysis_id")
    .notNull()
    .references(() => analyses.id, { onDelete: "cascade" }),
  stream: text("stream").notNull(), // 'linguistic' | 'infrastructure' | 'visual' | 'qr'
  /** 0–100 or null when unavailable */
  score: real("score"),
  unavailable: text("unavailable"), // reason string if stream failed
  /** Stream-specific evidence payload */
  payload: jsonb("payload"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Reports ───────────────────────────────────────────────────────────────────
export const reports = pgTable("reports", {
  id: text("id").primaryKey(),
  analysisId: text("analysis_id")
    .notNull()
    .unique()
    .references(() => analyses.id, { onDelete: "cascade" }),
  /** Deterministic weighted score 0–100 */
  score: real("score").notNull(),
  label: labelEnum("label").notNull(),
  /** Signal weights version used for fusion */
  weightsVersion: text("weights_version").notNull().default("v1"),
  /** Plain-language explanation from Nemotron */
  explanation: text("explanation"),
  screenshotUrl: text("screenshot_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});