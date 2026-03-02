"use client"

import { useEffect, useState } from "react"
import { RefreshCw } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [tick, setTick] = useState(true)

  useEffect(() => {
    console.error("[GlobalError]", error)
    const t = setInterval(() => setTick(v => !v), 600)
    return () => clearInterval(t)
  }, [error])

  const lines = [
    { prompt: true,  text: " bash --login",                         color: "#e2e8f0" },
    { prompt: false, text: "  [CRITICAL] Application shell crashed", color: "#f87171" },
    { prompt: false, text: `  Error: ${(error.message ?? "Unknown error").slice(0,52)}`, color: "#fb923c" },
    { prompt: false, text: "",                                       color: "" },
    { prompt: false, text: "  This is a top-level crash.",           color: "#94a3b8" },
    { prompt: false, text: "  The page will reload on retry.",       color: "#94a3b8" },
    ...(error.digest ? [{ prompt: false, text: `  digest: ${error.digest}`, color: "#475569" }] : []),
  ]

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "oklch(0.08 0.005 0)",
          color: "oklch(0.93 0.005 90)",
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          padding: "1.5rem",
          textAlign: "center",
        }}
      >
        <p style={{ margin: 0, fontSize: "0.75rem", color: "#fb923c", letterSpacing: "0.05em" }}>
          // critical error
        </p>
        <h1 style={{ margin: "0.5rem 0 0", fontSize: "clamp(4rem,15vw,8rem)", fontWeight: 700, lineHeight: 1, letterSpacing: "-0.02em" }}>
          500
        </h1>
        <p style={{ margin: "0.5rem 0 0", fontSize: "1rem", color: "#64748b", maxWidth: "28rem" }}>
          A critical error occurred in the application shell.
        </p>

        {/* Terminal card */}
        <div style={{ marginTop: "2rem", width: "100%", maxWidth: "36rem", borderRadius: "0.75rem", border: "1px solid #1e293b", backgroundColor: "#0f172a", textAlign: "left", overflow: "hidden" }}>
          {/* Title bar */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1rem", borderBottom: "1px solid #1e293b", backgroundColor: "#0a0f1a" }}>
            <div style={{ width: "0.75rem", height: "0.75rem", borderRadius: "50%", backgroundColor: "#ff5f57" }} />
            <div style={{ width: "0.75rem", height: "0.75rem", borderRadius: "50%", backgroundColor: "#febc2e" }} />
            <div style={{ width: "0.75rem", height: "0.75rem", borderRadius: "50%", backgroundColor: "#28c840" }} />
            <span style={{ marginLeft: "0.5rem", fontSize: "0.7rem", color: "#475569" }}>crash log — rejectmodders@is-a.dev</span>
          </div>
          {/* Lines */}
          <div style={{ padding: "1.25rem", fontSize: "0.8rem", lineHeight: "1.8" }}>
            {lines.map((line, i) => (
              <div key={i} style={{ display: "flex", gap: "0.5rem" }}>
                {line.prompt && (
                  <span style={{ flexShrink: 0 }}>
                    <span style={{ color: "#4ade80" }}>rejectmodders</span>
                    <span style={{ color: "#475569" }}>@</span>
                    <span style={{ color: "#22d3ee" }}>is-a.dev</span>
                    <span style={{ color: "#475569" }}>:~$</span>
                  </span>
                )}
                <span style={{ color: line.color }}>{line.text || "\u00a0"}</span>
              </div>
            ))}
            <span style={{ display: "inline-block", width: "0.5rem", height: "1rem", borderRadius: "2px", backgroundColor: "#f87171", opacity: tick ? 1 : 0, transition: "opacity 0.1s" }} />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "2rem", flexWrap: "wrap", justifyContent: "center" }}>
          <button
            onClick={reset}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1.25rem", borderRadius: "0.5rem", border: "1px solid rgba(251,146,60,0.5)", backgroundColor: "rgba(251,146,60,0.1)", color: "#fb923c", fontFamily: "inherit", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer" }}
          >
            <RefreshCw style={{ width: "1rem", height: "1rem" }} />
            retry
          </button>
          <a
            href="/"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1.25rem", borderRadius: "0.5rem", border: "1px solid #1e293b", backgroundColor: "#0f172a", color: "#e2e8f0", fontFamily: "inherit", fontSize: "0.8125rem", fontWeight: 600, textDecoration: "none" }}
          >
            ~/ home
          </a>
        </div>
      </body>
    </html>
  )
}

