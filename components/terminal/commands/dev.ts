import { col, L, BR } from "../colors"
import type { CommandHandler } from "../types"

// ── Development & Shell Commands ───────────────────────────────────────────────

export const devCommands: Record<string, CommandHandler> = {
  "git log": () => [
    L("commit a1b2c3d (HEAD -> main, origin/main)", col.yellow),
    L("Author: RejectModders <rm@rejectmodders.dev>", col.fg),
    L("Date:   " + new Date().toDateString(), col.fg),
    BR(),
    L("    feat: added more terminal easter egg commands", col.fg),
    BR(),
    L("commit f00dcafe", col.yellow),
    L("Author: RejectModders <rm@rejectmodders.dev>", col.fg),
    L("Date:   Sat Mar 1 2026", col.fg),
    BR(),
    L("    fix: restored truncated terminal-easter-egg.tsx", col.fg),
    BR(),
    L("commit deadbeef", col.yellow),
    L("Author: RejectModders <rm@rejectmodders.dev>", col.fg),
    L("Date:   Fri Feb 28 2026", col.fg),
    BR(),
    L("    init: portfolio v2 with konami code terminal", col.fg),
    BR(),
    L("(END - press q to quit)", col.muted),
    BR(),
  ],

  "git status": () => [
    L("On branch main", col.fg),
    L("Your branch is up to date with 'origin/main'.", col.fg),
    BR(),
    L("nothing to commit, working tree clean", col.green),
    BR(),
    L("(actually there are 47 uncommitted ideas)", col.muted),
    BR(),
  ],

  "git stash": () => [
    L("Saved working directory and index state", col.green),
    L('WIP on main: a1b2c3d "feat: more terminal commands"', col.muted),
    BR(),
  ],

  "git branch": () => [
    L("* main", col.green),
    L("  dev", col.fg),
    L("  feat/terminal-easter-egg", col.fg),
    L("  feat/vulnradar-integration", col.fg),
    L("  fix/cursor-magnet-issue", col.red),
    BR(),
    L("(5 branches, 1 deleted: 'fix/that-weird-bug')", col.muted),
    BR(),
  ],

  "git diff": () => [
    L("diff --git a/terminal-easter-egg.tsx b/terminal-easter-egg.tsx", col.fg),
    L("--- a/terminal-easter-egg.tsx", col.red),
    L("+++ b/terminal-easter-egg.tsx", col.green),
    L("@@ -1,5 +1,150 @@", col.cyan),
    L('+  "cat /etc/passwd": () => [...],', col.green),
    L('+  "htop": () => [...],', col.green),
    L('+  "git diff": () => [...],', col.green),
    L('+  // 50 more commands...', col.green),
    BR(),
    L("That's this very commit. Meta.", col.muted),
    BR(),
  ],

  "git log --oneline": () => [
    L("a1b2c3d (HEAD -> main) feat: massive terminal expansion", col.yellow),
    L("f00dcaf fix: particles SSR crash", col.fg),
    L("deadbee feat: command palette + theme toggle", col.fg),
    L("cafebab feat: floating CTA + rage-click + visitor counter", col.fg),
    L("0xdeadc feat: cached github api route", col.fg),
    L("1337420 feat: konami code terminal v1", col.fg),
    L("0000001 init: portfolio v2", col.muted),
    BR(),
  ],

  "git clone": (args) => {
    const repo = (args ?? "").replace(/git clone\s*/i, "").trim() || "https://github.com/RejectModders/rejectmodders.dev"
    return [
      L(`Cloning into '${repo.split("/").pop()}'...`, col.fg),
      L("remote: Enumerating objects: 1337, done.", col.muted),
      L("remote: Counting objects: 100% (1337/1337), done.", col.muted),
      L("Receiving objects: 100% (1337/1337), 4.20 MiB | 69.0 MiB/s, done.", col.green),
      BR(),
    ]
  },

  vim: () => [
    L("                                ", col.muted),
    L("  VIM - Vi IMproved  v9.1       ", col.fg),
    L("                                ", col.muted),
    L("  type  :q   to quit            ", col.fg),
    L("  type  :q!  to really quit     ", col.fg),
    L("  type  :wq  to save and quit   ", col.fg),
    BR(),
    L("  (you can't actually get out of this one)", col.muted),
    L("  (just type clear)", col.muted),
    BR(),
  ],

  nano: () => [
    L("  GNU nano 7.2     (new file)", col.fg),
    BR(),
    L("  [ This is nano. It's sensible. ]", col.green),
    BR(),
    L("  ^X Exit  ^O Save  ^G Help  ^K Cut  ^U Paste", col.primary),
    BR(),
  ],

  emacs: () => [
    L("GNU Emacs 29.1", col.fg),
    L("An operating system with a text editor included.", col.muted),
    BR(),
    L("  M-x butterfly     - fix bugs by flapping wings", col.fg),
    L("  M-x doctor        - tell emacs your problems", col.fg),
    L("  M-x psychoanalyze-pinhead - self explanatory", col.fg),
    L("  M-x zone          - watch emacs have a meltdown", col.fg),
    BR(),
    L("  (to exit: C-x C-c - if you dare)", col.muted),
    BR(),
  ],

  python3: (args) => {
    const code = (args ?? "").replace(/python3?\s*/i, "").trim()
    if (!code) return [
      L("Python 3.12.0 (main, Mar 1 2026)", col.green),
      L('Type "help", "copyright", "credits" or "license" for more information.', col.muted),
      L(">>> ", col.green),
      L("(type exit() to quit - jk just type clear)", col.muted),
      BR(),
    ]
    if (code === "import antigravity") return [L("(you're floating)", col.cyan), BR()]
    if (code === "import this") return [
      L("The Zen of Python, by Tim Peters", col.primary),
      L("Beautiful is better than ugly.", col.fg),
      L("Explicit is better than implicit.", col.fg),
      L("Simple is better than complex.", col.fg),
      L("Complex is better than complicated.", col.fg),
      L("Readability counts.", col.fg),
      BR(),
    ]
    try {
      const r = eval(code)
      return [L(`>>> ${code}`, col.muted), L(String(r), col.green), BR()]
    } catch {
      return [L(`SyntaxError: ${code}`, col.red), BR()]
    }
  },

  python: (args) => devCommands["python3"]!(args),

  node: (args) => {
    const code = (args ?? "").replace(/node\s*/i, "").trim()
    if (!code) return [
      L("Welcome to Node.js v22.0.0.", col.green),
      L('Type ".help" for more information.', col.muted),
      L("> ", col.green),
      BR(),
    ]
    return [L(`> ${code}`, col.muted), L("undefined", col.muted), BR()]
  },

  docker: (args) => {
    const sub = (args ?? "").replace(/docker\s*/i, "").trim() || "version"
    if (sub === "ps") return [
      L("CONTAINER ID   IMAGE          COMMAND         STATUS         PORTS     NAMES", col.primary),
      L("a1b2c3d4e5f6   next:latest    next start      Up 99 days     443/tcp   portfolio", col.green),
      L("deadbeef1234   postgres:15    pg_ctl start    Up 99 days     5432/tcp  db", col.fg),
      BR(),
    ]
    return [
      L(`Docker version 25.0.0, build a1b2c3d`, col.green),
      L("docker: '" + sub + "' is not a docker command.", sub === "version" ? col.fg : col.red),
      BR(),
    ]
  },

  "sudo apt install": (args) => {
    const pkg = (args ?? "").replace(/^(sudo\s+)?(apt-get\s+|apt\s+)(install\s+)?/i, "").trim() || "vim"
    return [
      L(`Reading package lists... Done`, col.fg),
      L(`Building dependency tree... Done`, col.fg),
      L(`The following NEW packages will be installed: ${pkg}`, col.fg),
      L(`0 upgraded, 1 newly installed, 0 to remove.`, col.fg),
      L(`Fetching ${pkg}...`, col.muted),
      L(`Selecting previously unselected package ${pkg}.`, col.muted),
      L(`Setting up ${pkg}... done.`, col.green),
      BR(),
      L("(nothing actually installed - this is a browser)", col.muted),
      BR(),
    ]
  },

  "apt install": (args) => devCommands["sudo apt install"]!(args),
  apt: (args) => devCommands["sudo apt install"]!(args),

  "npm install": (args) => {
    const pkg = (args ?? "").replace(/npm install\s*/i, "").trim() || "express"
    return [
      L(`npm warn deprecated ${pkg}@1.0.0: Please use the new version`, col.yellow),
      L(`added 847 packages from 214 contributors`, col.fg),
      L(`found 0 vulnerabilities (checked by VulnRadar)`, col.green),
      BR(),
    ]
  },

  npm: (args) => {
    const sub = (args ?? "").replace(/^npm\s*/i, "").trim() || "start"
    if (sub === "install") return devCommands["npm install"]!()
    return [
      L(`npm ${sub}`, col.muted),
      L("> rejectmodders.dev@0.1.0 " + sub, col.fg),
      L("> next " + sub, col.fg),
      BR(),
      L("  ▲ Next.js 16.1.6 (Turbopack)", col.fg),
      L("  - Local: http://localhost:3000", col.green),
      BR(),
    ]
  },

  pip: (args) => {
    const pkg = (args ?? "").replace(/^pip\s*install\s*/i, "").trim() || "vulnradar"
    return [
      L(`Collecting ${pkg}`, col.fg),
      L(`  Downloading ${pkg}-1.0.0-py3-none-any.whl (420 kB)`, col.fg),
      L("Installing collected packages: " + pkg, col.fg),
      L(`Successfully installed ${pkg}-1.0.0`, col.green),
      BR(),
    ]
  },

  brew: (args) => {
    const sub = (args ?? "").replace(/brew\s*/i, "").trim()
    return [
      L(`==> ${sub || "help"}`, col.green),
      L(`Error: Homebrew is not supported on Vercel Edge Runtime.`, col.red),
      L(`Try: sudo apt install ${sub || "<package>"}`, col.muted),
      BR(),
    ]
  },

  wget: (args) => {
    const url = (args ?? "").replace(/^wget\s*/i, "").trim() || "https://rejectmodders.dev"
    return [
      L(`--2026-03-01 00:00:00--  ${url}`, col.fg),
      L(`Resolving ${url.replace(/https?:\/\//,"")}... 76.76.21.21`, col.fg),
      L("Connecting to 76.76.21.21:443... connected.", col.fg),
      L("HTTP request sent, awaiting response... 200 OK", col.green),
      L("Length: unspecified [text/html]", col.fg),
      L("Saving to: 'index.html'", col.fg),
      BR(),
      L("index.html      [ <=>      ]  42.00K  --.-KB/s    in 0.01s", col.fg),
      BR(),
      L("2026-03-01 00:00:00 (4.20 MB/s) - 'index.html' saved [42069]", col.green),
      BR(),
    ]
  },

  chmod: (args) => {
    const parts = (args ?? "").replace(/^(sudo\s+)?chmod\s*/i, "").trim().split(/\s+/)
    const mode = parts[0] || "777"
    const file = parts[1] || "secrets.txt"
    return [
      L(`chmod: changing permissions of '${file}' to ${mode}`, col.fg),
      L(`chmod: Operation not permitted`, col.red),
      L(`  hint: try 'sudo chmod ${mode} ${file}'`, col.muted),
      BR(),
    ]
  },

  "sudo chmod": (args) => {
    const parts = (args ?? "").replace(/^(sudo\s+)?chmod\s*/i, "").trim().split(/\s+/)
    const mode = parts[0] || "777"
    const file = parts[1] || "secrets.txt"
    return [
      L(`chmod ${mode} ${file}`, col.muted),
      L(`permissions updated: ${file} → ${mode}`, col.green),
      L(`(ls -la would show: -rwxrwxrwx if 777)`, col.muted),
      BR(),
    ]
  },

  su: () => [
    L("Password: ", col.fg),
    L("su: Authentication failure", col.red),
    L("(there is no root here. only Next.js.)", col.muted),
    BR(),
  ],

  passwd: () => [
    L("Changing password for rm.", col.fg),
    L("Current password: ", col.fg),
    L("passwd: Authentication token manipulation error", col.red),
    L("(you can't change what doesn't exist)", col.muted),
    BR(),
  ],
}
