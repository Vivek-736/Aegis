"use client";

import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { QUESTIONS, type QuizQuestion } from "@/lib/quiz/questions";
import { Progress } from "@/components/ui/progress";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SESSION_SIZE = 10;

function drawSession(): QuizQuestion[] {
  const pool = [...QUESTIONS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, SESSION_SIZE);
}

function categoryLabel(q: QuizQuestion): string {
  return q.category.replace(/-/g, " ");
}

export default function QuizPage() {
  const [session, setSession] = useState<QuizQuestion[] | null>(null);
  const [step, setStep] = useState(0);
  const [picks, setPicks] = useState<(number | null)[]>([]);

  const start = () => {
    setSession(drawSession());
    setStep(0);
    setPicks(Array(SESSION_SIZE).fill(null));
  };

  const pick = (optionIndex: number) => {
    if (!session || picks[step] !== null) return;
    setPicks((prev) => prev.map((p, i) => (i === step ? optionIndex : p)));
  };

  const advance = () => {
    if (!session) return;
    if (step + 1 >= SESSION_SIZE) setStep(SESSION_SIZE);
    else setStep((s) => s + 1);
  };

  const score = session
    ? picks.reduce<number>(
        (acc, p, i) => acc + (p !== null && p === session[i].answer ? 1 : 0),
        0
      )
    : 0;

  const finished = session !== null && step >= SESSION_SIZE;
  const current = session && !finished ? session[step] : null;
  const answered = current !== null && picks[step] !== null;
  const progressValue = session
    ? Math.round(
        ((finished ? SESSION_SIZE : step + (answered ? 1 : 0)) / SESSION_SIZE) * 100
      )
    : 0;

  return (
    <div className="px-8 py-10">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-accent">
          Dashboard
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
          Quiz Arena
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ten questions drawn at random from a bank of {QUESTIONS.length}. Score
          shown at the end.
        </p>
      </div>

      <div className="mx-auto max-w-2xl">
        {session === null && (
          <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
            <Lightbulb
              className="mx-auto mb-4 size-8 text-blue-accent"
              aria-hidden="true"
            />
            <h2 className="text-lg font-bold text-foreground">
              Test your phishing reflexes
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Each session mixes URL red flags, SMS tactics, QR quishing, email
              headers, social engineering, brand impersonation, and technical
              indicators. You will see why after every answer.
            </p>
            <button
              onClick={start}
              className={cn(buttonVariants({ size: "lg" }), "mt-6 gap-2")}
            >
              Start quiz <ArrowRight className="size-4" />
            </button>
          </div>
        )}

        {session !== null && !finished && current && (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Question {step + 1} of {SESSION_SIZE}
              </span>
              <span className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium capitalize text-blue-accent">
                {categoryLabel(current)}
              </span>
            </div>

            <Progress
              value={progressValue}
              className="mb-5"
              aria-label="Quiz progress"
            />

            <h2 className="text-base font-semibold leading-6 text-foreground">
              {current.question}
            </h2>

            <div
              className="mt-5 space-y-2.5"
              role="group"
              aria-label="Answer options"
            >
              {current.options.map((option, i) => {
                const isPicked = picks[step] === i;
                const isCorrect = i === current.answer;
                return (
                  <button
                    key={i}
                    onClick={() => pick(i)}
                    disabled={answered}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-xl border border-border bg-background px-4 py-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      !answered && "hover:border-foreground/40 hover:bg-accent/50",
                      answered && isCorrect && "border-blue-accent bg-blue-accent/10",
                      answered && isPicked && !isCorrect && "bg-muted",
                      answered && !isPicked && !isCorrect && "opacity-60"
                    )}
                  >
                    {answered && isCorrect && (
                      <CheckCircle2
                        className="mt-0.5 size-4 shrink-0 text-blue-accent"
                        aria-hidden="true"
                      />
                    )}
                    {answered && isPicked && !isCorrect && (
                      <XCircle
                        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                    )}
                    <span
                      className={
                        answered && isCorrect ? "font-medium text-foreground" : ""
                      }
                    >
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>

            {answered && (
              <div
                aria-live="polite"
                className="mt-5 rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm leading-6 text-muted-foreground"
              >
                <span className="font-semibold text-blue-accent">Why: </span>
                {current.explanation}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              {answered && (
                <button onClick={advance} className={cn(buttonVariants(), "gap-2")}>
                  {step + 1 >= SESSION_SIZE ? "See results" : "Next question"}
                  <ArrowRight className="size-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {finished && session && (
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-accent">
              Session complete
            </p>
            <p className="mt-3 text-5xl font-bold tracking-tight text-foreground">
              {score}
              <span className="text-xl font-medium text-muted-foreground">
                /{SESSION_SIZE}
              </span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {score === SESSION_SIZE
                ? "Perfect score — nothing got past you."
                : score >= 7
                ? "Solid instincts. Review the misses below."
                : "Worth another run — read each explanation carefully."}
            </p>

            {picks.some((p, i) => p !== session[i].answer) && (
              <div className="mt-6 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">
                  What you missed
                </h3>
                {session.map((q, i) =>
                  picks[i] === q.answer ? null : (
                    <div
                      key={q.id}
                      className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm"
                    >
                      <p className="font-medium text-foreground">{q.question}</p>
                      <p className="mt-1 text-muted-foreground">
                        Correct answer:{" "}
                        <span className="font-medium text-blue-accent">
                          {q.options[q.answer]}
                        </span>
                      </p>
                    </div>
                  )
                )}
              </div>
            )}

            <button onClick={start} className={cn(buttonVariants(), "mt-6 gap-2")}>
              <RotateCcw className="size-4" /> Play again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}