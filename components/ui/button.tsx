import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-foreground text-background shadow-sm hover:opacity-85",
        secondary:
          "bg-background text-foreground border border-border shadow-xs hover:bg-accent",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
        ghost:
          "hover:bg-accent hover:text-accent-foreground",
        link:
          "text-foreground underline-offset-4 hover:underline p-0 h-auto",
        destructive:
          "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90",
        // Blue accent variant
        blue:
          "bg-[#3b82f6] text-white shadow-sm hover:bg-[#2563eb]",
        // Semantic Security Action Variants
        safe:
          "bg-status-safe text-status-safe-foreground shadow-xs hover:opacity-90",
        suspicious:
          "bg-status-suspicious text-status-suspicious-foreground shadow-xs hover:opacity-90",
        // Gradient pill — inspired by puter.com CTA
        "gradient-pill":
          "bg-gradient-to-r from-foreground to-foreground/80 text-background shadow-md hover:opacity-90",
        dark: "bg-foreground text-background shadow-sm hover:opacity-85",
        light: "bg-background text-foreground border border-border shadow-sm hover:bg-accent",
        // Legacy Holi variants → remapped to monochrome
        mint: "bg-muted text-muted-foreground border border-border shadow-xs hover:brightness-95",
        peach: "bg-muted text-muted-foreground border border-border shadow-xs hover:brightness-95",
        blush: "bg-muted text-muted-foreground border border-border shadow-xs hover:brightness-95",
        sky: "bg-muted text-muted-foreground border border-border shadow-xs hover:brightness-95",
        pink: "bg-muted text-muted-foreground border border-border shadow-xs hover:brightness-95",
        "mint-outline": "border border-border bg-muted/30 text-muted-foreground hover:bg-muted/30",
        "sky-outline": "border border-border bg-muted/30 text-muted-foreground hover:bg-muted/30",
        "pink-outline": "border border-border bg-muted/30 text-muted-foreground hover:bg-muted/30",
      },
      size: {
        default: "h-9 px-5 py-2",
        sm: "h-8 rounded-full px-4 text-xs",
        lg: "h-11 rounded-full px-7 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
