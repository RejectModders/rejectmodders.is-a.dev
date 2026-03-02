import { Loader2 } from "lucide-react"

export default function RootLoading() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-4" style={{ overflow: "clip" }}>
      <div className="absolute inset-0 grid-bg opacity-10" />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, oklch(0.58 0.2 15 / 0.07) 0%, transparent 70%)" }}
      />
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="font-mono text-sm text-muted-foreground">loading...</span>
    </div>
  )
}

