import Image from "next/image"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-center bg-muted/30 p-12 lg:flex">
        <div className="max-w-md">
          <div className="mb-8 flex size-12 items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
            <Image src="/logo.svg" alt="PhishCatcher" width={30} height={30} priority />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Pause. Inspect. Stay above the hook.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            PhishCatcher turns suspicious links, messages, QR codes, and screenshots into calm, explainable signals you can act on.
          </p>
        </div>
      </div>
      <div className="flex w-full flex-col items-center justify-center p-8 lg:w-1/2">
        {children}
      </div>
    </div>
  )
}