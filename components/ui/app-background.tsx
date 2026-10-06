"use client"

import * as React from "react"

/**
 * AppBackground
 *
 * Universal, high-performance fixed background for PhishCatcher.
 * Renders the definitive `/backdrop.png` asset at full coverage, fixed
 * across all routes and scroll positions, with a subtle radial vignette
 * to preserve foreground readability without compromising the artwork.
 */
export function AppBackground() {
  return (
    <div
      className="fixed inset-0 -z-50 overflow-hidden pointer-events-none select-none"
      aria-hidden="true"
    >
      {/* Definitive fixed background image with high opacity matching landing page */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/backdrop.png"
        alt="PhishCatcher Background"
        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none opacity-80"
        loading="eager"
      />

      {/* Subtle, soft radial vignette gradient to highlight foreground text without darkening */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_20%,rgba(0,0,0,0.35)_100%] pointer-events-none" />
    </div>
  )
}
