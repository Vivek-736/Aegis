"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function ThemeToggle() {
  const [isDark, setIsDark] = React.useState(false)

  React.useEffect(() => {
    const isDarkMode =
      document.documentElement.classList.contains("dark") ||
      (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches) ||
      localStorage.getItem("theme") === "dark"

    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    queueMicrotask(() => {
      setIsDark(isDarkMode)
    })
  }, [])

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
      setIsDark(false)
    } else {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
      setIsDark(true)
    }
  }

  return (
    <Tooltip>
      {/* TooltipTrigger from @base-ui/react renders its own <button>.
          Do NOT nest a Button inside it — that causes button-in-button hydration errors.
          Pass onClick + styling directly onto the trigger so it IS the button. */}
      <TooltipTrigger
        onClick={toggleTheme}
        aria-label="Toggle light/dark theme"
        aria-pressed={isDark}
        className={cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "border-border bg-card text-foreground shadow-sm hover:bg-accent hover:text-foreground"
        )}
      >
        {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </TooltipTrigger>
      <TooltipContent>
        {isDark ? "Use light mode" : "Use dark mode"}
      </TooltipContent>
    </Tooltip>
  )
}