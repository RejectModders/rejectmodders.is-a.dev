export default function ProjectsLoading() {
  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-primary/10">
        <div className="h-full bg-primary" style={{ animation: "loading-bar 1.4s ease-in-out infinite" }} />
      </div>
      <style>{`@keyframes loading-bar{0%{transform:translateX(-100%)}50%{transform:translateX(0%)}100%{transform:translateX(100%)}}`}</style>
      <div className="relative pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="mx-auto max-w-6xl px-4">
          {/* Header skeleton */}
          <div className="mb-8 space-y-3">
            <div className="h-3 w-20 animate-pulse rounded-full bg-primary/20" />
            <div className="h-10 w-56 animate-pulse rounded-lg bg-muted" />
            <div className="h-4 w-96 animate-pulse rounded bg-muted" />
          </div>

          {/* Stats bar skeleton */}
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-lg border border-border bg-card p-4 text-center">
                <div className="mx-auto h-7 w-12 rounded bg-muted" />
                <div className="mx-auto mt-2 h-3 w-20 rounded bg-muted" />
              </div>
            ))}
          </div>

          {/* Filters skeleton */}
          <div className="mb-6 flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 w-24 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>

          {/* Grid skeleton */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-border bg-card p-6">
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-muted" />
                  <div className="h-4 w-32 rounded bg-muted" />
                </div>
                <div className="mb-2 h-3 w-full rounded bg-muted" />
                <div className="mb-4 h-3 w-3/4 rounded bg-muted" />
                <div className="flex gap-3">
                  <div className="h-3 w-16 rounded bg-muted" />
                  <div className="h-3 w-10 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
