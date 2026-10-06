import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "text-foreground border border-border",
        // Semantic security status badges
        safe: "border-status-safe-border bg-status-safe-subtle text-status-safe font-semibold",
        suspicious: "border-status-suspicious-border bg-status-suspicious-subtle text-status-suspicious font-semibold",
        critical: "border-status-critical-border bg-status-critical-subtle text-status-critical font-semibold",
        neutral: "border-status-neutral-border bg-status-neutral-subtle text-status-neutral font-semibold",
        // Holi Identity Badges
        mint: "bg-muted text-muted-foreground border border-border",
        peach: "bg-muted text-muted-foreground border border-border",
        blush: "bg-muted text-muted-foreground border border-border",
        sky: "bg-muted text-muted-foreground border border-border",
        pink: "bg-muted text-muted-foreground border border-border",
        // Holi Subtle Badges
        "mint-subtle": "bg-muted/30 text-muted-foreground border border-border",
        "peach-subtle": "bg-muted/30 text-muted-foreground border border-border",
        "blush-subtle": "bg-muted/30 text-muted-foreground border border-border",
        "sky-subtle": "bg-muted/30 text-muted-foreground border border-border",
        "pink-subtle": "bg-muted/30 text-muted-foreground border border-border"
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
