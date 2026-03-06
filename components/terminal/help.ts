import { col, L, BR } from "./colors"
import type { Line } from "./types"

// ── Help paginator ─────────────────────────────────────────────────────────────
export const HELP_PAGES: { title: string; rows: [string, string][] }[] = [
  { title: "SITE & INFO", rows: [
    ["whoami",             "who is running this"],
    ["ls / ls -la",        "list site pages"],
    ["pwd",                "print working directory"],
    ["cat about",          "read about.md"],
    ["cat readme",         "site readme"],
    ["cat vulnradar",      "VulnRadar info"],
    ["skills",             "skill levels"],
    ["links",              "social / contact links"],
    ["projects",           "pinned projects"],
    ["friends",            "list friends"],
    ["contact",            "how to reach me"],
  ]},
  { title: "SYSTEM", rows: [
    ["date / cal",         "date & calendar"],
    ["uname",              "system info"],
    ["neofetch",           "system info (fancy)"],
    ["top / ps / ps aux",  "processes"],
    ["htop",               "interactive process viewer"],
    ["df / free",          "disk & memory"],
    ["ifconfig",           "network interfaces"],
    ["env",                "environment variables"],
    ["status / uptime",    "live site health"],
    ["lsblk / mount",      "block devices & mounts"],
    ["lsof",               "open files & sockets"],
    ["id / groups",        "user & group info"],
  ]},
  { title: "FILE SYSTEM", rows: [
    ["cat /etc/passwd",    "/etc/passwd"],
    ["cat /etc/os-release","OS release info"],
    ["cat /proc/cpuinfo",  "CPU info"],
    ["cat /proc/meminfo",  "memory info"],
    ["cat /etc/hosts",     "hosts file"],
    ["cat /etc/motd",      "message of the day"],
    ["cat .bashrc",        "bash config"],
    ["cat /home/rm/todo",  "my todo list"],
    ["ls /  ls /home",     "list directories"],
    ["ls /home/rm",        "home directory"],
    ["find [path]",        "find files"],
    ["grep [pattern]",     "search in files"],
  ]},
  { title: "NETWORK", rows: [
    ["ping",               "ping the server"],
    ["curl",               "fetch site headers"],
    ["whois",              "whois lookup"],
    ["traceroute",         "trace the route"],
    ["nmap",               "port scan"],
    ["ssh",                "ssh into something"],
    ["netstat",            "network connections"],
    ["dig / nslookup",     "DNS lookup"],
    ["myip",               "your public IP"],
    ["ip addr",            "IP address info"],
    ["ss",                 "socket stats"],
    ["iptables / ufw",     "firewall rules"],
  ]},
  { title: "GIT & DEV", rows: [
    ["git log",            "commit history"],
    ["git log --oneline",  "compact history"],
    ["git status",         "repo status"],
    ["git diff",           "show changes"],
    ["git branch",         "list branches"],
    ["git stash",          "stash changes"],
    ["git clone [url]",    "clone a repo"],
    ["sudo apt install",   "install apt package"],
    ["npm install [p]",    "install npm package"],
    ["pip install [p]",    "install python pkg"],
    ["brew [cmd]",         "Homebrew (macOS)"],
    ["docker [cmd]",       "Docker"],
  ]},
  { title: "TOOLS & CRYPTO", rows: [
    ["base64 [txt]",       "encode to base64"],
    ["rot13 [txt]",        "rot13 encode/decode"],
    ["morse [txt]",        "encode to morse"],
    ["binary [txt]",       "encode to binary"],
    ["hex [txt]",          "encode to hex"],
    ["password",           "generate a password"],
    ["uuid",               "generate a UUID"],
    ["md5 [txt]",          "md5-ish hash"],
    ["md5sum [txt]",       "md5 checksum"],
    ["sha256sum [txt]",    "sha256 checksum"],
    ["openssl [cmd]",      "OpenSSL operations"],
    ["gpg / ssh-keygen",   "key operations"],
  ]},
  { title: "PROCESS & SCHEDULING", rows: [
    ["kill [pid]",         "send SIGTERM to PID"],
    ["killall [name]",     "kill by name"],
    ["watch [cmd]",        "repeat command"],
    ["crontab",            "cron jobs"],
    ["tmux",               "terminal multiplexer"],
    ["strace [cmd]",       "trace system calls"],
    ["last / w / who",     "logged in users"],
    ["history",            "command history"],
    ["alias",              "shell aliases"],
    ["export [k=v]",       "set env var"],
    ["source [file]",      "source a file"],
    ["which / type",       "find a command path"],
  ]},
  { title: "GAMES & FUN", rows: [
    ["dice [N]",           "roll N dice"],
    ["coinflip",           "flip a coin"],
    ["rps [choice]",       "rock paper scissors"],
    ["2048 / snake / doom","classic games (jk)"],
    ["hack",               "..."],
    ["matrix / cmatrix",   "go deeper"],
    ["rick",               "never gonna give you up"],
    ["doge",               "wow. such terminal."],
    ["nyan",               "nyan cat"],
    ["parrot",             "party parrot"],
    ["sl",                 "steam locomotive"],
    ["yes",                "yes yes yes yes yes"],
  ]},
  { title: "FUN & MISC", rows: [
    ["cowsay",             "a cow says something"],
    ["fortune",            "random fortune"],
    ["joke",               "programming joke"],
    ["quote",              "inspirational quote"],
    ["weather",            "weather report"],
    ["lolcat",             "rainbow text"],
    ["shrug / tableflip",  "emoticons"],
    ["whoishiring",        "who's hiring in sec"],
    ["ascii / banner",     "ASCII art"],
    ["cat amanda.txt",     "love"],
    ["cursor <color>",     "change cursor color (saved)"],
    ["cursor <1-5>",       "change cursor style (saved)"],
    ["cursor rainbow",     "cycle all colors"],
    ["cursor break",       "seizure warning"],
    ["cursor fix",         "undo cursor break / rainbow"],
    ["website <color>",    "change site accent color (saved)"],
    ["website rainbow",    "rainbow the whole site"],
    ["website break",      "seizure warning"],
    ["website fix",        "undo website break / rainbow"],
    ["theme <dark|light>", "toggle site theme (saved)"],
  ]},
  { title: "EDITORS & SHELL", rows: [
    ["vim",                "you can never leave"],
    ["nano",               "the sensible choice"],
    ["emacs",              "an OS with a text editor"],
    ["python3 / python",   "Python REPL-ish"],
    ["node",               "Node.js REPL-ish"],
    ["man [cmd]",          "manual page"],
    ["touch [file]",       "make a new file"],
    ["wc / sort / uniq",   "text utilities"],
    ["diff / tee",         "diff & redirect"],
    ["head / tail",        "file head/tail"],
    ["chmod / su / passwd","permissions & auth"],
    ["sudo please",        "ask nicely"],
  ]},
  { title: "SYSTEM OPS & EASTER EGGS", rows: [
    ["reboot / shutdown",        "restart / power off"],
    ["rm -rf /",                 "please don't"],
    [":(){ :|:& };:",            "fork bomb (jk)"],
    ["sudo make me a sandwich",  "make it yourself"],
    ["sudo please make...",      "okay."],
    ["cat secrets.txt",          "nice try"],
    ["sudo cat secrets.txt",     "spoilers inside"],
    ["env",                      "find the CTF flag"],
    ["fullscreen / minimize",    "window controls"],
    ["echo [text]",              "echo text"],
    ["clear",                    "clear terminal"],
    ["exit",                     "close terminal"],
  ]},
]

export const HELP_TOTAL = HELP_PAGES.length

export function buildHelpPage(page: number): Line[] {
  const p   = Math.max(1, Math.min(page, HELP_TOTAL))
  const { title, rows } = HELP_PAGES[p - 1]
  const C = 22, D = 28
  const border  = "─".repeat(C + 2)
  const border2 = "─".repeat(D + 2)
  const hdr = ` pg ${String(p).padStart(2)}/${HELP_TOTAL} · ${title}`
  const hdrPad = hdr.padEnd(C + 2)
  const nav = ` 'help <n>' for any page`
  const navPad = nav.padEnd(D + 2)
  const out: Line[] = [
    L(`┌${border}┬${border2}┐`, col.primary),
    L(`│${hdrPad}│${navPad}│`, col.primary),
    L(`├${"─".repeat(C + 2)}┼${"─".repeat(D + 2)}┤`, col.primary),
    L(`│ ${"command".padEnd(C)} │ ${"description".padEnd(D)} │`, col.muted),
    L(`├${"─".repeat(C + 2)}┼${"─".repeat(D + 2)}┤`, col.primary),
  ]
  for (const [cmd, desc] of rows) {
    const c = cmd.length  > C ? cmd.slice(0, C - 1) + "…" : cmd.padEnd(C)
    const d = desc.length > D ? desc.slice(0, D - 1) + "…" : desc.padEnd(D)
    out.push(L(`│ ${c} │ ${d} │`, col.fg))
  }
  out.push(L(`└${border}┴${border2}┘`, col.primary))
  out.push(BR())
  if (p < HELP_TOTAL) {
    out.push(L(`  ▶  help ${p + 1}  →  next page   (${HELP_TOTAL - p} remaining)`, col.cyan))
  } else {
    out.push(L(`  ✓  all ${HELP_TOTAL} pages complete - help 1 to restart`, col.green))
  }
  out.push(L(`  ▶  help --all  →  full linux command list`, col.muted))
  out.push(BR())
  return out
}
