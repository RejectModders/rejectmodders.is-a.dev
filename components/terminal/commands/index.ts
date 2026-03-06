import { buildHelpPage, HELP_TOTAL } from "../help"
import { col, L, BR } from "../colors"
import { ALL_CMDS } from "../constants"
import type { CommandHandler, AsyncCommandHandler, Line } from "../types"

// Import all command categories
import { infoCommands } from "./info"
import { systemCommands } from "./system"
import { networkCommands } from "./network"
import { funCommands } from "./fun"
import { filesystemCommands } from "./filesystem"
import { toolsCommands } from "./tools"
import { devCommands } from "./dev"
import { sudoCommands } from "./sudo"

// ── Help command with pagination ───────────────────────────────────────────────
const helpCommands: Record<string, CommandHandler> = {
  help: (args) => {
    const raw = (args ?? "").replace(/^help\s*/i, "").trim()
    if (raw === "--all") return helpCommands["help --all"]!()
    const n = raw === "" ? 1 : parseInt(raw, 10)
    return buildHelpPage(isNaN(n) ? 1 : n)
  },

  "help --all": () => {
    const lines: Line[] = [
      L("# Full Linux Command Reference", col.primary),
      BR(),
      L("Available commands (use Tab to autocomplete):", col.fg),
      BR(),
    ]
    // Group commands by first letter
    const sorted = [...ALL_CMDS].sort()
    let currentLetter = ""
    let currentLine = ""
    for (const cmd of sorted) {
      const letter = cmd[0].toUpperCase()
      if (letter !== currentLetter) {
        if (currentLine) lines.push(L(`  ${currentLine}`, col.muted))
        currentLetter = letter
        lines.push(L(`  [${letter}]`, col.cyan))
        currentLine = ""
      }
      if (currentLine.length + cmd.length > 70) {
        lines.push(L(`    ${currentLine}`, col.muted))
        currentLine = cmd
      } else {
        currentLine += (currentLine ? ", " : "") + cmd
      }
    }
    if (currentLine) lines.push(L(`    ${currentLine}`, col.muted))
    lines.push(BR())
    lines.push(L(`Total: ${ALL_CMDS.length} commands. Pages: ${HELP_TOTAL}. Have fun.`, col.green))
    lines.push(BR())
    return lines
  },
}

// ── Aggregate all sync commands ────────────────────────────────────────────────
export const COMMANDS: Record<string, CommandHandler> = {
  ...helpCommands,
  ...infoCommands,
  ...systemCommands,
  ...networkCommands,
  ...funCommands,
  ...filesystemCommands,
  ...toolsCommands,
  ...devCommands,
  ...sudoCommands,
}

// ── Async commands (fetch real data) ───────────────────────────────────────────
export const ASYNC_CMDS: Record<string, AsyncCommandHandler> = {
  status: async () => {
    const start = performance.now()
    try {
      await fetch("/api/status")
      const ping = Math.round(performance.now() - start)
      return [
        L("Site Status: ONLINE", col.green),
        L(`Response time: ${ping}ms`, col.fg),
        L("Deployment: Vercel Edge Network", col.muted),
        BR(),
      ]
    } catch {
      return [L("Site Status: Error checking status", col.red), BR()]
    }
  },

  projects: async () => {
    try {
      const res = await fetch("/api/github")
      const repos = await res.json()
      if (!Array.isArray(repos) || !repos.length) {
        return [L("Could not fetch projects.", col.red), BR()]
      }
      const lines: Line[] = [L("# Pinned Projects", col.primary), BR()]
      for (const repo of repos.slice(0, 6)) {
        lines.push(L(`  ${repo.name}`, col.cyan))
        lines.push(L(`    ${repo.description || "No description"}`, col.muted))
        lines.push(L(`    ★ ${repo.stars}  ${repo.language || ""}`, col.fg))
        lines.push(BR())
      }
      return lines
    } catch {
      return [L("Could not fetch projects.", col.red), BR()]
    }
  },

  friends: async () => {
    try {
      const res = await fetch("/api/friends")
      const data = await res.json()
      if (!Array.isArray(data) || !data.length) {
        return [L("Could not fetch friends.", col.red), BR()]
      }
      const lines: Line[] = [L("# Friends", col.primary), BR()]
      for (const f of data) {
        lines.push(L(`  ${f.name}`, col.cyan))
        if (f.role) lines.push(L(`    ${f.role}`, col.muted))
        lines.push(BR())
      }
      return lines
    } catch {
      return [L("Could not fetch friends.", col.red), BR()]
    }
  },

  history: async () => {
    // This is handled specially in the component since it needs access to cmdHistory
    return [L("(history is handled by the terminal)", col.muted), BR()]
  },
}
