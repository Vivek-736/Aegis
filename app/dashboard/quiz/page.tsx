"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Globe2,
  RotateCcw,
  XCircle,
  Zap,
} from "lucide-react";
import { QUESTIONS, type QuizQuestion } from "@/lib/quiz/questions";
import {
  INITIAL_PROFILE,
  BADGES,
  PHISHING_TYPES_DATA,
  TRUST_TRAP_SCENARIOS,
  SOCIAL_ENG_SCENARIOS,
  BOSS_SCENARIO,
  type DetectiveStage,
  type LearningMode,
  type DetectiveProfile,
} from "@/lib/detective/master-data";
import { URL_CHALLENGES } from "@/lib/detective/types";

const cardShadow = "0 3px 9.1px #3f4a7e0d, 0 1px 29px #3f4a7e1a";
const gradientTypography =
  "linear-gradient(90deg, rgb(43, 167, 255), rgb(202, 69, 255) 50%, rgb(254, 136, 27))";

const STORAGE_KEY = "phishcatcher_detective_master_profile";

function drawTenQuestions(): QuizQuestion[] {
  const pool = [...QUESTIONS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 10);
}

function categoryLabel(q: QuizQuestion): string {
  return q.category.replace(/-/g, " ");
}

export default function PhishingDetectiveMasterPage() {
  const [stage, setStage] = useState<DetectiveStage>("hero");
  const [learningMode, setLearningMode] = useState<LearningMode>("detective");

  // Profile / Gamification State
  const [profile, setProfile] = useState<DetectiveProfile>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return { ...INITIAL_PROFILE, ...JSON.parse(saved) };
      } catch {
        // Fallback
      }
    }
    return INITIAL_PROFILE;
  });

  const updateProfile = (updater: (prev: DetectiveProfile) => DetectiveProfile) => {
    setProfile((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  // 1. Intro interactive state
  const [introFoundFlags, setIntroFoundFlags] = useState<{ [key: string]: boolean }>({});

  // 2. Types accordion
  const [activeTypeTab, setActiveTypeTab] = useState<string>("email");

  // 3. Spot Red Flags mini-game
  const [gameFoundFlags, setGameFoundFlags] = useState<{ [key: string]: boolean }>({
    sender: false,
    subject: false,
    urgency: false,
    link: false,
    threat: false,
    credentials: false,
  });

  // 4. URL lab
  const [selectedUrlId, setSelectedUrlId] = useState<number>(4);

  // 5. Trust or Trap state
  const [trustTrapIdx, setTrustTrapIdx] = useState(0);
  const [trustTrapChoice, setTrustTrapChoice] = useState<"trust" | "phish" | "investigate" | null>(null);
  const [showTrustClues, setShowTrustClues] = useState(false);

  // 6. Social Engineering state
  const [socialIdx, setSocialIdx] = useState(0);
  const [selectedSocialOpt, setSelectedSocialOpt] = useState<string | null>(null);

  // 7. Human vs AI state
  const [humanConfidence, setHumanConfidence] = useState(50);
  const [aiScanning, setAiScanning] = useState(false);
  const [aiScanComplete, setAiScanComplete] = useState(false);

  // 8. Quiz state
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizPicks, setQuizPicks] = useState<(number | null)[]>([]);

  // 9. Boss challenge state
  const [bossCluesFound, setBossCluesFound] = useState<{ [key: string]: boolean }>({});
  const [bossSelectedAction, setBossSelectedAction] = useState<number | null>(null);

  // Navigation Helper
  const navigateTo = (nextStage: DetectiveStage) => {
    setStage(nextStage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Trigger Intro Red Flag
  const toggleIntroFlag = (id: string) => {
    if (!introFoundFlags[id]) {
      setIntroFoundFlags((prev) => ({ ...prev, [id]: true }));
      updateProfile((p) => ({ ...p, xp: p.xp + 5, redFlagsFound: p.redFlagsFound + 1 }));
    }
  };

  // Trigger Game Red Flag
  const toggleGameFlag = (id: string) => {
    if (!gameFoundFlags[id]) {
      setGameFoundFlags((prev) => ({ ...prev, [id]: true }));
      updateProfile((p) => {
        const count = p.redFlagsFound + 1;
        const badges = count >= 5 && !p.unlockedBadges.includes("red_flag_hunter")
          ? [...p.unlockedBadges, "red_flag_hunter"]
          : p.unlockedBadges;
        return {
          ...p,
          xp: p.xp + 5,
          redFlagsFound: count,
          unlockedBadges: badges,
        };
      });
    }
  };

  // Start Human vs AI scan simulation
  const runAiScan = () => {
    setAiScanning(true);
    setTimeout(() => {
      setAiScanning(false);
      setAiScanComplete(true);
      updateProfile((p) => {
        const badges = !p.unlockedBadges.includes("ai_challenger")
          ? [...p.unlockedBadges, "ai_challenger"]
          : p.unlockedBadges;
        return {
          ...p,
          xp: p.xp + 15,
          unlockedBadges: badges,
        };
      });
    }, 1200);
  };

  // Launch Scenario Quiz
  const launchQuiz = () => {
    setQuizQuestions(drawTenQuestions());
    setQuizIdx(0);
    setQuizPicks(Array(10).fill(null));
    navigateTo("quiz");
  };

  // Handle Quiz selection
  const handleQuizAnswer = (optIdx: number) => {
    if (quizPicks[quizIdx] !== null) return;
    const isCorrect = optIdx === quizQuestions[quizIdx].answer;

    setQuizPicks((prev) => prev.map((p, i) => (i === quizIdx ? optIdx : p)));

    updateProfile((p) => {
      const newCorrect = isCorrect ? p.correctAnswers + 1 : p.correctAnswers;
      const total = p.questionsCompleted + 1;
      const acc = Math.round((newCorrect / total) * 100);
      const newStreak = isCorrect ? p.streak + 1 : 0;
      return {
        ...p,
        xp: p.xp + (isCorrect ? 10 : 0),
        correctAnswers: newCorrect,
        questionsCompleted: total,
        accuracy: acc,
        streak: newStreak,
      };
    });
  };

  // Unlock Boss Level
  const unlockBoss = () => {
    navigateTo("boss");
  };

  // Unlock Boss Clue
  const toggleBossClue = (toolId: string) => {
    setBossCluesFound((prev) => ({ ...prev, [toolId]: true }));
    updateProfile((p) => ({ ...p, xp: p.xp + 5 }));
  };

  // Complete Boss Challenge
  const handleBossAction = (actionIdx: number) => {
    setBossSelectedAction(actionIdx);
    const isCorrect = BOSS_SCENARIO.actions[actionIdx].correct;
    if (isCorrect) {
      updateProfile((p) => {
        const badges = !p.unlockedBadges.includes("phishing_defender")
          ? [...p.unlockedBadges, "phishing_defender"]
          : p.unlockedBadges;
        return {
          ...p,
          xp: p.xp + 35,
          level: Math.min(5, p.level + 1),
          unlockedBadges: badges,
        };
      });
    }
  };

  const STAGES_LIST: { id: DetectiveStage; label: string }[] = [
    { id: "hero", label: "Briefing" },
    { id: "intro", label: "1. Basics" },
    { id: "types", label: "2. Gallery" },
    { id: "redflags", label: "3. Red Flags" },
    { id: "url_lab", label: "4. URL Lab" },
    { id: "trust_trap", label: "5. Trust/Trap" },
    { id: "social_eng", label: "6. Social Eng" },
    { id: "human_ai", label: "7. AI Challenge" },
    { id: "quiz", label: "8. Scenarios" },
    { id: "boss", label: "9. Boss Level" },
    { id: "results", label: "10. Case Report" },
  ];

  const currentStageIndex = STAGES_LIST.findIndex((s) => s.id === stage);

  return (
    <div
      className="min-h-screen w-full px-6 py-10 lg:px-12"
      style={{
        backgroundColor: "#ffffff",
        color: "rgb(26, 11, 84)",
        fontFamily: "'Mazzard H', sans-serif",
      }}
    >
      <div className="mx-auto max-w-5xl">
        {/* Top Gamification HUD */}
        <header
          className="mb-8 rounded-[18px] p-4 flex flex-wrap items-center justify-between gap-4"
          style={{
            backgroundColor: "rgb(249, 249, 249)",
            boxShadow: cardShadow,
            border: "1px solid rgba(0, 0, 0, 0.04)",
          }}
        >
          <div className="flex items-center gap-3">
            <span
              className="flex size-10 items-center justify-center rounded-xl text-lg"
              style={{
                backgroundColor: "#ffffff",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
              }}
            >
              🕵
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium tracking-tight" style={{ color: "rgb(26, 11, 84)" }}>
                  PHISHING DETECTIVE
                </span>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{ backgroundColor: "rgba(200, 111, 255, 0.15)", color: "rgb(200, 111, 255)" }}
                >
                  Level 0{profile.level}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-black/[0.08]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, (profile.xp % 100))}%`,
                      backgroundImage: gradientTypography,
                    }}
                  />
                </div>
                <span className="text-[11px]" style={{ color: "rgb(131, 121, 158)" }}>
                  {profile.xp % 100}/100 XP to next tier
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="text-center">
              <span className="block text-[10px] uppercase text-[#83799E]">Total XP</span>
              <strong className="text-sm" style={{ color: "rgb(26, 11, 84)" }}>{profile.xp}</strong>
            </div>
            <div className="text-center">
              <span className="block text-[10px] uppercase text-[#83799E]">Streak</span>
              <strong className="text-sm text-[#FE881B]">🔥 {profile.streak}</strong>
            </div>
            <div className="text-center">
              <span className="block text-[10px] uppercase text-[#83799E]">Accuracy</span>
              <strong className="text-sm text-[#2BA7FF]">{profile.accuracy}%</strong>
            </div>
            <div className="text-center">
              <span className="block text-[10px] uppercase text-[#83799E]">Badges</span>
              <strong className="text-sm text-[#CA45FF]">{profile.unlockedBadges.length}/{BADGES.length}</strong>
            </div>
          </div>
        </header>

        {/* Progress Step Bar */}
        {stage !== "hero" && (
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs font-medium mb-2">
              <span style={{ color: "rgb(131, 121, 158)" }}>
                Active Section: <strong>{STAGES_LIST[currentStageIndex]?.label}</strong>
              </span>
              <span style={{ color: "rgb(26, 11, 84)" }}>
                Step {currentStageIndex} of {STAGES_LIST.length - 1}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/[0.04]">
              <div
                className="h-full transition-all duration-300 rounded-full"
                style={{
                  width: `${(currentStageIndex / (STAGES_LIST.length - 1)) * 100}%`,
                  backgroundImage: gradientTypography,
                }}
              />
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            1. HERO & MODE SELECTOR
            ══════════════════════════════════════════════════════ */}
        {stage === "hero" && (
          <div className="flex flex-col items-center text-center pt-4 pb-12">
            <div
              className="mb-5 inline-flex items-center gap-2 rounded-full text-xs font-medium uppercase tracking-wider"
              style={{
                backgroundColor: "rgb(249, 249, 249)",
                padding: "6px 14px",
                color: "rgb(26, 11, 84)",
                boxShadow: cardShadow,
              }}
            >
              <span className="size-1.5 rounded-full" style={{ backgroundColor: "rgb(200, 111, 255)" }} />
              <span>Interactive Threat Intelligence Simulator</span>
            </div>

            <h1
              className="font-medium tracking-tight"
              style={{
                fontSize: "clamp(34px, 4.5vw, 56px)",
                color: "rgb(26, 11, 84)",
                lineHeight: 1.15,
                margin: 0,
              }}
            >
              Can You Spot the Phish?
              <br />
              <span
                style={{
                  backgroundImage: gradientTypography,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  color: "transparent",
                  display: "inline-block",
                  paddingBottom: "0.2vw",
                }}
              >
                Think like the attacker. Defend like an analyst.
              </span>
            </h1>

            <p
              className="mx-auto mt-4 max-w-2xl text-base leading-relaxed"
              style={{ color: "rgb(131, 121, 158)" }}
            >
              Phishing attacks are designed to trick you into trusting something that isn&apos;t what it seems.
              Learn the warning signs, investigate suspicious messages, calibrate with AI detectors, and defeat the Boss Level.
            </p>

            {/* Mode selection buttons */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl text-left">
              {[
                { id: "detective" as LearningMode, title: "Detective Game", time: "8 min full mission", icon: "🕵" },
                { id: "quick" as LearningMode, title: "Quick Learn", time: "3 min crash course", icon: "⚡" },
                { id: "deep" as LearningMode, title: "Deep Dive", time: "All 8 attack vectors", icon: "📚" },
                { id: "quiz_only" as LearningMode, title: "Jump to Quiz", time: "10 scenario exam", icon: "🎯" },
              ].map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => {
                    setLearningMode(mode.id);
                    if (mode.id === "quiz_only") launchQuiz();
                    else if (mode.id === "deep") navigateTo("types");
                    else navigateTo("intro");
                  }}
                  className="rounded-[18px] p-4 text-left transition-all hover:scale-[1.02]"
                  style={{
                    backgroundColor: learningMode === mode.id ? "#ffffff" : "rgb(249, 249, 249)",
                    boxShadow: cardShadow,
                    border: learningMode === mode.id ? "2px solid rgb(200, 111, 255)" : "1px solid rgba(0, 0, 0, 0.04)",
                  }}
                >
                  <span className="text-xl mb-1 block">{mode.icon}</span>
                  <strong className="block text-xs text-[#1A0B54]">{mode.title}</strong>
                  <span className="text-[11px] text-[#83799E]">{mode.time}</span>
                </button>
              ))}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => navigateTo("intro")}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-9 py-3.5 text-base font-medium text-white transition-opacity"
                style={{
                  backgroundColor: "rgb(26, 11, 84)",
                  boxShadow: "0 4px 18px rgba(26, 11, 84, 0.2)",
                }}
              >
                <span>START INVESTIGATION</span>
                <ArrowRight className="size-4" />
              </button>

              <button
                type="button"
                onClick={() => navigateTo("types")}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: "rgb(249, 249, 249)",
                  color: "rgb(26, 11, 84)",
                  boxShadow: cardShadow,
                }}
              >
                <span>HOW PHISHING WORKS</span>
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            2. MODULE 1 — WHAT IS PHISHING? (Interactive First Lesson)
            ══════════════════════════════════════════════════════ */}
        {stage === "intro" && (
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto">
              <div
                className="mb-3 inline-flex items-center gap-2 rounded-full text-xs font-medium uppercase tracking-wider"
                style={{ backgroundColor: "rgb(249, 249, 249)", padding: "6px 14px", color: "rgb(26, 11, 84)", boxShadow: cardShadow }}
              >
                <span>Module 1 — Foundations</span>
              </div>
              <h2 className="text-3xl font-medium tracking-tight" style={{ color: "rgb(26, 11, 84)", margin: 0 }}>
                What is Phishing?
              </h2>
              <p className="mt-2 text-sm" style={{ color: "rgb(131, 121, 158)" }}>
                Phishing uses social engineering to manipulate human trust. Click the highlighted areas on this simulated alert to uncover how psychological pressure works.
              </p>
            </div>

            <div
              className="rounded-[18px] p-6 lg:p-8 space-y-4"
              style={{
                backgroundColor: "#ffffff",
                boxShadow: cardShadow,
                border: "1px solid rgba(0, 0, 0, 0.05)",
              }}
            >
              <div
                onClick={() => toggleIntroFlag("urgency")}
                className={`cursor-pointer rounded-xl p-3 transition-all ${
                  introFoundFlags.urgency ? "bg-[rgba(254,136,27,0.1)] ring-2 ring-[#FE881B]" : "bg-[#F9F9F9] hover:bg-black/[0.03]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <strong className="text-sm text-[#1A0B54]">🚨 &quot;URGENT: Your account will be suspended in 24 hours.&quot;</strong>
                  <span className="text-[11px] text-[#83799E]">Click to inspect</span>
                </div>
                {introFoundFlags.urgency && (
                  <p className="mt-2 text-xs text-[#1A0B54] border-t border-black/[0.04] pt-2 leading-relaxed">
                    <strong>Urgency Manipulation:</strong> Attackers create an artificial ticking clock so victims act before thinking critically or verifying facts.
                  </p>
                )}
              </div>

              <div
                onClick={() => toggleIntroFlag("sender")}
                className={`cursor-pointer rounded-xl p-3 transition-all ${
                  introFoundFlags.sender ? "bg-[rgba(200,111,255,0.1)] ring-2 ring-[#CA45FF]" : "bg-[#F9F9F9] hover:bg-black/[0.03]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#1A0B54]">From: billing-support@micr0soft-cloud-update.info</span>
                  <span className="text-[11px] text-[#83799E]">Click to inspect</span>
                </div>
                {introFoundFlags.sender && (
                  <p className="mt-2 text-xs text-[#1A0B54] border-t border-black/[0.04] pt-2 leading-relaxed">
                    <strong>Lookalike Subdomain Typosquat:</strong> The zero (&apos;0&apos;) and unvetted .info domain mimic Microsoft but are owned by an attacker.
                  </p>
                )}
              </div>

              <div
                onClick={() => toggleIntroFlag("link")}
                className={`cursor-pointer rounded-xl p-3 transition-all ${
                  introFoundFlags.link ? "bg-[rgba(43,167,255,0.1)] ring-2 ring-[#2BA7FF]" : "bg-[#F9F9F9] hover:bg-black/[0.03]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#1A0B54]">Action Button: [ VERIFY CREDENTIALS NOW ]</span>
                  <span className="text-[11px] text-[#83799E]">Click to inspect</span>
                </div>
                {introFoundFlags.link && (
                  <p className="mt-2 text-xs text-[#1A0B54] border-t border-black/[0.04] pt-2 leading-relaxed">
                    <strong>Credential Harvesting Portal:</strong> Clicking routes to an unauthorized credential collection form instead of official corporate SSO.
                  </p>
                )}
              </div>

              <div
                onClick={() => toggleIntroFlag("attachment")}
                className={`cursor-pointer rounded-xl p-3 transition-all ${
                  introFoundFlags.attachment ? "bg-[rgba(239,68,68,0.08)] ring-2 ring-red-400" : "bg-[#F9F9F9] hover:bg-black/[0.03]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#1A0B54]">Attachment: invoice_overdue_patch.iso (5.2 MB)</span>
                  <span className="text-[11px] text-[#83799E]">Click to inspect</span>
                </div>
                {introFoundFlags.attachment && (
                  <p className="mt-2 text-xs text-[#1A0B54] border-t border-black/[0.04] pt-2 leading-relaxed">
                    <strong>Containerized Malware Vector:</strong> Disc image files (.iso) are used to bypass standard antivirus scanners and execute malware silently.
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <span className="text-xs font-medium" style={{ color: "rgb(131, 121, 158)" }}>
                {Object.keys(introFoundFlags).length} of 4 clues unlocked
              </span>
              <button
                type="button"
                onClick={() => navigateTo("types")}
                className="inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-medium text-white transition-opacity"
                style={{
                  backgroundColor: "rgb(26, 11, 84)",
                  boxShadow: "0 4px 14px rgba(26, 11, 84, 0.2)",
                }}
              >
                <span>Phishing Attack Gallery</span>
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            3. MODULE 2 — PHISHING ATTACK GALLERY (8 Types)
            ══════════════════════════════════════════════════════ */}
        {stage === "types" && (
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto">
              <div
                className="mb-3 inline-flex items-center gap-2 rounded-full text-xs font-medium uppercase tracking-wider"
                style={{ backgroundColor: "rgb(249, 249, 249)", padding: "6px 14px", color: "rgb(26, 11, 84)", boxShadow: cardShadow }}
              >
                <span>Module 2 — Attack Anatomy</span>
              </div>
              <h2 className="text-3xl font-medium tracking-tight" style={{ color: "rgb(26, 11, 84)", margin: 0 }}>
                Phishing Attack Gallery
              </h2>
              <p className="mt-2 text-sm" style={{ color: "rgb(131, 121, 158)" }}>
                Explore the 8 fundamental vectors used by modern threat actors.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PHISHING_TYPES_DATA.map((t) => {
                const isSelected = activeTypeTab === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setActiveTypeTab(isSelected ? "" : t.id)}
                    className="cursor-pointer rounded-[18px] p-5 transition-all"
                    style={{
                      backgroundColor: "#ffffff",
                      boxShadow: cardShadow,
                      border: isSelected ? "2px solid rgb(200, 111, 255)" : "1px solid rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase px-2 py-0.5 rounded-full bg-[#F9F9F9] font-medium text-[#CA45FF]">
                          {t.tag}
                        </span>
                        <h3 className="text-base font-medium text-[#1A0B54] m-0">{t.title}</h3>
                      </div>
                      {isSelected ? <ChevronUp className="size-4 text-[#83799E]" /> : <ChevronDown className="size-4 text-[#83799E]" />}
                    </div>

                    <p className="text-xs text-[#83799E] leading-relaxed m-0">{t.def}</p>

                    {isSelected && (
                      <div className="mt-4 pt-3 border-t border-black/[0.04] space-y-2 text-xs text-[#1A0B54]">
                        <div className="rounded-xl p-3 bg-[#F9F9F9]">
                          <strong className="block text-[10px] uppercase text-[#83799E] mb-1">Realistic Scenario</strong>
                          <span>{t.example}</span>
                        </div>
                        <div className="rounded-xl p-3 bg-[#F9F9F9]">
                          <strong className="block text-[10px] uppercase text-[#83799E] mb-1">Key Warning Sign</strong>
                          <span>{t.warning}</span>
                        </div>
                        <div className="rounded-xl p-3 bg-[rgba(43,167,255,0.08)] border border-[rgba(43,167,255,0.2)]">
                          <strong className="block text-[10px] uppercase text-[#2BA7FF] mb-1">How to Defend</strong>
                          <span>{t.defense}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => navigateTo("intro")}
                className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-medium text-[#1A0B54] bg-[#F9F9F9]"
              >
                <ArrowLeft className="size-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => navigateTo("redflags")}
                className="inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-medium text-white transition-opacity"
                style={{
                  backgroundColor: "rgb(26, 11, 84)",
                  boxShadow: "0 4px 14px rgba(26, 11, 84, 0.2)",
                }}
              >
                <span>Spot the Red Flag Activity</span>
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            4. MODULE 3 — SPOT THE RED FLAGS MINI-GAME
            ══════════════════════════════════════════════════════ */}
        {stage === "redflags" && (
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto">
              <div
                className="mb-3 inline-flex items-center gap-2 rounded-full text-xs font-medium uppercase tracking-wider"
                style={{ backgroundColor: "rgb(249, 249, 249)", padding: "6px 14px", color: "rgb(26, 11, 84)", boxShadow: cardShadow }}
              >
                <span>Module 3 — Interactive Lab</span>
              </div>
              <h2 className="text-3xl font-medium tracking-tight" style={{ color: "rgb(26, 11, 84)", margin: 0 }}>
                Spot the Red Flags
              </h2>
              <p className="mt-2 text-sm" style={{ color: "rgb(131, 121, 158)" }}>
                Click on the 5 suspicious areas inside this incoming email.
              </p>
            </div>

            <div
              className="rounded-[18px] p-6 lg:p-8 space-y-4"
              style={{
                backgroundColor: "#ffffff",
                boxShadow: cardShadow,
                border: "1px solid rgba(0, 0, 0, 0.05)",
              }}
            >
              {/* Sender */}
              <div
                onClick={() => toggleGameFlag("sender")}
                className={`cursor-pointer rounded-xl p-3.5 transition-all ${
                  gameFoundFlags.sender ? "bg-[rgba(200,111,255,0.1)] ring-2 ring-[#CA45FF]" : "bg-[#F9F9F9] hover:bg-black/[0.03]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase text-[#83799E]">FROM: support@micr0soft-security.com</span>
                  {gameFoundFlags.sender && <CheckCircle2 className="size-4 text-[#CA45FF]" />}
                </div>
                {gameFoundFlags.sender && (
                  <p className="mt-2 text-xs text-[#1A0B54] border-t border-black/[0.04] pt-2">
                    <strong>Suspicious Lookalike Domain:</strong> Notice &apos;micr0soft&apos; spelled with a zero (&apos;0&apos;). Attackers register lookalike domains to impersonate legitimate brand trust.
                  </p>
                )}
              </div>

              {/* Subject & Urgency */}
              <div
                onClick={() => toggleGameFlag("urgency")}
                className={`cursor-pointer rounded-xl p-3.5 transition-all ${
                  gameFoundFlags.urgency ? "bg-[rgba(254,136,27,0.1)] ring-2 ring-[#FE881B]" : "bg-[#F9F9F9] hover:bg-black/[0.03]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase text-[#83799E]">SUBJECT: URGENT — Your account requires immediate verification</span>
                  {gameFoundFlags.urgency && <CheckCircle2 className="size-4 text-[#FE881B]" />}
                </div>
                {gameFoundFlags.urgency && (
                  <p className="mt-2 text-xs text-[#1A0B54] border-t border-black/[0.04] pt-2">
                    <strong>Manufactured Panic:</strong> Urgency words push victims to make impulsive errors before confirming authenticity.
                  </p>
                )}
              </div>

              {/* Message Body & Threat */}
              <div
                onClick={() => toggleGameFlag("threat")}
                className={`cursor-pointer rounded-xl p-4 transition-all ${
                  gameFoundFlags.threat ? "bg-[rgba(239,68,68,0.08)] ring-2 ring-red-400" : "bg-[#F9F9F9] hover:bg-black/[0.03]"
                }`}
              >
                <p className="text-xs leading-relaxed text-[#1A0B54] m-0">
                  &quot;Dear User, We detected unusual activity on your account. Your account will be permanently suspended unless you verify your identity within 30 minutes.&quot;
                </p>
                {gameFoundFlags.threat && (
                  <p className="mt-2 text-xs text-[#1A0B54] border-t border-black/[0.04] pt-2">
                    <strong>Consequence Threat & Generic Greeting:</strong> &quot;Dear User&quot; lacks personal context, and the 30-minute permanent suspension threat is classic social coercion.
                  </p>
                )}
              </div>

              {/* Link */}
              <div
                onClick={() => toggleGameFlag("link")}
                className={`cursor-pointer rounded-xl p-3.5 transition-all ${
                  gameFoundFlags.link ? "bg-[rgba(43,167,255,0.1)] ring-2 ring-[#2BA7FF]" : "bg-[#F9F9F9] hover:bg-black/[0.03]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#2BA7FF]">Target Link: http://micr0soft-id-verify.ru/token=9183</span>
                  {gameFoundFlags.link && <CheckCircle2 className="size-4 text-[#2BA7FF]" />}
                </div>
                {gameFoundFlags.link && (
                  <p className="mt-2 text-xs text-[#1A0B54] border-t border-black/[0.04] pt-2">
                    <strong>Foreign TLD & Unsecured Protocol:</strong> Uses an unencrypted HTTP link leading to a Russian .ru domain rather than microsoft.com.
                  </p>
                )}
              </div>

              <div
                className="rounded-xl p-4 text-xs leading-relaxed"
                style={{ backgroundColor: "rgb(249, 249, 249)", color: "rgb(131, 121, 158)" }}
              >
                <strong style={{ color: "rgb(26, 11, 84)" }}>Multi-Signal Philosophy: </strong>
                Never rely on one single clue to declare safety. Always combine sender, subdomain, language, and request type.
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => navigateTo("types")}
                className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-medium text-[#1A0B54] bg-[#F9F9F9]"
              >
                <ArrowLeft className="size-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => navigateTo("url_lab")}
                className="inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-medium text-white transition-opacity"
                style={{
                  backgroundColor: "rgb(26, 11, 84)",
                  boxShadow: "0 4px 14px rgba(26, 11, 84, 0.2)",
                }}
              >
                <span>URL Investigation Lab</span>
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            5. MODULE 4 — URL INVESTIGATION LAB & PARSER
            ══════════════════════════════════════════════════════ */}
        {stage === "url_lab" && (
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto">
              <div
                className="mb-3 inline-flex items-center gap-2 rounded-full text-xs font-medium uppercase tracking-wider"
                style={{ backgroundColor: "rgb(249, 249, 249)", padding: "6px 14px", color: "rgb(26, 11, 84)", boxShadow: cardShadow }}
              >
                <span>Module 4 — Technical Dissection</span>
              </div>
              <h2 className="text-3xl font-medium tracking-tight" style={{ color: "rgb(26, 11, 84)", margin: 0 }}>
                Would You Trust This URL?
              </h2>
              <p className="mt-2 text-sm" style={{ color: "rgb(131, 121, 158)" }}>
                Select candidate addresses to run the 5-part anatomical parser.
              </p>
            </div>

            {/* Candidate URLs */}
            <div className="grid grid-cols-1 gap-3">
              {URL_CHALLENGES.map((u) => {
                const isSelected = selectedUrlId === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setSelectedUrlId(u.id)}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-[18px] p-5 text-left transition-all"
                    style={{
                      backgroundColor: "#ffffff",
                      boxShadow: cardShadow,
                      border: isSelected ? "2px solid rgb(200, 111, 255)" : "1px solid rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Globe2 className="size-5 shrink-0 text-[#C86FFF]" />
                      <span className="font-mono text-xs sm:text-sm text-[#1A0B54]">{u.url}</span>
                    </div>
                    <span className="rounded-full px-3 py-1 text-[11px] font-medium bg-[#F9F9F9] text-[#1A0B54]">
                      {u.risk}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Animated URL Parser Card */}
            {(() => {
              const current = URL_CHALLENGES.find((u) => u.id === selectedUrlId)!;
              return (
                <div
                  className="rounded-[18px] p-6 lg:p-8 space-y-6"
                  style={{
                    backgroundColor: "#ffffff",
                    boxShadow: cardShadow,
                    border: "1px solid rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <h3 className="text-base font-medium text-[#1A0B54] m-0">
                    Anatomy Parser: {current.url}
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs font-mono">
                    <div className="rounded-xl p-3 bg-[#F9F9F9]">
                      <span className="text-[10px] text-[#83799E] block mb-1">Protocol</span>
                      <strong className="text-[#2BA7FF]">{current.protocol}</strong>
                    </div>
                    <div className="rounded-xl p-3 bg-[#F9F9F9]">
                      <span className="text-[10px] text-[#83799E] block mb-1">Subdomain</span>
                      <strong className="text-[#CA45FF]">{current.subdomain || "—"}</strong>
                    </div>
                    <div className="rounded-xl p-3 bg-[#F9F9F9]">
                      <span className="text-[10px] text-[#83799E] block mb-1">Registered Domain</span>
                      <strong className="text-[#1A0B54]">{current.domain}</strong>
                    </div>
                    <div className="rounded-xl p-3 bg-[#F9F9F9]">
                      <span className="text-[10px] text-[#83799E] block mb-1">TLD</span>
                      <strong className="text-[#FE881B]">{current.tld}</strong>
                    </div>
                    <div className="rounded-xl p-3 bg-[#F9F9F9]">
                      <span className="text-[10px] text-[#83799E] block mb-1">Path</span>
                      <strong className="text-[#83799E]">{current.path || "—"}</strong>
                    </div>
                  </div>

                  <div className="rounded-xl p-4 bg-[#F9F9F9] text-xs leading-relaxed space-y-1">
                    <strong className="text-[#1A0B54] block">Forensic Explanation:</strong>
                    <p className="text-[#83799E] m-0">{current.explanation}</p>
                  </div>

                  <div className="rounded-xl p-4 text-xs bg-[rgba(43,167,255,0.08)] border border-[rgba(43,167,255,0.2)] text-[#1A0B54]">
                    <strong>Critical Lesson: </strong>
                    HTTPS encrypts the transmission in transit, but it does <strong>not</strong> guarantee the website is legitimate. Attackers issue free SSL certificates on malicious domains constantly.
                  </div>
                </div>
              );
            })()}

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => navigateTo("redflags")}
                className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-medium text-[#1A0B54] bg-[#F9F9F9]"
              >
                <ArrowLeft className="size-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => navigateTo("trust_trap")}
                className="inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-medium text-white transition-opacity"
                style={{
                  backgroundColor: "rgb(26, 11, 84)",
                  boxShadow: "0 4px 14px rgba(26, 11, 84, 0.2)",
                }}
              >
                <span>Rapid-Fire &quot;Trust or Trap?&quot;</span>
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            6. MODULE 5 — "TRUST OR TRAP?" GAME
            ══════════════════════════════════════════════════════ */}
        {stage === "trust_trap" && (
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto">
              <div
                className="mb-3 inline-flex items-center gap-2 rounded-full text-xs font-medium uppercase tracking-wider"
                style={{ backgroundColor: "rgb(249, 249, 249)", padding: "6px 14px", color: "rgb(26, 11, 84)", boxShadow: cardShadow }}
              >
                <span>Module 5 — Rapid Assessment</span>
              </div>
              <h2 className="text-3xl font-medium tracking-tight" style={{ color: "rgb(26, 11, 84)", margin: 0 }}>
                Trust or Trap?
              </h2>
              <p className="mt-2 text-sm" style={{ color: "rgb(131, 121, 158)" }}>
                You do not have to guess blindly. Use <strong>INVESTIGATE</strong> to reveal telemetry before making your call.
              </p>
            </div>

            {(() => {
              const current = TRUST_TRAP_SCENARIOS[trustTrapIdx];
              return (
                <div
                  className="rounded-[18px] p-7 lg:p-9 space-y-6"
                  style={{
                    backgroundColor: "#ffffff",
                    boxShadow: cardShadow,
                    border: "1px solid rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <div className="flex items-center justify-between border-b border-black/[0.04] pb-4">
                    <span className="text-xs uppercase font-medium text-[#C86FFF]">
                      Intercepted Alert {trustTrapIdx + 1} of {TRUST_TRAP_SCENARIOS.length}
                    </span>
                    <span className="text-xs text-[#83799E]">Real-time Decision</span>
                  </div>

                  <div className="rounded-xl p-5 bg-[#F9F9F9] text-base font-medium text-[#1A0B54] leading-relaxed">
                    &quot;{current.message}&quot;
                  </div>

                  {showTrustClues && (
                    <div className="rounded-xl p-4 bg-[rgba(200,111,255,0.08)] border border-[rgba(200,111,255,0.25)] space-y-2 text-xs text-[#1A0B54]">
                      <strong className="block text-[11px] uppercase text-[#CA45FF]">Investigative Telemetry Uncovered:</strong>
                      <div className="font-mono text-xs text-[#1A0B54]">Sender: {current.sender}</div>
                      <div className="font-mono text-xs text-[#1A0B54]">Destination: {current.url}</div>
                      <ul className="list-disc pl-4 space-y-0.5 text-[#83799E]">
                        {current.clues.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 3 Decision Buttons */}
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      disabled={trustTrapChoice !== null}
                      onClick={() => {
                        setTrustTrapChoice("trust");
                        updateProfile((p) => ({ ...p, xp: !current.isPhish ? p.xp + 10 : p.xp }));
                      }}
                      className="rounded-xl p-4 text-xs font-medium text-white transition-all bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                    >
                      🟢 TRUST
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowTrustClues(true)}
                      className="rounded-xl p-4 text-xs font-medium text-[#1A0B54] transition-all bg-amber-100 hover:bg-amber-200"
                    >
                      🟡 INVESTIGATE
                    </button>

                    <button
                      type="button"
                      disabled={trustTrapChoice !== null}
                      onClick={() => {
                        setTrustTrapChoice("phish");
                        updateProfile((p) => ({ ...p, xp: current.isPhish ? p.xp + 10 : p.xp }));
                      }}
                      className="rounded-xl p-4 text-xs font-medium text-white transition-all bg-red-600 hover:bg-red-700 disabled:opacity-50"
                    >
                      🔴 PHISH
                    </button>
                  </div>

                  {trustTrapChoice !== null && (
                    <div className="rounded-xl p-4 bg-[#F9F9F9] text-xs text-[#1A0B54] leading-relaxed space-y-2">
                      <div className="flex items-center gap-2">
                        {((trustTrapChoice === "phish" && current.isPhish) || (trustTrapChoice === "trust" && !current.isPhish)) ? (
                          <span className="text-emerald-600 font-medium flex items-center gap-1">
                            <CheckCircle2 className="size-4" /> Correct Call (+10 XP)
                          </span>
                        ) : (
                          <span className="text-red-500 font-medium flex items-center gap-1">
                            <XCircle className="size-4" /> Threat Assessment Error
                          </span>
                        )}
                      </div>
                      <p className="text-[#83799E] m-0">{current.explanation}</p>
                    </div>
                  )}

                  {trustTrapChoice !== null && (
                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (trustTrapIdx + 1 < TRUST_TRAP_SCENARIOS.length) {
                            setTrustTrapIdx((p) => p + 1);
                            setTrustTrapChoice(null);
                            setShowTrustClues(false);
                          } else {
                            navigateTo("social_eng");
                          }
                        }}
                        className="inline-flex items-center gap-2 rounded-full px-7 py-2.5 text-xs font-medium text-white"
                        style={{ backgroundColor: "rgb(26, 11, 84)" }}
                      >
                        <span>{trustTrapIdx + 1 === TRUST_TRAP_SCENARIOS.length ? "Proceed to Social Eng" : "Next Scenario"}</span>
                        <ArrowRight className="size-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="flex justify-start pt-4">
              <button
                type="button"
                onClick={() => navigateTo("url_lab")}
                className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-medium text-[#1A0B54] bg-[#F9F9F9]"
              >
                <ArrowLeft className="size-3.5" />
                <span>Back</span>
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            7. MODULE 6 — "THINK LIKE THE ATTACKER" SOCIAL ENGINEERING
            ══════════════════════════════════════════════════════ */}
        {stage === "social_eng" && (
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto">
              <div
                className="mb-3 inline-flex items-center gap-2 rounded-full text-xs font-medium uppercase tracking-wider"
                style={{ backgroundColor: "rgb(249, 249, 249)", padding: "6px 14px", color: "rgb(26, 11, 84)", boxShadow: cardShadow }}
              >
                <span>Module 6 — Psychology & Manipulation</span>
              </div>
              <h2 className="text-3xl font-medium tracking-tight" style={{ color: "rgb(26, 11, 84)", margin: 0 }}>
                Think Like the Attacker
              </h2>
              <p className="mt-2 text-sm" style={{ color: "rgb(131, 121, 158)" }}>
                Identify which psychological technique is being exploited in this situation.
              </p>
            </div>

            {(() => {
              const current = SOCIAL_ENG_SCENARIOS[socialIdx];
              return (
                <div
                  className="rounded-[18px] p-7 lg:p-9 space-y-6"
                  style={{
                    backgroundColor: "#ffffff",
                    boxShadow: cardShadow,
                    border: "1px solid rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <div className="flex items-center justify-between border-b border-black/[0.04] pb-4">
                    <span className="text-xs uppercase font-medium text-[#C86FFF]">
                      Case {socialIdx + 1} of {SOCIAL_ENG_SCENARIOS.length}: {current.title}
                    </span>
                    <span className="text-xs text-[#83799E]">Psychological Vector</span>
                  </div>

                  <div className="rounded-xl p-5 bg-[#F9F9F9] text-sm text-[#1A0B54] leading-relaxed">
                    {current.scenario}
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs uppercase font-medium text-[#83799E] block mb-2">
                      Primary Social Engineering Vector:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {current.options.map((opt) => {
                        const isSelected = selectedSocialOpt === opt;
                        const isCorrect = opt === current.correctTechnique;
                        return (
                          <button
                            key={opt}
                            type="button"
                            disabled={selectedSocialOpt !== null}
                            onClick={() => {
                              setSelectedSocialOpt(opt);
                              if (isCorrect) {
                                updateProfile((p) => {
                                  const badges = !p.unlockedBadges.includes("social_analyst")
                                    ? [...p.unlockedBadges, "social_analyst"]
                                    : p.unlockedBadges;
                                  return { ...p, xp: p.xp + 15, unlockedBadges: badges };
                                });
                              }
                            }}
                            className="rounded-xl p-4 text-left text-xs font-medium transition-all"
                            style={{
                              backgroundColor: selectedSocialOpt
                                ? isCorrect
                                  ? "rgba(43, 167, 255, 0.12)"
                                  : isSelected
                                  ? "rgba(239, 68, 68, 0.1)"
                                  : "#F9F9F9"
                                : "#F9F9F9",
                              color: "#1A0B54",
                              border: selectedSocialOpt && isCorrect ? "1px solid rgb(43, 167, 255)" : "1px solid transparent",
                            }}
                          >
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {selectedSocialOpt !== null && (
                    <div className="rounded-xl p-4 bg-[#F9F9F9] text-xs text-[#1A0B54] leading-relaxed space-y-1">
                      <strong>Psychological Principle:</strong>
                      <p className="text-[#83799E] m-0">{current.psychology}</p>
                    </div>
                  )}

                  {selectedSocialOpt !== null && (
                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (socialIdx + 1 < SOCIAL_ENG_SCENARIOS.length) {
                            setSocialIdx((p) => p + 1);
                            setSelectedSocialOpt(null);
                          } else {
                            navigateTo("human_ai");
                          }
                        }}
                        className="inline-flex items-center gap-2 rounded-full px-7 py-2.5 text-xs font-medium text-white"
                        style={{ backgroundColor: "rgb(26, 11, 84)" }}
                      >
                        <span>{socialIdx + 1 === SOCIAL_ENG_SCENARIOS.length ? "Proceed to AI Challenge" : "Next Scenario"}</span>
                        <ArrowRight className="size-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="flex justify-start pt-4">
              <button
                type="button"
                onClick={() => navigateTo("trust_trap")}
                className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-medium text-[#1A0B54] bg-[#F9F9F9]"
              >
                <ArrowLeft className="size-3.5" />
                <span>Back</span>
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            8. MODULE 7 — "HUMAN VS AI" DETECTION CHALLENGE
            ══════════════════════════════════════════════════════ */}
        {stage === "human_ai" && (
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto">
              <div
                className="mb-3 inline-flex items-center gap-2 rounded-full text-xs font-medium uppercase tracking-wider"
                style={{ backgroundColor: "rgb(249, 249, 249)", padding: "6px 14px", color: "rgb(26, 11, 84)", boxShadow: cardShadow }}
              >
                <span>Module 7 — AI Calibration</span>
              </div>
              <h2 className="text-3xl font-medium tracking-tight" style={{ color: "rgb(26, 11, 84)", margin: 0 }}>
                Human vs AI Detection
              </h2>
              <p className="mt-2 text-sm" style={{ color: "rgb(131, 121, 158)" }}>
                Score your human suspicion rating, then run our simulated multimodal AI scanner to compare evidence models.
              </p>
            </div>

            <div
              className="rounded-[18px] p-7 lg:p-9 space-y-6"
              style={{
                backgroundColor: "#ffffff",
                boxShadow: cardShadow,
                border: "1px solid rgba(0, 0, 0, 0.05)",
              }}
            >
              <div className="rounded-xl p-4 bg-[#F9F9F9] text-xs font-mono text-[#1A0B54]">
                Target Artifact: &quot;Urgent: Wire transfer of $14,800 to Vendor Global LLC pending approval. Click to verify authorization tokens.&quot;
              </div>

              {/* Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-[#83799E]">Your Human Suspicion Level:</span>
                  <span className="text-sm font-medium text-[#1A0B54]">{humanConfidence}% Suspicious</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={humanConfidence}
                  onChange={(e) => setHumanConfidence(Number(e.target.value))}
                  className="w-full accent-[#CA45FF]"
                />
                <div className="flex justify-between text-[11px] text-[#83799E]">
                  <span>0% Safe</span>
                  <span>50% Unsure</span>
                  <span>100% Critical Attack</span>
                </div>
              </div>

              {!aiScanComplete && (
                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={runAiScan}
                    disabled={aiScanning}
                    className="inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-medium text-white transition-all disabled:opacity-50"
                    style={{ backgroundColor: "rgb(26, 11, 84)" }}
                  >
                    <Zap className="size-4 text-[#CA45FF]" />
                    <span>{aiScanning ? "SCANNING MULTIMODAL SIGNALS..." : "RUN AI SCAN COMPARISON"}</span>
                  </button>
                </div>
              )}

              {aiScanComplete && (
                <div className="rounded-xl p-5 bg-[#F9F9F9] space-y-4 text-xs text-[#1A0B54]">
                  <div className="flex items-center justify-between border-b border-black/[0.04] pb-3">
                    <span className="font-medium text-sm">AI MULTIMODAL ASSESSMENT</span>
                    <span className="rounded-full bg-red-100 text-red-600 px-3 py-1 font-medium text-xs">
                      Risk Score: 87 / 100 (HIGH)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-[#83799E]">
                    <span>✓ Suspicious financial transfer request</span>
                    <span>✓ Urgency pressure without PO number</span>
                    <span>✓ Domain registered 4 days ago</span>
                    <span>✓ Lacks 2FA token out-of-band stamp</span>
                  </div>

                  <div className="rounded-lg p-3 bg-white border border-black/[0.04] flex items-center justify-between">
                    <span>Your Confidence: <strong>{humanConfidence}%</strong></span>
                    <span>AI Model: <strong>87%</strong></span>
                  </div>

                  <p className="text-[11px] text-[#83799E] italic m-0">
                    AI models surface structural and infrastructure patterns, but important financial or credential requests must always be verified out-of-band by human analysts.
                  </p>
                </div>
              )}

              {aiScanComplete && (
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={launchQuiz}
                    className="inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-medium text-white"
                    style={{ backgroundColor: "rgb(26, 11, 84)" }}
                  >
                    <span>Proceed to 10-Question Exam</span>
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-start pt-4">
              <button
                type="button"
                onClick={() => navigateTo("social_eng")}
                className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-medium text-[#1A0B54] bg-[#F9F9F9]"
              >
                <ArrowLeft className="size-3.5" />
                <span>Back</span>
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            9. MODULE 8 — 10-QUESTION SCENARIO QUIZ
            ══════════════════════════════════════════════════════ */}
        {stage === "quiz" && quizQuestions.length > 0 && (
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="text-center max-w-2xl mx-auto">
              <div
                className="mb-3 inline-flex items-center gap-2 rounded-full text-xs font-medium uppercase tracking-wider"
                style={{ backgroundColor: "rgb(249, 249, 249)", padding: "6px 14px", color: "rgb(26, 11, 84)", boxShadow: cardShadow }}
              >
                <span>Question {quizIdx + 1} of 10</span>
              </div>
              <h2 className="text-2xl font-medium tracking-tight" style={{ color: "rgb(26, 11, 84)", margin: 0 }}>
                Practical Decision Scenario
              </h2>
            </div>

            {(() => {
              const current = quizQuestions[quizIdx];
              const picked = quizPicks[quizIdx];
              const answered = picked !== null;

              return (
                <div
                  className="rounded-[18px] p-7 sm:p-9 space-y-6"
                  style={{
                    backgroundColor: "#ffffff",
                    boxShadow: cardShadow,
                    border: "1px solid rgba(0, 0, 0, 0.04)",
                  }}
                >
                  <div className="flex items-center justify-between border-b border-black/[0.04] pb-4">
                    <span className="rounded-full px-3 py-1 text-xs font-medium uppercase bg-[#F9F9F9] text-[#C86FFF]">
                      {categoryLabel(current)}
                    </span>
                    <span className="text-xs text-[#83799E]">Level {profile.level} Simulation</span>
                  </div>

                  <h3 className="text-lg font-medium text-[#1A0B54] leading-relaxed m-0">
                    {current.question}
                  </h3>

                  <div className="space-y-3">
                    {current.options.map((opt, idx) => {
                      const isPicked = picked === idx;
                      const isCorrect = idx === current.answer;

                      let bg = "rgb(249, 249, 249)";
                      let textColor = "rgb(26, 11, 84)";
                      let border = "1px solid rgba(0, 0, 0, 0.04)";

                      if (answered) {
                        if (isCorrect) {
                          bg = "rgba(43, 167, 255, 0.12)";
                          border = "1px solid rgb(43, 167, 255)";
                        } else if (isPicked && !isCorrect) {
                          bg = "rgba(239, 68, 68, 0.08)";
                          border = "1px solid rgba(239, 68, 68, 0.4)";
                          textColor = "rgb(185, 28, 28)";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleQuizAnswer(idx)}
                          disabled={answered}
                          className="flex w-full items-center justify-between rounded-xl p-4 text-left text-sm font-medium transition-all"
                          style={{ backgroundColor: bg, color: textColor, border }}
                        >
                          <span className="flex-1 pr-4">{opt}</span>
                          {answered && isCorrect && <CheckCircle2 className="size-4 shrink-0 text-[#2BA7FF]" />}
                          {answered && isPicked && !isCorrect && <XCircle className="size-4 shrink-0 text-red-500" />}
                        </button>
                      );
                    })}
                  </div>

                  {answered && (
                    <div className="rounded-xl p-5 bg-[#F9F9F9] space-y-2 text-xs text-[#1A0B54]">
                      <div className="flex items-center gap-2">
                        <Zap className="size-4 text-[#C86FFF]" />
                        <span className="text-xs font-medium uppercase text-[#1A0B54]">Forensic Analysis Breakdown</span>
                      </div>
                      <p className="text-xs text-[#83799E] leading-relaxed m-0">{current.explanation}</p>
                    </div>
                  )}

                  {answered && (
                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (quizIdx + 1 >= 10) {
                            unlockBoss();
                          } else {
                            setQuizIdx((p) => p + 1);
                          }
                        }}
                        className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-medium text-white"
                        style={{ backgroundColor: "rgb(26, 11, 84)" }}
                      >
                        <span>{quizIdx + 1 === 10 ? "Unlock Boss Level" : "Next Scenario"}</span>
                        <ArrowRight className="size-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            10. MODULE 9 — BOSS LEVEL: "THE PERFECT PHISH"
            ══════════════════════════════════════════════════════ */}
        {stage === "boss" && (
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto">
              <div
                className="mb-3 inline-flex items-center gap-2 rounded-full text-xs font-medium uppercase tracking-wider bg-red-100 text-red-700 px-4 py-1"
              >
                <span>🔥 Boss Level Challenge</span>
              </div>
              <h2 className="text-3xl font-medium tracking-tight" style={{ color: "rgb(26, 11, 84)", margin: 0 }}>
                {BOSS_SCENARIO.title}
              </h2>
              <p className="mt-2 text-sm" style={{ color: "rgb(131, 121, 158)" }}>
                This attack contains subtle, high-level indicators. Use forensic tools to uncover clues before choosing your action.
              </p>
            </div>

            <div
              className="rounded-[18px] p-7 lg:p-9 space-y-6"
              style={{
                backgroundColor: "#ffffff",
                boxShadow: cardShadow,
                border: "1px solid rgba(0, 0, 0, 0.05)",
              }}
            >
              {/* Simulated Email */}
              <div className="rounded-xl p-5 bg-[#F9F9F9] space-y-3 text-xs font-mono">
                <div className="text-[#83799E]">FROM: {BOSS_SCENARIO.sender}</div>
                <div className="text-[#83799E]">SUBJECT: {BOSS_SCENARIO.subject}</div>
                <div className="pt-2 border-t border-black/[0.04] text-[#1A0B54] font-sans text-sm whitespace-pre-line leading-relaxed">
                  {BOSS_SCENARIO.body}
                </div>
              </div>

              {/* Forensic Tool Investigation Bar */}
              <div className="space-y-3">
                <span className="text-xs uppercase font-medium text-[#83799E] block">
                  Forensic Investigation Tools (Click to Deploy):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {BOSS_SCENARIO.tools.map((tool) => {
                    const isUnlocked = bossCluesFound[tool.id];
                    return (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => toggleBossClue(tool.id)}
                        className={`rounded-xl p-3 text-left text-xs font-medium transition-all ${
                          isUnlocked ? "bg-[rgba(200,111,255,0.12)] ring-1 ring-[#CA45FF] text-[#1A0B54]" : "bg-[#F9F9F9] text-[#83799E] hover:bg-black/[0.03]"
                        }`}
                      >
                        <span className="block font-semibold mb-0.5">{tool.label}</span>
                        {isUnlocked && <span className="text-[11px] font-normal block leading-tight text-[#1A0B54]">{tool.clue}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Decision Action Grid */}
              <div className="space-y-3 pt-4 border-t border-black/[0.04]">
                <span className="text-xs uppercase font-medium text-[#1A0B54] block">
                  What is your strategic forensic decision?
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {BOSS_SCENARIO.actions.map((act, idx) => {
                    const isSelected = bossSelectedAction === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={bossSelectedAction !== null}
                        onClick={() => handleBossAction(idx)}
                        className="rounded-xl p-4 text-left text-xs font-medium transition-all"
                        style={{
                          backgroundColor: bossSelectedAction !== null
                            ? act.correct
                              ? "rgba(43, 167, 255, 0.12)"
                              : isSelected
                              ? "rgba(239, 68, 68, 0.08)"
                              : "#F9F9F9"
                            : "#F9F9F9",
                          color: "#1A0B54",
                          border: bossSelectedAction !== null && act.correct ? "1px solid rgb(43, 167, 255)" : "1px solid transparent",
                        }}
                      >
                        <span>{act.label}</span>
                        {bossSelectedAction !== null && isSelected && (
                          <span className="block mt-1 text-[11px] text-[#83799E]">{act.explanation}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {bossSelectedAction !== null && (
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => navigateTo("results")}
                    className="inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-medium text-white"
                    style={{ backgroundColor: "rgb(26, 11, 84)" }}
                  >
                    <span>View Case Forensic Report</span>
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            11. MODULE 10 — COMPREHENSIVE CASE REPORT
            ══════════════════════════════════════════════════════ */}
        {stage === "results" && (
          <div className="mx-auto max-w-3xl space-y-6">
            <div
              className="rounded-[18px] p-8 lg:p-12 text-center"
              style={{
                backgroundColor: "#ffffff",
                boxShadow: cardShadow,
                border: "1px solid rgba(0, 0, 0, 0.04)",
              }}
            >
              <div
                className="mx-auto mb-4 flex size-20 items-center justify-center rounded-2xl text-2xl font-medium"
                style={{
                  backgroundColor: "rgba(43, 167, 255, 0.12)",
                  color: "rgb(26, 11, 84)",
                }}
              >
                {profile.accuracy}%
              </div>

              <h2 className="text-2xl font-medium text-[#1A0B54] mb-2">
                INVESTIGATION COMPLETE
              </h2>

              <p className="text-sm text-[#83799E] max-w-md mx-auto mb-8">
                Your detection score reflects your performance across all forensic modules, URL parsing tests, and the Boss Level scenario.
              </p>

              {/* 4 Forensic Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center mb-8">
                <div className="rounded-xl p-4 bg-[#F9F9F9]">
                  <span className="text-xs text-[#83799E] block mb-1">Total XP</span>
                  <strong className="text-lg text-[#1A0B54]">{profile.xp}</strong>
                </div>
                <div className="rounded-xl p-4 bg-[#F9F9F9]">
                  <span className="text-xs text-[#83799E] block mb-1">Accuracy</span>
                  <strong className="text-lg text-[#1A0B54]">{profile.accuracy}%</strong>
                </div>
                <div className="rounded-xl p-4 bg-[#F9F9F9]">
                  <span className="text-xs text-[#83799E] block mb-1">Red Flags Found</span>
                  <strong className="text-lg text-[#1A0B54]">{profile.redFlagsFound}</strong>
                </div>
                <div className="rounded-xl p-4 bg-[#F9F9F9]">
                  <span className="text-xs text-[#83799E] block mb-1">Level Tier</span>
                  <strong className="text-lg text-[#1A0B54]">Tier 0{profile.level}</strong>
                </div>
              </div>

              {/* Skill Ratings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left text-xs mb-8">
                <div className="rounded-xl p-4 bg-[#F9F9F9]">
                  <span className="text-[#83799E] block mb-1">Investigation Skills</span>
                  <strong className="text-sm text-[#CA45FF]">★★★★☆</strong>
                </div>
                <div className="rounded-xl p-4 bg-[#F9F9F9]">
                  <span className="text-[#83799E] block mb-1">URL Awareness</span>
                  <strong className="text-sm text-[#2BA7FF]">★★★★★</strong>
                </div>
                <div className="rounded-xl p-4 bg-[#F9F9F9]">
                  <span className="text-[#83799E] block mb-1">Social Eng Awareness</span>
                  <strong className="text-sm text-[#FE881B]">★★★★☆</strong>
                </div>
              </div>

              {/* Strengths & Practice Areas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left text-xs mb-8">
                <div className="rounded-xl p-4 bg-[#F9F9F9] space-y-1">
                  <strong className="text-[#1A0B54] block mb-2">YOUR STRENGTHS:</strong>
                  <span className="block text-[#1A0B54]">✓ Recognizing manufactured urgency tactics</span>
                  <span className="block text-[#1A0B54]">✓ Identifying unvetted foreign domains (.ru, .xyz)</span>
                  <span className="block text-[#1A0B54]">✓ Out-of-band verification habits</span>
                </div>
                <div className="rounded-xl p-4 bg-[#F9F9F9] space-y-1">
                  <strong className="text-[#1A0B54] block mb-2">AREAS TO IMPROVE:</strong>
                  <span className="block text-[#FE881B]">⚠ Multi-subdomain prefix lures</span>
                  <span className="block text-[#FE881B]">⚠ Containerized attachment types (.iso, .exe)</span>
                </div>
              </div>

              {/* Badges List */}
              <div className="rounded-xl p-5 bg-[#F9F9F9] mb-8 text-left">
                <strong className="text-xs uppercase tracking-wider text-[#83799E] block mb-3">
                  Achievement Badges Unlocked
                </strong>
                <div className="flex flex-wrap gap-2">
                  {BADGES.map((b) => {
                    const isUnlocked = profile.unlockedBadges.includes(b.id);
                    return (
                      <span
                        key={b.id}
                        className={`rounded-full px-4 py-1.5 text-xs font-medium flex items-center gap-1.5 ${
                          isUnlocked ? "bg-[#1A0B54] text-white" : "bg-black/[0.05] text-[#83799E]"
                        }`}
                      >
                        <span>{b.icon} {b.title}</span>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Final Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => navigateTo("hero")}
                  className="inline-flex min-h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-full px-8 py-3 text-sm font-medium text-white transition-opacity"
                  style={{
                    backgroundColor: "rgb(26, 11, 84)",
                    boxShadow: "0 4px 14px rgba(26, 11, 84, 0.2)",
                  }}
                >
                  <RotateCcw className="size-4" />
                  <span>START NEXT MISSION</span>
                </button>

                <Link
                  href="/dashboard"
                  className="inline-flex min-h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-full px-8 py-3 text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: "rgb(249, 249, 249)",
                    color: "rgb(26, 11, 84)",
                    boxShadow: cardShadow,
                  }}
                >
                  <span>RETURN TO DASHBOARD</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}