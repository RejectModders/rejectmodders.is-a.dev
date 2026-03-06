// ── Terminal Types ─────────────────────────────────────────────────────────────

export interface Line {
  text: string
  color: string
}

export interface ConfirmContext {
  type: "cursor-break" | "website-break" | "cursor-from-website" | "website-from-cursor"
  color?: string
}

export type CommandHandler = (args?: string) => Line[]
export type AsyncCommandHandler = () => Promise<Line[]>
