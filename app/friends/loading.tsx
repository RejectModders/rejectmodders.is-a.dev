export default function FriendsLoading() {
  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-primary/10">
        <div className="h-full bg-primary" style={{ animation: "loading-bar 1.4s ease-in-out infinite" }} />
      </div>
      <style>{`@keyframes loading-bar{0%{transform:translateX(-100%)}50%{transform:translateX(0%)}100%{transform:translateX(100%)}}`}</style>
      <div className="relative pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-12 space-y-3">
            <div className="h-3 w-16 animate-pulse rounded-full bg-primary/20" />
            <div className="h-12 w-48 animate-pulse rounded-lg bg-muted" />
            <div className="h-4 w-72 animate-pulse rounded bg-muted" />
          </div>
          <div className="mb-12 h-40 animate-pulse rounded-2xl border border-border bg-card" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-xl border border-border bg-card" />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

