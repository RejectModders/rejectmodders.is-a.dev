export default function GamesLoading() {
  return (
    <main className="min-h-screen pt-24 pb-20 px-4">
      <div className="mx-auto max-w-6xl">
        {/* Header skeleton */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-3 h-6 w-24 animate-pulse rounded-full bg-primary/10" />
          <div className="mx-auto mb-3 h-12 w-40 animate-pulse rounded-lg bg-muted" />
          <div className="mx-auto h-4 w-64 animate-pulse rounded bg-muted/60" />
        </div>

        {/* Category filter skeleton */}
        <div className="mb-10 flex flex-wrap gap-2 justify-center">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-9 w-24 animate-pulse rounded-full bg-muted" style={{ animationDelay: `${i * 50}ms` }} />
          ))}
        </div>

        {/* Card grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card overflow-hidden"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className="w-full animate-pulse bg-muted" style={{ aspectRatio: "16/9" }} />
              <div className="p-4 space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                <div className="h-3 w-full animate-pulse rounded bg-muted/60" />
                <div className="h-3 w-3/4 animate-pulse rounded bg-muted/40" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
