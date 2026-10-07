"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  FileSearch,
  Globe2,
  Link2,
  ScanLine,
  ShieldCheck,
  Zap,
} from "lucide-react"
import { FreedomSection } from "@/src/components/FreedomSection"

const signals = [
  {
    icon: ScanLine,
    title: "QR & Quishing Extraction",
    description: "Decodes high-entropy matrix payloads deterministically before they reach the browser.",
  },
  {
    icon: Globe2,
    title: "Domain & Host Telemetry",
    description: "Evaluates WHOIS creation dates, DNS patterns, certificate transparency, and ASN risks.",
  },
  {
    icon: FileSearch,
    title: "Linguistic & Pressure Heuristics",
    description: "Scores artificial urgency, financial extortion terms, and brand impersonation vectors.",
  },
  {
    icon: BarChart3,
    title: "Deterministic Risk Fusion",
    description: "Synthesizes multi-stream evidence into a mathematically grounded threat index.",
  },
]

const steps = [
  {
    number: "01",
    title: "Submit Suspicious Artifact",
    text: "Provide an unvetted destination URL, SMS message text, QR graphic, or attachment.",
  },
  {
    number: "02",
    title: "Parallel Stream Telemetry",
    text: "PhishCatcher isolates visual page rendering, parses linguistic queues, and verifies infrastructure.",
  },
  {
    number: "03",
    title: "Clear Explainable Verdict",
    text: "Receive granular evidence scores and plain-language reasoning with zero guesswork.",
  },
]

const cardShadow = "0 3px 9.1px #3f4a7e0d, 0 1px 29px #3f4a7e1a"
const gradientTypography =
  "linear-gradient(90deg, rgb(43, 167, 255), rgb(202, 69, 255) 50%, rgb(254, 136, 27))"

export default function Home() {
  const scrollToSection = (sectionId: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <main
      className="min-h-screen w-full"
      style={{
        backgroundColor: "#ffffff",
        color: "rgb(26, 11, 84)",
        fontFamily: "'Mazzard H', sans-serif",
      }}
    >
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-black/[0.04] bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/" className="flex items-center gap-3">
            <span
              className="flex size-9 items-center justify-center rounded-xl"
              style={{
                backgroundColor: "rgb(249, 249, 249)",
                boxShadow: cardShadow,
              }}
            >
              <Image src="/logo.svg" alt="PhishCatcher" width={22} height={22} priority />
            </span>
            <span
              className="text-lg font-medium tracking-tight"
              style={{ color: "rgb(26, 11, 84)" }}
            >
              PhishCatcher
            </span>
          </Link>

          <nav className="hidden items-center gap-2 rounded-full px-3 py-1.5 md:flex" style={{ backgroundColor: "rgb(249, 249, 249)" }}>
            <a
              href="#freedom"
              onClick={scrollToSection("freedom")}
              className="rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
              style={{ color: "rgb(131, 121, 158)" }}
            >
              Comparison
            </a>
            <a
              href="#signals"
              onClick={scrollToSection("signals")}
              className="rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
              style={{ color: "rgb(131, 121, 158)" }}
            >
              Telemetry
            </a>
            <a
              href="#how-it-works"
              onClick={scrollToSection("how-it-works")}
              className="rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
              style={{ color: "rgb(131, 121, 158)" }}
            >
              Architecture
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="hidden text-sm font-medium sm:inline-block"
              style={{ color: "rgb(131, 121, 158)" }}
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white transition-opacity"
              style={{
                backgroundColor: "rgb(26, 11, 84)",
                boxShadow: "0 2px 10px rgba(26, 11, 84, 0.15)",
              }}
            >
              <span>Launch Dashboard</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative mx-auto flex max-w-5xl flex-col items-center px-6 pt-16 pb-12 text-center lg:px-10 lg:pt-24 lg:pb-16">
        {/* Badge Pill */}
        <div
          className="mb-8 inline-flex items-center gap-2 rounded-full text-sm font-medium"
          style={{
            backgroundColor: "rgb(249, 249, 249)",
            padding: "8px 18px",
            color: "rgb(26, 11, 84)",
            boxShadow: cardShadow,
          }}
        >
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: "rgb(200, 111, 255)" }}
          />
          <span>Multimodal Quishing & Threat Intelligence</span>
        </div>

        {/* Hero Title */}
        <h1
          className="font-medium tracking-tight"
          style={{
            fontSize: "clamp(38px, 5.2vw, 70px)",
            lineHeight: 1.1,
            color: "rgb(26, 11, 84)",
            margin: 0,
          }}
        >
          Stop absorbing the chaos.
          <br />
          <span
            style={{
              backgroundImage: gradientTypography,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "transparent",
              paddingBottom: "0.2vw",
              display: "inline-block",
            }}
          >
            Catch threats with confidence.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p
          className="mt-6 max-w-2xl text-base leading-relaxed sm:text-lg"
          style={{
            color: "rgb(131, 121, 158)",
            fontSize: "clamp(15px, 1.25vw, 19px)",
          }}
        >
          PhishCatcher fuses deterministic QR decoding, isolated remote cloud rendering,
          multimodal visual inference, and domain telemetry into explainable security signals.
        </p>

        {/* Call to Actions */}
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-8 py-3.5 text-base font-medium text-white transition-opacity"
            style={{
              backgroundColor: "rgb(26, 11, 84)",
              boxShadow: "0 4px 18px rgba(26, 11, 84, 0.2)",
            }}
          >
            <span>Start an Analysis</span>
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/dashboard/history"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-8 py-3.5 text-base font-medium transition-colors"
            style={{
              backgroundColor: "rgb(249, 249, 249)",
              color: "rgb(26, 11, 84)",
              boxShadow: cardShadow,
            }}
          >
            <span>View Recent Reports</span>
          </Link>
        </div>

        {/* Feature Highlights */}
        <div
          className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs font-medium"
          style={{ color: "rgb(131, 121, 158)" }}
        >
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="size-4" style={{ color: "rgb(43, 167, 255)" }} />
            <span>Deterministic barcode decoding</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="size-4" style={{ color: "rgb(202, 69, 255)" }} />
            <span>Cloud-isolated Browserbase sandbox</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <Zap className="size-4" style={{ color: "rgb(254, 136, 27)" }} />
            <span>No blind single-prompt verdicts</span>
          </span>
        </div>
      </section>

      {/* Freedom / Control Comparison Section with Centered Circular HLS Video */}
      <div id="freedom">
        <FreedomSection />
      </div>

      {/* Multimodal Telemetry Signals Grid */}
      <section
        id="signals"
        className="w-full"
        style={{
          backgroundColor: "#ffffff",
          padding: "clamp(48px, 6vw, 80px) clamp(16px, 3vw, 40px)",
        }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <div
              className="mb-4 inline-flex items-center gap-2 rounded-full text-xs font-medium uppercase tracking-wider"
              style={{
                backgroundColor: "rgb(249, 249, 249)",
                padding: "6px 14px",
                color: "rgb(26, 11, 84)",
                boxShadow: cardShadow,
              }}
            >
              <span>Multi-Stream Pipeline</span>
            </div>
            <h2
              className="font-medium tracking-tight"
              style={{
                fontSize: "clamp(28px, 3.2vw, 44px)",
                color: "rgb(26, 11, 84)",
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              Four independent streams.
              <br />
              <span
                style={{
                  backgroundImage: gradientTypography,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  color: "transparent",
                }}
              >
                Zero single-point blindness.
              </span>
            </h2>
            <p
              className="mt-4 text-base leading-relaxed"
              style={{
                color: "rgb(131, 121, 158)",
                fontSize: "clamp(14px, 1.1vw, 17px)",
              }}
            >
              Attacks rarely fail on just one indicator. PhishCatcher keeps deterministic and
              perceptual signals separated so the final report remains traceable.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {signals.map(({ icon: Icon, title, description }, idx) => (
              <div
                key={idx}
                className="flex flex-col rounded-[18px]"
                style={{
                  padding: "clamp(20px, 1.8vw, 28px)",
                  backgroundColor: "rgb(255, 255, 255)",
                  boxShadow: cardShadow,
                  gap: "16px",
                }}
              >
                <div
                  className="flex size-11 items-center justify-center rounded-2xl"
                  style={{
                    backgroundColor: "rgb(249, 249, 249)",
                    color: "rgb(26, 11, 84)",
                  }}
                >
                  <Icon className="size-5" />
                </div>
                <div>
                  <h3
                    className="font-medium text-base"
                    style={{ color: "rgb(26, 11, 84)", margin: "0 0 8px 0" }}
                  >
                    {title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{
                      color: "rgb(131, 121, 158)",
                      margin: 0,
                    }}
                  >
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Architecture */}
      <section
        id="how-it-works"
        className="w-full"
        style={{
          backgroundColor: "rgb(249, 249, 249)",
          padding: "clamp(48px, 6vw, 80px) clamp(16px, 3vw, 40px)",
        }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <div
                className="mb-4 inline-flex items-center gap-2 rounded-full text-xs font-medium uppercase tracking-wider"
                style={{
                  backgroundColor: "rgb(255, 255, 255)",
                  padding: "6px 14px",
                  color: "rgb(26, 11, 84)",
                  boxShadow: cardShadow,
                }}
              >
                <span>Detection Workflow</span>
              </div>
              <h2
                className="font-medium tracking-tight"
                style={{
                  fontSize: "clamp(28px, 3.2vw, 44px)",
                  color: "rgb(26, 11, 84)",
                  lineHeight: 1.2,
                  margin: 0,
                }}
              >
                From suspicious bait to
                <br />
                <span
                  style={{
                    backgroundImage: gradientTypography,
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    color: "transparent",
                  }}
                >
                  auditable threat intelligence.
                </span>
              </h2>
              <p
                className="mt-4 leading-relaxed"
                style={{
                  color: "rgb(131, 121, 158)",
                  fontSize: "clamp(14px, 1.1vw, 17px)",
                }}
              >
                Designed for security engineers and cautious teams. Every stage produces
                deterministic, reproducible telemetry before any summary is formatted.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="flex items-start gap-5 rounded-[18px]"
                  style={{
                    padding: "clamp(16px, 1.4vw, 22px)",
                    backgroundColor: "rgb(255, 255, 255)",
                    boxShadow: cardShadow,
                  }}
                >
                  <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-medium"
                    style={{
                      backgroundColor: "rgb(249, 249, 249)",
                      color: "rgb(202, 69, 255)",
                    }}
                  >
                    {step.number}
                  </span>
                  <div>
                    <h3
                      className="font-medium text-base"
                      style={{ color: "rgb(26, 11, 84)", margin: "0 0 6px 0" }}
                    >
                      {step.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "rgb(131, 121, 158)", margin: 0 }}
                    >
                      {step.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Catch Surface Section */}
      <section
        className="w-full"
        style={{
          backgroundColor: "#ffffff",
          padding: "clamp(48px, 6vw, 80px) clamp(16px, 3vw, 40px)",
        }}
      >
        <div
          className="mx-auto max-w-5xl rounded-[24px]"
          style={{
            backgroundColor: "rgb(26, 11, 84)",
            padding: "clamp(36px, 4.5vw, 64px) clamp(24px, 3.5vw, 56px)",
            boxShadow: "0 10px 40px rgba(26, 11, 84, 0.25)",
            color: "#ffffff",
          }}
        >
          <div className="flex flex-col items-center justify-between gap-8 text-center lg:flex-row lg:text-left">
            <div>
              <div
                className="mb-3 inline-flex items-center gap-2 rounded-full text-xs font-medium uppercase tracking-wider"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.12)",
                  padding: "6px 14px",
                  color: "#ffffff",
                }}
              >
                <span>Zero Installation Required</span>
              </div>
              <h2
                className="font-medium tracking-tight text-white"
                style={{
                  fontSize: "clamp(28px, 3vw, 42px)",
                  lineHeight: 1.2,
                  margin: "0 0 12px 0",
                }}
              >
                Inspect suspicious vectors now.
              </h2>
              <p
                className="max-w-xl text-sm leading-relaxed sm:text-base"
                style={{ color: "rgba(255, 255, 255, 0.75)", margin: 0 }}
              >
                Drop a suspicious link, quishing flyer, or text payload into the
                multimodal sandbox to view live execution proof and domain metrics.
              </p>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full px-8 py-3.5 text-base font-medium transition-opacity"
              style={{
                backgroundColor: "#ffffff",
                color: "rgb(26, 11, 84)",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.12)",
              }}
            >
              <span>Open Scanner</span>
              <Link2 className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Clean Footer */}
      <footer
        className="w-full border-t border-black/[0.05]"
        style={{
          backgroundColor: "#ffffff",
          padding: "28px clamp(16px, 3vw, 40px)",
        }}
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-xs sm:flex-row">
          <div className="flex items-center gap-2 font-medium" style={{ color: "rgb(26, 11, 84)" }}>
            <Image src="/logo.svg" alt="" width={18} height={18} />
            <span>PhishCatcher</span>
          </div>
          <div style={{ color: "rgb(131, 121, 158)" }}>
            Deterministic quishing decoding, cloud sandboxing, and explainable risk.
          </div>
        </div>
      </footer>
    </main>
  )
}