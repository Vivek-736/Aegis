"use client"

import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  Anchor,
  BarChart3,
  CheckCircle2,
  FileSearch,
  Fish,
  Globe2,
  Link2,
  ScanLine,
  ShieldCheck,
  Waves,
} from "lucide-react"
import { motion } from "motion/react"
import { ThemeToggle } from "@/components/theme-toggle"
import { buttonVariants } from "@/components/ui/button"

const signals = [
  {
    icon: ScanLine,
    title: "QR + link decoding",
    description: "Uncover hidden destinations before they can pull you off course.",
    tone: "bg-muted text-muted-foreground",
  },
  {
    icon: Globe2,
    title: "Domain intelligence",
    description: "Read the infrastructure signals behind every suspicious URL.",
    tone: "bg-muted text-muted-foreground",
  },
  {
    icon: FileSearch,
    title: "Language clues",
    description: "Spot urgency, impersonation, and the pressure tactics in a message.",
    tone: "bg-muted text-muted-foreground",
  },
  {
    icon: BarChart3,
    title: "Explainable risk",
    description: "Get a clear catch report instead of a mysterious yes or no.",
    tone: "bg-muted text-muted-foreground",
  },
]

const steps = [
  { number: "01", title: "Drop the bait", text: "Paste a URL, message, or upload an image." },
  { number: "02", title: "Read the wake", text: "PhishCatcher separates language, link, and visual clues." },
  { number: "03", title: "Make the call", text: "Review the evidence and decide what is safe to do next." },
]

const bubbles = [
  { left: "8%", bottom: "-1rem", size: 7, drift: -18, delay: 0, duration: 7 },
  { left: "17%", bottom: "-2rem", size: 13, drift: 24, delay: 2.4, duration: 9 },
  { left: "29%", bottom: "-1rem", size: 5, drift: -12, delay: 1.2, duration: 6 },
  { left: "39%", bottom: "-3rem", size: 18, drift: 20, delay: 4.1, duration: 11 },
  { left: "51%", bottom: "-1rem", size: 8, drift: -16, delay: 3.2, duration: 8 },
  { left: "63%", bottom: "-2rem", size: 12, drift: 28, delay: 0.8, duration: 10 },
  { left: "74%", bottom: "-1rem", size: 6, drift: -22, delay: 5, duration: 7 },
  { left: "86%", bottom: "-3rem", size: 16, drift: 16, delay: 2, duration: 12 },
] as const

const heroSideBubbles = [
  { side: "left", top: "32%", offset: "7%", size: 24, drift: 20, delay: 0, duration: 8 },
  { side: "left", top: "68%", offset: "14%", size: 13, drift: -15, delay: 3, duration: 7 },
  { side: "right", top: "42%", offset: "8%", size: 30, drift: -22, delay: 1.4, duration: 10 },
  { side: "right", top: "76%", offset: "15%", size: 16, drift: 14, delay: 4, duration: 8 },
] as const

function WaterBubbles({ travel = 270, subtle = false }: { travel?: number; subtle?: boolean }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {bubbles.map((bubble) => (
        <motion.span
          key={`${bubble.left}-${bubble.size}-${travel}`}
          className={`absolute rounded-full border border-foreground/25 bg-foreground/10 shadow-[inset_2px_2px_3px_color-mix(in_srgb,var(--foreground)_35%,transparent)] after:absolute after:left-1 after:top-1 after:size-1 after:rounded-full after:bg-card/80 ${subtle ? "opacity-60" : ""}`}
          style={{ left: bubble.left, bottom: bubble.bottom, width: bubble.size, height: bubble.size }}
          animate={{ y: [0, -travel], x: [0, bubble.drift, bubble.drift / 2], opacity: subtle ? [0, 0.35, 0] : [0, 0.7, 0] }}
          transition={{ duration: bubble.duration, delay: bubble.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  )
}

export default function Home() {
  const scrollToSection = (sectionId: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <motion.main
      className="app-shell min-h-screen overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-80 bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_srgb,#3b82f6_6%,transparent),transparent_70%)]" />

      <nav className="relative z-10 mx-4 mt-4 flex w-auto max-w-7xl items-center justify-between rounded-full border border-border bg-card/80 px-4 py-3 shadow-sm backdrop-blur-xl sm:mx-8 sm:px-6 lg:mx-auto lg:px-8">
        <a href="#top" className="flex items-center gap-3" aria-label="PhishCatcher home">
          <span className="flex size-9 items-center justify-center rounded-xl border border-border bg-card shadow-sm">
            <Image src="/logo.svg" alt="" width={25} height={25} priority />
          </span>
          <span className="text-base font-bold tracking-tight text-foreground">PhishCatcher</span>
        </a>

        <div className="hidden items-center gap-1 rounded-full border border-border/60 bg-background/35 p-1 text-sm font-semibold text-foreground/75 shadow-sm md:flex">
          <a className="rounded-full px-4 py-2 transition-colors hover:bg-card hover:text-foreground" href="#signals" onClick={scrollToSection("signals")}>Signals</a>
          <a className="rounded-full px-4 py-2 transition-colors hover:bg-card hover:text-foreground" href="#how-it-works" onClick={scrollToSection("how-it-works")}>How it works</a>
          <a className="rounded-full px-4 py-2 transition-colors hover:bg-card hover:text-foreground" href="#scanner" onClick={scrollToSection("scanner")}>Scanner</a>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/dashboard" className={`${buttonVariants({ size: "sm" })} hidden sm:inline-flex`}>Start a catch <ArrowRight /></Link>
        </div>
      </nav>

      <section id="top" className="relative z-10 mx-auto max-w-7xl scroll-mt-24 px-5 pb-20 pt-12 sm:px-8 sm:pt-20 lg:px-10 lg:pb-28 lg:pt-24">
        <motion.div
          className="mx-auto max-w-5xl text-center"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, y: 42 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 1.45, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.15 },
            },
          }}
        >
          <motion.h1 variants={{ hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0 } }} className="mx-auto max-w-5xl text-5xl font-bold leading-[0.98] tracking-[-0.04em] text-foreground sm:text-7xl">
            Don&apos;t take the bait.
            <span className="mt-2 block text-[#3b82f6]">Catch the phish.</span>
          </motion.h1>
          <motion.p variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="mx-auto mt-7 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            PhishCatcher turns suspicious links, messages, QR codes, and screenshots into calm, explainable signals you can act on.
          </motion.p>
          <motion.div variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }} className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/dashboard" className={`${buttonVariants({ size: "lg" })} min-h-12 px-8`}>Go to Dashboard <ArrowRight /></Link>
            <Link href="/dashboard" className={`${buttonVariants({ size: "lg", variant: "outline" })} min-h-12 px-8`}>View Analysis History</Link>
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-muted-foreground">
            <span className="inline-flex items-center gap-2"><CheckCircle2 className="size-4 text-[#3b82f6]" /> No account to explore</span>
            <span className="inline-flex items-center gap-2"><ShieldCheck className="size-4 text-[#3b82f6]" /> Evidence-first analysis</span>
          </motion.div>
        </motion.div>

        <motion.div
          className="relative mx-auto mt-14 w-full max-w-3xl"
          initial={{ opacity: 0, y: 52, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.7, duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-muted/30 blur-3xl" />
          <div className="relative overflow-hidden rounded-4xl border border-border bg-card p-4 shadow-xl sm:p-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                <Waves className="size-4 text-[#3b82f6]" />
                Live catch preview
              </div>
              <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold text-muted-foreground">READY</span>
            </div>
            <div className="relative flex min-h-96 items-center justify-center overflow-hidden rounded-2xl bg-secondary/60 p-6 sm:min-h-108">
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(to_top,color-mix(in_srgb,var(--muted)_30%,transparent),transparent)]" />
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-x-16 bottom-8 h-24 rounded-[50%] border border-foreground/10"
                animate={{ x: [-18, 18, -18], scaleX: [1, 1.08, 1] }}
                transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-x-10 bottom-20 h-16 rounded-[50%] border border-foreground/5"
                animate={{ x: [20, -20, 20], scaleX: [1.06, 1, 1.06] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              />
              <WaterBubbles />
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                {heroSideBubbles.map((bubble) => (
                  <motion.span
                    key={`${bubble.side}-${bubble.top}`}
                    className="absolute rounded-full border-2 border-foreground/20 bg-foreground/10 shadow-[inset_3px_3px_5px_color-mix(in_srgb,var(--foreground)_35%,transparent)] after:absolute after:left-1/4 after:top-1/4 after:size-1.5 after:rounded-full after:bg-card/80"
                    style={{
                      top: bubble.top,
                      left: bubble.side === "left" ? bubble.offset : undefined,
                      right: bubble.side === "right" ? bubble.offset : undefined,
                      width: bubble.size,
                      height: bubble.size,
                    }}
                    animate={{ y: [0, -100, -185], x: [0, bubble.drift, bubble.drift / 2], opacity: [0, 0.65, 0] }}
                    transition={{ duration: bubble.duration, delay: bubble.delay, repeat: Infinity, ease: "easeInOut" }}
                  />
                ))}
              </div>
              <div className="absolute left-8 top-10 size-2 rounded-full bg-phish-sky opacity-80" />
              <div className="absolute right-10 top-24 size-3 rounded-full bg-phish-sky opacity-80" />
              <div className="absolute bottom-10 left-1/4 size-1.5 rounded-full bg-phish-sky" />
              <div className="absolute left-8 top-1/2 hidden -translate-y-1/2 flex-col gap-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground sm:flex">
                <span className="rounded-lg border border-border bg-card/75 px-3 py-2">URL signal <strong className="ml-1 text-primary">active</strong></span>
                <span className="rounded-lg border border-border bg-card/75 px-3 py-2">QR scan <strong className="ml-1 text-primary">ready</strong></span>
              </div>
              <div className="absolute right-8 top-1/2 hidden -translate-y-1/2 flex-col gap-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground sm:flex">
                <span className="rounded-lg border border-border bg-card/75 px-3 py-2">Trust map <strong className="ml-1 text-primary">clear</strong></span>
                <span className="rounded-lg border border-border bg-card/75 px-3 py-2">Evidence <strong className="ml-1 text-primary">linked</strong></span>
              </div>
              <div className="relative flex flex-col items-center gap-3">
                <div className="relative flex size-36 items-center justify-center rounded-full border border-primary/30 bg-card/80 shadow-xl shadow-primary/20 sm:size-44">
                  <div className="absolute inset-3 rounded-full border border-dashed border-primary/30" />
                  <div className="absolute inset-0 rounded-full border border-primary/10 transform-[rotate(24deg)_scale(1.18)]" />
                  <div className="absolute inset-0 rounded-full border border-primary/10 transform-[rotate(-24deg)_scale(1.18)]" />
                  <Image src="/logo.svg" alt="PhishCatcher fish" width={104} height={104} className="relative rounded-4xl" />
                </div>
                <div className="relative h-24 w-40">
                  <div className="absolute left-1/2 top-0 h-8 w-px -translate-x-1/2 bg-primary/50" />
                  <div className="absolute left-1/2 top-7 flex size-10 -translate-x-1/2 items-center justify-center rounded-full border-2 border-primary bg-card shadow-lg shadow-primary/20">
                    <span className="size-2 rounded-full bg-muted" />
                  </div>
                  <motion.div
                    className="absolute left-1/2 top-14 -translate-x-1/2 text-primary"
                    animate={{ y: [0, 5, 0], rotate: [0, -4, 0] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Anchor className="size-12" strokeWidth={1.5} />
                  </motion.div>
                </div>
                <div className="rounded-full border border-border bg-card/90 px-4 py-2 text-xs font-semibold text-foreground shadow-sm">
                  Hook suspicious signals before they hook you
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-4 text-center">
              {["QR decoded", "URL normalized", "Risk explained"].map((label) => (
                <div key={label} className="rounded-xl bg-muted px-2 py-3 text-[11px] font-semibold text-muted-foreground">
                  <CheckCircle2 className="mx-auto mb-1 size-4 text-primary" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <section id="signals" className="relative z-10 scroll-mt-24 border-y border-border bg-muted/30 px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3b82f6]">Four ways to read the water</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">One catch. More than one clue.</h2>
            <p className="mt-4 text-muted-foreground">A suspicious message is rarely suspicious for just one reason. PhishCatcher keeps the evidence streams distinct so the result stays useful.</p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {signals.map(({ icon: Icon, title, description }) => (
              <article key={title} className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                <div className="mb-5 flex size-11 items-center justify-center rounded-2xl bg-foreground text-background">
                  <Icon className="size-5" />
                </div>
                <h3 className="font-bold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="relative z-10 mx-auto max-w-7xl scroll-mt-24 px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-foreground text-background shadow-lg">
              <Fish className="size-6" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">From suspicious splash to clear signal.</h2>
            <p className="mt-4 max-w-md leading-7 text-muted-foreground">The interface is designed to help people slow down, inspect the evidence, and make a safer call.</p>
          </div>
          <div className="grid gap-3">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-5 rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
                <span className="font-mono text-sm font-bold text-[#3b82f6] shrink-0">{step.number}</span>
                <div><h3 className="font-bold text-foreground">{step.title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{step.text}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="scanner" className="relative z-10 mx-5 mb-16 scroll-mt-24 overflow-hidden rounded-3xl border border-border bg-foreground px-6 py-12 text-background shadow-2xl sm:mx-8 sm:px-10 lg:mx-auto lg:max-w-7xl lg:px-14 lg:py-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_50%,color-mix(in_srgb,#3b82f6_15%,transparent),transparent_60%)]" />
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-background/50">Ready when you are</p>
            <h2 className="mt-3 max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">Cast your first line.</h2>
            <p className="mt-3 max-w-xl text-background/60">The scanner is the next step in the build. Start with a suspicious URL, message, image, or QR code.</p>
          </div>
          <Link href="/dashboard" className={`${buttonVariants({ size: "lg", variant: "secondary" })} w-full shrink-0 border-background/20 bg-background text-foreground hover:bg-background/90 sm:w-auto`}>Open the catch surface <Link2 /></Link>
        </div>
      </section>

      <footer className="relative mx-auto flex max-w-7xl flex-col gap-3 border-t border-border px-5 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
        <span className="font-semibold text-foreground">PhishCatcher</span>
        <span>Pause. Inspect. Stay above the hook.</span>
      </footer>
    </motion.main>
  )
}