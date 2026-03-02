export default function AboutLoading() {
  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-primary/10">
        <div className="h-full bg-primary" style={{ animation: "loading-bar 1.4s ease-in-out infinite" }} />
      </div>
      <style>{`@keyframes loading-bar{0%{transform:translateX(-100%)}50%{transform:translateX(0%)}100%{transform:translateX(100%)}}`}</style>
      <div className="relative pt-24 pb-16 md:pt-32 md:pb-24">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-8 space-y-3">
          <div className="h-3 w-16 animate-pulse rounded-full bg-primary/20" />
          <div className="h-12 w-48 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="flex flex-col items-center gap-4 lg:items-start">
            <div className="h-40 w-40 animate-pulse rounded-2xl bg-muted" />
            <div className="grid w-full grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="h-64 animate-pulse rounded-xl bg-muted" />
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

