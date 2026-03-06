import { col, L, BR } from "../colors"
import type { CommandHandler } from "../types"

// ── File System Commands ───────────────────────────────────────────────────────

export const filesystemCommands: Record<string, CommandHandler> = {
  "ls -la": () => [
    L("total 48", col.muted),
    L("drwxr-xr-x  8 rm   rm   4096 Mar  1 00:00 .", col.fg),
    L("drwxr-xr-x  3 root root 4096 Jan  1 00:00 ..", col.fg),
    L("-rw-r--r--  1 rm   rm    512 Mar  1 00:00 .env.local", col.red),
    L("-rw-r--r--  1 rm   rm   1024 Mar  1 00:00 README.md", col.fg),
    L("drwxr-xr-x  2 rm   rm   4096 Mar  1 00:00 app/", col.cyan),
    L("drwxr-xr-x  2 rm   rm   4096 Mar  1 00:00 components/", col.cyan),
    L("drwxr-xr-x  2 rm   rm   4096 Mar  1 00:00 public/", col.cyan),
    L("-rw-r--r--  1 rm   rm   2048 Mar  1 00:00 package.json", col.fg),
    L("-rw-r--r--  1 rm   rm    256 Mar  1 00:00 next.config.mjs", col.fg),
    L("-rw-------  1 rm   rm     42 Mar  1 00:00 secrets.txt", col.red),
    BR(),
    L("(you don't have permission to read secrets.txt)", col.muted),
    BR(),
  ],

  "cat /etc/passwd": () => [
    L("root:x:0:0:root:/root:/bin/bash", col.fg),
    L("daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin", col.fg),
    L("rm:x:1000:1000:RejectModders:/home/rm:/bin/bash", col.green),
    L("amanda:x:1001:1001:love:/home/amanda:/bin/bash", col.primary),
    L("nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin", col.muted),
    BR(),
    L("(you're snooping around /etc/passwd? classic.)", col.muted),
    BR(),
  ],

  "cat /etc/os-release": () => [
    L('NAME="Vercel Edge OS"', col.fg),
    L('VERSION="1.0.0 (LTS)"', col.fg),
    L('ID=vercel', col.fg),
    L('ID_LIKE=debian', col.fg),
    L('PRETTY_NAME="Vercel Edge OS 1.0.0 LTS"', col.green),
    L('VERSION_CODENAME=rejectmodders', col.primary),
    L('HOME_URL="https://rejectmodders.dev"', col.cyan),
    BR(),
  ],

  "cat /proc/cpuinfo": () => [
    L("processor   : 0", col.fg),
    L("vendor_id   : GenuineIntel", col.fg),
    L("model name  : Next.js Edge Runtime @ Infinity GHz", col.fg),
    L("cache size  : Unlimited (CDN-backed)", col.fg),
    L("bogomips    : 9999999.00", col.fg),
    L("flags       : sse4 avx tsx portfolio_mode easter_egg", col.muted),
    BR(),
  ],

  "cat /proc/meminfo": () => [
    L("MemTotal:        430000 kB", col.fg),
    L("MemFree:         351000 kB", col.fg),
    L("MemAvailable:    400000 kB", col.fg),
    L("Buffers:           1337 kB", col.fg),
    L("Cached:           69420 kB", col.fg),
    L("SwapTotal:       420000 kB", col.fg),
    L("SwapFree:        406630 kB", col.fg),
    BR(),
  ],

  "cat /etc/hosts": () => [
    L("127.0.0.1       localhost", col.fg),
    L("::1             localhost ip6-localhost ip6-loopback", col.fg),
    L("76.76.21.21     rejectmodders.dev", col.green),
    L("127.0.0.1       evil.com  # blocked", col.red),
    BR(),
  ],

  "cat /etc/motd": () => [
    L("Welcome to RejectModders Terminal v2.0", col.primary),
    BR(),
    L("  * You found the easter egg!", col.green),
    L("  * Type 'help' for commands", col.fg),
    L("  * Type 'exit' to close", col.fg),
    BR(),
    L("Last login: just now from your browser", col.muted),
    BR(),
  ],

  "cat .bashrc": () => [
    L("# .bashrc - rm@rejectmodders.dev", col.muted),
    BR(),
    L("export PS1='\\u@\\h:\\w\\$ '", col.fg),
    L("export EDITOR=vim", col.fg),
    L("export PATH=$PATH:~/.local/bin", col.fg),
    BR(),
    L("alias ll='ls -la'", col.cyan),
    L("alias gs='git status'", col.cyan),
    L("alias gp='git push'", col.cyan),
    L("alias hack='cd ~/vulnradar && python3 main.py'", col.cyan),
    BR(),
    L("# Load secrets (don't commit this!)", col.red),
    L("# source ~/.secrets", col.red),
    BR(),
  ],

  "cat /home/rm/todo.txt": () => [
    L("# todo.txt", col.primary),
    BR(),
    L("  [x] build VulnRadar", col.green),
    L("  [x] make portfolio terminal easter egg", col.green),
    L("  [x] add amanda.txt easter egg", col.green),
    L("  [ ] sleep more", col.red),
    L("  [ ] touch grass occasionally", col.red),
    L("  [ ] world domination", col.red),
    BR(),
  ],

  "ls /": () => [
    L("bin  boot  dev  etc  home  lib  media  mnt", col.fg),
    L("opt  proc  root  run  sbin  srv  sys  tmp", col.fg),
    L("usr  var  next.config.mjs  package.json", col.cyan),
    BR(),
  ],

  "ls /home": () => [
    L("total 2", col.muted),
    L("drwxr-xr-x  rm      4096 Mar  1 00:00", col.fg),
    L("drwxr-xr-x  amanda  4096 Mar  1 00:00", col.primary),
    BR(),
  ],

  "ls /home/rm": () => [
    L("total 8", col.muted),
    L("-rw-r--r--  .bashrc         512", col.fg),
    L("-rw-r--r--  .bash_history  1024", col.fg),
    L("-rw-------  .ssh/           256", col.red),
    L("-rw-r--r--  projects/      8192", col.cyan),
    L("-rw-r--r--  vulnradar/     4096", col.cyan),
    L("-rw-r--r--  todo.txt         42", col.yellow),
    BR(),
  ],

  "cat secrets.txt": () => [
    L("cat: secrets.txt: Permission denied", col.red),
    BR(),
    L("  hint: try 'sudo cat secrets.txt'", col.muted),
    BR(),
  ],

  "sudo cat secrets.txt": () => [
    L("# secrets.txt", col.primary),
    BR(),
    L("  1. The konami code opens this terminal.", col.fg),
    L("  2. rejectmodders is from Missouri.", col.fg),
    L("  3. VulnRadar was the tool I wished existed.", col.fg),
    L("  4. rm{y0u_f0und_th3_t3rm1n4l_e4st3r_egg}", col.red),
    L("  5. Amanda is love", col.primary),
    L("  6. I debug by adding print statements. Sorry.", col.muted),
    BR(),
  ],

  "cat .env.local": () => [
    L("cat: .env.local: Permission denied", col.red),
    L("(and there's nothing interesting in there anyway)", col.muted),
    BR(),
  ],

  touch: (args) => {
    const file = (args ?? "").replace("touch ", "").trim() || "newfile.txt"
    return [
      L(`touch: created '${file}'`, col.fg),
      L(`(not really - this is a browser, not a filesystem)`, col.muted),
      BR(),
    ]
  },

  find: (args) => {
    const q = (args ?? "").replace(/find\s*/i, "").trim() || "."
    return [
      L(`find ${q}`, col.muted),
      L("./app/page.tsx", col.fg),
      L("./components/terminal-easter-egg.tsx", col.fg),
      L("./components/custom-cursor.tsx", col.fg),
      L("./public/avatar.png", col.fg),
      L("./public/manifest.json", col.fg),
      L("./.secret-flag-do-not-read", col.red),
      BR(),
      L("(found 1337 files. some of them are yours.)", col.muted),
      BR(),
    ]
  },

  grep: (args) => {
    const q = (args ?? "").replace(/grep\s*/i, "").trim() || "password"
    return [
      L(`grep -r "${q}" .`, col.muted),
      L(`./app/globals.css:--primary: oklch(0.55 0.26 13);`, col.fg),
      L(`./components/terminal-easter-egg.tsx:// many many lines`, col.fg),
      q === "password" ? L("./NOT_A_REAL_FILE.txt:password=hunter2", col.red) : L("(no sensitive results)", col.green),
      BR(),
    ]
  },

  file: (args) => {
    const f = (args ?? "").replace(/^file\s*/i, "").trim() || "terminal-easter-egg.tsx"
    return [
      L(`${f}: TypeScript React component, ASCII text, with very long lines (fun)`, col.fg),
      BR(),
    ]
  },

  head: () => [
    L('"use client"', col.fg),
    L("", col.muted),
    L('import { useEffect, useRef, useState, useCallback } from "react"', col.fg),
    L('import { motion, AnimatePresence } from "framer-motion"', col.fg),
    L('import { X, Terminal, Maximize2, Minimize2, Minus } from "lucide-react"', col.fg),
    BR(),
    L("(first 5 lines of terminal-easter-egg.tsx)", col.muted),
    BR(),
  ],

  tail: () => [
    L("  )}", col.fg),
    L("}", col.fg),
    BR(),
    L("(last lines of terminal-easter-egg.tsx)", col.muted),
    L("(there's nothing secret down here)", col.muted),
    BR(),
  ],

  wc: (args) => {
    const target = (args ?? "").replace(/wc\s*/i, "").trim() || "terminal-easter-egg.tsx"
    return [
      L(`  2115  12420  98304 ${target}`, col.fg),
      L("(2115 lines, 12420 words, 98304 bytes)", col.muted),
      BR(),
    ]
  },

  sort: () => [L("amanda", col.primary), L("rejectmodders", col.fg), L("vulnradar", col.fg), BR()],
  uniq: () => [L("(no duplicates found - you're one of a kind)", col.green), BR()],

  diff: (args) => {
    const f = (args ?? "").replace(/diff\s*/i, "").trim()
    if (!f) return [L("Usage: diff <file1> <file2>", col.red), BR()]
    return [
      L(`diff ${f}`, col.muted),
      L("< old version", col.red),
      L("> new version (better)", col.green),
      BR(),
    ]
  },

  tee: (args) => {
    const f = (args ?? "").replace(/tee\s*/i, "").trim() || "output.txt"
    return [L(`tee: writing to ${f} (stdout only - no real filesystem)`, col.muted), BR()]
  },
}
