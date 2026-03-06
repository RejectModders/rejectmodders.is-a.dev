"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Terminal, Maximize2, Minimize2, Minus } from "lucide-react"

import type { Line, ConfirmContext } from "./types"
import { col, L, BR, SITE_COLORS, CURSOR_COLORS, CURSOR_STYLE_NAMES, applySiteColor } from "./colors"
import { getCookie, loadSavedPreferences } from "./utils"
import { BOOT_LINES, ALL_CMDS, PREFIX_CMDS } from "./constants"
import { COMMANDS, ASYNC_CMDS } from "./commands"

export function TerminalEasterEgg() {
  const [open, setOpen] = useState(false)
  const [lines, setLines] = useState<Line[]>([...BOOT_LINES])
  const [input, setInput] = useState("")
  const [cmdHistory, setCmdHistory] = useState<string[]>([])
  const [histIdx, setHistIdx] = useState(-1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [pos, setPos] = useState({ x: 40, y: 40 })
  const [awaitingPassword, setAwaitingPassword] = useState(false)
  const [sudoPending, setSudoPending] = useState<string | null>(null)
  const [sudoAuthenticated, setSudoAuthenticated] = useState(false)
  const [awaitingConfirm, setAwaitingConfirm] = useState(false)
  const [confirmContext, setConfirmContext] = useState<ConfirmContext | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const dragOffset = useRef({ x: 0, y: 0 })

  // ── Keyboard shortcuts & Konami code ───────────────────────────────────────
  useEffect(() => {
    loadSavedPreferences()
    const KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"]
    let seq: string[] = []
    const onKey = (e: KeyboardEvent) => {
      // Ctrl+` or Cmd+` to toggle terminal
      if ((e.ctrlKey || e.metaKey) && e.key === "`") {
        e.preventDefault()
        setOpen(o => !o)
        return
      }
      // Konami code
      seq.push(e.key)
      if (seq.length > KONAMI.length) seq.shift()
      if (seq.join(",") === KONAMI.join(",")) {
        setOpen(true)
        seq = []
      }
    }
    // Listen for command palette open event
    const onOpenTerminal = () => setOpen(true)
    
    window.addEventListener("keydown", onKey)
    window.addEventListener("rm:open-terminal", onOpenTerminal)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("rm:open-terminal", onOpenTerminal)
    }
  }, [])

  // ── Focus input when opened ──────────────────────────────────────────────────
  useEffect(() => {
    if (open && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open, isMinimized])

  // ── Auto-scroll ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [lines])

  // ── Drag handling ────────────────────────────────────────────────────────────
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (isFullscreen) return
    dragging.current = true
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }
  }, [isFullscreen, pos])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return
      setPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y })
    }
    const onUp = () => { dragging.current = false }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
    }
  }, [])

  // ── Append lines ─────────────────────────────────────────────────────────────
  const appendLines = useCallback((newLines: Line[]) => {
    setLines(prev => [...prev, ...newLines])
  }, [])

  // ── Run command ──────────────────────────────────────────────────────────────
  const runCommand = useCallback(async (raw: string) => {
    const trimmed = raw.trim()
    if (!trimmed) return

    appendLines([L(`rm@rejectmodders.dev:~$ ${trimmed}`, col.green)])
    setCmdHistory(h => [trimmed, ...h.slice(0, 99)])
    setHistIdx(-1)

    const cmd = trimmed.toLowerCase()

    // ── Built-in commands ──────────────────────────────────────────────────────
    if (cmd === "clear") {
      setLines([...BOOT_LINES])
      return
    }

    if (cmd === "exit") {
      setOpen(false)
      return
    }

    // ── History command ────────────────────────────────────────────────────────
    if (cmd === "history") {
      const histLines = cmdHistory.slice(0, 20).map((c, i) => L(`  ${i + 1}  ${c}`, col.fg))
      appendLines([...histLines, BR()])
      return
    }

    // ── Sudo interception ──────────────────────────────────────────────────────
    if (cmd.startsWith("sudo ") && !sudoAuthenticated) {
      const sudoCmd = cmd.slice(5).trim()
      // Check if it's a known sudo command that doesn't need auth
      if (COMMANDS[cmd] || COMMANDS[`sudo ${sudoCmd}`]) {
        const handler = COMMANDS[cmd] || COMMANDS[`sudo ${sudoCmd}`]
        appendLines(handler!(trimmed))
        return
      }
      setSudoPending(trimmed)
      setAwaitingPassword(true)
      appendLines([L("[sudo] password for rm: ", col.muted)])
      return
    }

    // ── Cursor command (inline for state access) ───────────────────────────────
    if (cmd.startsWith("cursor")) {
      const arg = cmd.replace(/^cursor\s*/i, "").trim()

      if (arg === "break") {
        appendLines([
          L("SEIZURE WARNING", col.red),
          L("   This will cause rapid flashing, strobing colors and erratic", col.yellow),
          L("   movement on screen. Do NOT proceed if you have photosensitive", col.yellow),
          L("   epilepsy or are sensitive to flashing lights.", col.yellow),
          BR(),
          L("   Also: there is no undo except refreshing the page.", col.muted),
          BR(),
          L("Continue? [y/N] ", col.red),
        ])
        setConfirmContext({ type: "cursor-break" })
        setAwaitingConfirm(true)
        return
      }

      if (arg === "fix") {
        window.dispatchEvent(new CustomEvent("rm:cursor-fix"))
        const savedCursorColor = getCookie("rm_cursor_color")
        if (savedCursorColor) {
          const parts = savedCursorColor.split(",").map(Number)
          if (parts.length === 3 && parts.every(n => !isNaN(n)))
            window.dispatchEvent(new CustomEvent("rm:cursor-color", { detail: { r: parts[0], g: parts[1], b: parts[2] } }))
        }
        const savedCursorStyle = getCookie("rm_cursor_style")
        if (savedCursorStyle) window.dispatchEvent(new CustomEvent("rm:cursor-style", { detail: parseInt(savedCursorStyle) }))
        appendLines([L("cursor restored. boring again.", col.green), BR()])
        return
      }

      if (arg === "rainbow") {
        window.dispatchEvent(new CustomEvent("rm:cursor-rainbow"))
        appendLines([L("cursor is now rainbow. run 'cursor fix' to stop.", col.green), BR()])
        return
      }

      const styleNum = parseInt(arg)
      if (!isNaN(styleNum) && styleNum >= 1 && styleNum <= 5) {
        window.dispatchEvent(new CustomEvent("rm:cursor-style", { detail: styleNum }))
        appendLines([L(`Cursor style set to ${styleNum}: ${CURSOR_STYLE_NAMES[styleNum]}. Preference saved.`, col.green), BR()])
        return
      }

      if (!arg || !CURSOR_COLORS[arg]) {
        appendLines([
          L("Usage: cursor <color|style|break>", col.red),
          L("  cursor red / green / blue / cyan / purple / pink / orange / yellow / white", col.muted),
          L("  cursor 1-5  change cursor style", col.muted),
          L("  cursor break / fix / rainbow", col.muted),
          BR(),
        ])
        return
      }

      const [r, g, b] = CURSOR_COLORS[arg]
      window.dispatchEvent(new CustomEvent("rm:cursor-color", { detail: { r, g, b } }))
      appendLines([L(`Cursor color set to ${arg}. Preference saved.`, col.green), BR()])
      if (SITE_COLORS[arg]) {
        setConfirmContext({ type: "website-from-cursor", color: arg })
        setAwaitingConfirm(true)
        appendLines([L(`Also set website color to ${arg}? [Y/n] `, col.cyan)])
      }
      return
    }

    // ── Website command (inline for state access) ──────────────────────────────
    if (cmd.startsWith("website")) {
      const arg = cmd.replace(/^website\s*/i, "").trim()

      if (arg === "break") {
        appendLines([
          L("SEIZURE WARNING", col.red),
          L("   This will cause rapid flashing, extreme color shifts, spinning", col.yellow),
          L("   elements and full-page strobing. Do NOT proceed if you have", col.yellow),
          L("   photosensitive epilepsy or are sensitive to flashing lights.", col.yellow),
          BR(),
          L("   Also: the terminal will close and there is no undo except refreshing.", col.muted),
          BR(),
          L("Continue? [y/N] ", col.red),
        ])
        setConfirmContext({ type: "website-break" })
        setAwaitingConfirm(true)
        return
      }

      if (arg === "fix") {
        const html = document.documentElement
        for (let s = 1; s <= 5; s++) html.classList.remove(`website-break-${s}`)
        html.classList.remove("website-rainbow")
        const savedColor = getCookie("rm_site_color")
        if (savedColor && SITE_COLORS[savedColor]) applySiteColor(savedColor)
        window.dispatchEvent(new CustomEvent("rm:website-fix"))
        appendLines([L("website restored. back to normal.", col.green), BR()])
        return
      }

      if (arg === "rainbow") {
        const html = document.documentElement
        for (let s = 1; s <= 5; s++) html.classList.remove(`website-break-${s}`)
        html.classList.add("website-rainbow")
        appendLines([L("website is now rainbow. run 'website fix' to stop.", col.green), BR()])
        return
      }

      if (!arg || !SITE_COLORS[arg]) {
        appendLines([
          L("Usage: website <color|break>", col.red),
          L("Colors: red, orange, yellow, green, cyan, blue, purple, pink, white", col.muted),
          L("  website break / fix / rainbow", col.muted),
          BR(),
        ])
        return
      }

      window.dispatchEvent(new CustomEvent("rm:site-color", { detail: arg }))
      appendLines([L(`Site color set to ${arg}. Preference saved.`, col.green), BR()])
      if (CURSOR_COLORS[arg]) {
        setConfirmContext({ type: "cursor-from-website", color: arg })
        setAwaitingConfirm(true)
        appendLines([L(`Also set cursor color to ${arg}? [Y/n] `, col.cyan)])
      }
      return
    }

    // ── Theme command ──────────────────────────────────────────────────────────
    if (cmd.startsWith("theme")) {
      const t = cmd.replace(/^theme\s*/i, "").trim()
      if (t === "light") {
        window.dispatchEvent(new CustomEvent("rm:set-theme", { detail: "light" }))
        appendLines([L("Theme set to light. My eyes...", col.yellow), BR()])
        return
      }
      if (t === "dark") {
        window.dispatchEvent(new CustomEvent("rm:set-theme", { detail: "dark" }))
        appendLines([L("Theme set to dark. Much better.", col.green), BR()])
        return
      }
      appendLines([L("Usage: theme <dark|light>", col.red), BR()])
      return
    }

    // ── Async commands ─────────────────────────────────────────────────────────
    if (ASYNC_CMDS[cmd]) {
      appendLines([L("fetching...", col.muted)])
      const result = await ASYNC_CMDS[cmd]()
      appendLines(result)
      return
    }

    // ── Sync commands (exact match) ────────────────────────────────────────────
    const handler = COMMANDS[cmd]
    if (handler) {
      appendLines(handler(trimmed))
      return
    }

    // ── Prefix commands ────────────────────────────────────────────────────────
    for (const prefix of PREFIX_CMDS) {
      if (cmd.startsWith(prefix + " ") && COMMANDS[prefix]) {
        appendLines(COMMANDS[prefix]!(trimmed))
        return
      }
    }

    appendLines([L(`bash: ${trimmed}: command not found`, col.red), BR()])
  }, [appendLines, cmdHistory, sudoAuthenticated])

  // ── Key handling ─────────────────────────────────────────────────────────────
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const val = input
      setInput("")

      // ── Confirm prompt handling ──────────────────────────────────────────────
      if (awaitingConfirm && confirmContext) {
        setAwaitingConfirm(false)
        const answer = val.trim().toLowerCase()

        if (confirmContext.type === "website-break" || confirmContext.type === "cursor-break") {
          const accepted = answer === "y" || answer === "yes"
          appendLines([L(`> ${val || "n"}`, col.muted)])
          if (!accepted) {
            appendLines([L("good call. staying safe.", col.green), BR()])
            setConfirmContext(null)
            return
          }
          if (confirmContext.type === "cursor-break") {
            appendLines([L("initiating cursor_break.exe...", col.muted), BR()])
            setTimeout(() => appendLines([L("haha, you thought this would work..?", col.red)]), 1500)
            setTimeout(() => {
              appendLines([L("cursor is now permanently broken.", col.red), L("refresh or type cursor fix. good luck.", col.muted), BR()])
              window.dispatchEvent(new CustomEvent("rm:cursor-break"))
            }, 5000)
            const autoDelay = 5000 + 15000 + Math.random() * 5000
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent("rm:cursor-fix"))
              const savedCursorColor = getCookie("rm_cursor_color")
              if (savedCursorColor) {
                const parts = savedCursorColor.split(",").map(Number)
                if (parts.length === 3 && parts.every(n => !isNaN(n)))
                  window.dispatchEvent(new CustomEvent("rm:cursor-color", { detail: { r: parts[0], g: parts[1], b: parts[2] } }))
              }
              const savedCursorStyle = getCookie("rm_cursor_style")
              if (savedCursorStyle) window.dispatchEvent(new CustomEvent("rm:cursor-style", { detail: parseInt(savedCursorStyle) }))
              window.dispatchEvent(new CustomEvent("rm:bug-fix-toast"))
            }, autoDelay)
          } else {
            appendLines([L("initiating website_break.exe...", col.muted), BR()])
            setTimeout(() => setOpen(false), 800)
            const stages = [1,2,3,4,5]
            stages.forEach((stage, i) => {
              setTimeout(() => {
                const html = document.documentElement
                for (let s = 1; s <= 5; s++) html.classList.remove(`website-break-${s}`)
                html.classList.add(`website-break-${stage}`)
              }, 5000 + i * 8000)
            })
            const stage5At  = 5000 + 4 * 8000
            const autoDelay = stage5At + 5000 + Math.random() * 5000
            setTimeout(() => {
              const html = document.documentElement
              for (let s = 1; s <= 5; s++) html.classList.remove(`website-break-${s}`)
              html.classList.remove("website-rainbow")
              const savedColor = getCookie("rm_site_color")
              if (savedColor && SITE_COLORS[savedColor]) applySiteColor(savedColor)
              window.dispatchEvent(new CustomEvent("rm:bug-fix-toast"))
            }, autoDelay)
          }
          setConfirmContext(null)
          return
        }

        const accepted = answer === "" || answer === "y" || answer === "yes"
        appendLines([L(`> ${val || "y"}`, col.muted)])
        if (accepted) {
          if (confirmContext.type === "website-from-cursor") {
            window.dispatchEvent(new CustomEvent("rm:site-color", { detail: confirmContext.color }))
            appendLines([L(`Site color set to ${confirmContext.color}. Preference saved.`, col.green), BR()])
          } else {
            const rgb = CURSOR_COLORS[confirmContext.color ?? ""]
            if (rgb) {
              window.dispatchEvent(new CustomEvent("rm:cursor-color", { detail: { r: rgb[0], g: rgb[1], b: rgb[2] } }))
              appendLines([L(`Cursor color set to ${confirmContext.color}. Preference saved.`, col.green), BR()])
            }
          }
        } else {
          appendLines([L("Okay, keeping them separate.", col.muted), BR()])
        }
        setConfirmContext(null)
        return
      }

      // ── Password prompt ──────────────────────────────────────────────────────
      if (awaitingPassword) {
        setAwaitingPassword(false)
        appendLines([L(`[sudo] password for rm: ${"*".repeat(Math.max(val.length, 8))}`, col.muted)])

        if (val.toLowerCase() === "password") {
          setSudoAuthenticated(true)
          appendLines([L("authenticated", col.green), BR()])

          if (sudoPending) {
            const pending = sudoPending.trim()
            setSudoPending(null)
            const pendingCmd = pending.toLowerCase()
            const sub = pendingCmd.slice(5).trim()

            if (COMMANDS[pendingCmd]) {
              appendLines(COMMANDS[pendingCmd]!(pending))
            } else if (COMMANDS[sub]) {
              appendLines(COMMANDS[sub]!(sub))
            } else {
              const pl = ["apt install","apt-get install","apt","systemctl","cat","chmod","chown","npm","pip","python3","python","node"]
              let handled = false
              for (const p of pl) {
                if (sub.startsWith(p + " ") || sub === p) {
                  const h = COMMANDS["sudo " + p] ?? COMMANDS[p] ?? COMMANDS[p.split(" ")[0]]
                  if (h) { appendLines(h(sub)); handled = true; break }
                }
              }
              if (!handled) appendLines([L(`sudo: ${sub}: command not found`, col.red), BR()])
            }
          }
          setSudoAuthenticated(false)
        } else {
          setSudoPending(null)
          appendLines([
            L("sudo: 1 incorrect password attempt", col.red),
            L("sudo: Authentication failure", col.red),
            BR(),
          ])
        }
        return
      }

      runCommand(val)
      return
    }

    if (e.key === "ArrowUp") {
      e.preventDefault()
      setHistIdx(i => {
        const next = Math.min(i + 1, cmdHistory.length - 1)
        setInput(cmdHistory[next] ?? "")
        return next
      })
      return
    }

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHistIdx(i => {
        const next = Math.max(i - 1, -1)
        setInput(next === -1 ? "" : cmdHistory[next] ?? "")
        return next
      })
      return
    }

    if (e.key === "Tab") {
      e.preventDefault()
      const partial = input.toLowerCase()
      if (!partial) return
      const match = ALL_CMDS.find(c => c.startsWith(partial))
      if (match) setInput(match)
      return
    }
  }, [input, cmdHistory, runCommand, awaitingPassword, awaitingConfirm, confirmContext, sudoPending, appendLines])

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Minimized taskbar pill */}
      {open && isMinimized && (
        <div
          className="fixed bottom-4 left-4 z-50 flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg shadow-lg cursor-pointer hover:bg-muted/50 transition-colors font-mono text-xs"
          onClick={() => setIsMinimized(false)}
        >
          <Terminal className="w-3 h-3 text-primary" />
          <span className="text-muted-foreground">rm-terminal</span>
        </div>
      )}

      <AnimatePresence>
        {open && !isMinimized && (
          <>
            {isFullscreen && (
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
              />
            )}

            <motion.div
              key="terminal"
              ref={terminalRef}
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.18 }}
              style={isFullscreen ? {} : { left: pos.x, top: pos.y, position: "fixed", width: "740px", maxWidth: "calc(100vw - 2rem)", height: "500px", overflow: "hidden" }}
              className={
                isFullscreen
                  ? "fixed inset-4 z-50 flex flex-col bg-background border border-border rounded-xl shadow-2xl font-mono text-sm overflow-hidden"
                  : "z-50 flex flex-col bg-background border border-border rounded-xl shadow-2xl font-mono text-sm overflow-hidden"
              }
            >
              {/* Title bar */}
              <div
                onMouseDown={onMouseDown}
                className={`flex items-center gap-2 px-4 py-2 bg-muted/40 border-b border-border shrink-0 ${!isFullscreen ? "cursor-grab active:cursor-grabbing" : ""}`}
                style={{ userSelect: "none" }}
              >
                <div className="flex items-center gap-1.5 mr-1">
                  <button
                    onClick={() => setOpen(false)}
                    className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors flex items-center justify-center group"
                    title="Close"
                  >
                    <X className="w-2 h-2 text-red-900 opacity-0 group-hover:opacity-100" />
                  </button>
                  <button
                    onClick={() => setIsMinimized(true)}
                    className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors flex items-center justify-center group"
                    title="Minimize"
                  >
                    <Minus className="w-2 h-2 text-yellow-900 opacity-0 group-hover:opacity-100" />
                  </button>
                  <button
                    onClick={() => setIsFullscreen(f => !f)}
                    className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 transition-colors flex items-center justify-center group"
                    title={isFullscreen ? "Restore" : "Fullscreen"}
                  >
                    <Maximize2 className="w-2 h-2 text-green-900 opacity-0 group-hover:opacity-100" />
                  </button>
                </div>

                <Terminal className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-xs text-muted-foreground flex-1 text-center -ml-6">
                  rm@rejectmodders.dev: ~
                </span>

                <button
                  onClick={() => setIsFullscreen(f => !f)}
                  className="text-muted-foreground hover:text-foreground transition-colors ml-1"
                  title={isFullscreen ? "Restore" : "Fullscreen"}
                >
                  {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Output */}
              <div
                ref={outputRef}
                className="flex-1 min-h-0 overflow-y-auto overflow-x-auto p-4 space-y-0.5 cursor-text"
                onClick={() => inputRef.current?.focus()}
              >
                {lines.map((line, i) => (
                  <div key={i} className={`font-mono text-xs leading-5 whitespace-pre ${line.color}`}>
                    {line.text || "\u00A0"}
                  </div>
                ))}

                {/* Input line */}
                <div className="flex items-center font-mono text-xs">
                  <span className="text-green-400 mr-2">rm@rejectmodders.dev:~$</span>
                  <input
                    ref={inputRef}
                    type={awaitingPassword ? "password" : "text"}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent outline-none text-foreground caret-primary"
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
