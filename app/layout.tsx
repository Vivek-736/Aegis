import type { Metadata } from "next"
import { Roboto_Condensed } from "next/font/google"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ClerkProvider } from "@clerk/nextjs"
import { AuthSyncProvider } from "@/components/providers/auth-sync-provider"
import "./globals.css"

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  variable: "--font-roboto-condensed",
  weight: ["300", "500", "700"],
})

export const metadata: Metadata = {
  title: "PhishCatcher — Multimodal AI Phishing Threat Intelligence",
  description:
    "Uniting deterministic matrix barcode decoding, linguistic NLP, domain infrastructure telemetry, and isolated browser visual verification for better analysis.",
  icons: {
    icon: "/logo.svg",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      appearance={{
        layout: {
          unsafe_disableDevelopmentModeWarnings: true,
        },
      }}
    >
      <html
        lang="en"
        className={`${robotoCondensed.className} h-full antialiased`}
        suppressHydrationWarning
      >
        <body
          className="min-h-full bg-background text-foreground selection:bg-primary selection:text-primary-foreground m-0 p-0 overflow-x-hidden"
        >
          <AuthSyncProvider>
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </AuthSyncProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}