import * as React from "react"
import { cn } from "@/lib/utils"

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  variant?: "default" | "safe" | "suspicious" | "critical" | "mint" | "sky" | "pink"
}

function Progress({
  className,
  value = 0,
  max = 100,
  variant = "default",
  ...props
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  const fillColors = {
    default: "bg-primary",
    safe: "bg-status-safe",
    suspicious: "bg-status-suspicious",
    critical: "bg-status-critical",
    mint: "bg-muted",
    sky: "bg-muted",
    pink: "bg-muted",
  }

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-secondary/80",
        className
      )}
      {...props}
    >
      <div
        className={cn("h-full transition-all duration-300", fillColors[variant])}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}

export { Progress }
