"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Terminal, Maximize2, Minimize2, Minus } from "lucide-react"

const KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"]

interface Line { text: string; color: string }

const col = {
  primary:  "text-primary",
  muted:    "text-muted-foreground",
  fg:       "text-foreground",
  green:    "text-green-400",
  red:      "text-red-400",
  yellow:   "text-yellow-400",
  cyan:     "text-cyan-400",
  orange:   "text-orange-400",
  none:     "",
}

const L = (text: string, color = col.muted): Line => ({ text, color })
const BR = (): Line => ({ text: "", color: "" })

// ── ASCII art logo ────────────────────────────────────────────────────────────
const LOGO_LINES: Line[] = [
  L(" ██████╗ ███╗   ███╗", col.primary),
  L(" ██╔══██╗████╗ ████║", col.primary),
  L(" ██████╔╝██╔████╔██║", col.primary),
  L(" ██╔══██╗██║╚██╔╝██║", col.primary),
  L(" ██║  ██║██║ ╚═╝ ██║", col.primary),
  L(" ╚═╝  ╚═╝╚═╝     ╚═╝", col.primary),
  L(" RejectModders Terminal v2.0", col.fg),
  BR(),
]

const BOOT_LINES: Line[] = [
  ...LOGO_LINES,
  L("Initializing shell...", col.green),
  L("Loaded 100 commands. Type 'help' to list them.", col.muted),
  L("Pro tip: use Tab to autocomplete, ↑/↓ for history.", col.muted),
  BR(),
]

// ── All available command names (for tab completion) ─────────────────────────
const ALL_CMDS = [
  "help","whoami","ls","ls -la","pwd","cat about","cat readme","cat vulnradar",
  "skills","links","projects","friends","contact","spotify",
  "status","uptime","date","uname","env","history",
  "echo","ping","curl","hack","matrix","ascii","banner",
  "sudo","rm -rf /","rm -rf / --no-preserve-root","exit","clear",
  "cowsay","fortune","joke","quote","weather","cal","top","ps","df","free",
  "ifconfig","whoishiring","flip","shrug","tableflip","unflip",
  "sl","lolcat","yes","neofetch","cmatrix",
  "man","whois","traceroute","nmap","ssh","git log","git status",
  "vim","nano","emacs","firefox","chrome","reboot","shutdown","dd","touch",
  // new commands
  "coinflip","dice","rps rock","rps paper","rps scissors",
  "base64","rot13","morse","binary","hex",
  "count","timer","stopwatch",
  "color","palette","gradient",
  "crypto","password","uuid",
  "cat secrets.txt","cat .env.local","sudo cat secrets.txt",
  "whoami --verbose","id","groups","last","w","who",
  "netstat","arp","route","dig","nslookup",
  "find","grep","awk","sed","sort","uniq","wc",
  "tar","zip","unzip","gzip","gunzip",
  "chmod","chown","su","useradd","passwd",
  "cron","crontab","at","watch","timeout",
  "kill","killall","pkill","nice","renice",
  "lsof","strace","ltrace","gdb",
  "python","python3","node","ruby","perl","php","java","go","rust","c",
  "npm","pip","cargo","gem","composer",
  "docker","kubectl","terraform","ansible","vagrant",
  "git","git init","git clone","git pull","git push","git commit","git branch","git diff",
  "curl wttr.in","curl parrot.live",
  "2048","snake","tetris","pong","doom",
  "sudo apt install","apt","yum","brew","pacman","dnf",
  "dmesg","journalctl","systemctl","service","init",
  "fsck","mount","umount","fdisk","lsblk","blkid",
  "ip","ip addr","ip route","ss","iptables","ufw",
  "openssl","gpg","ssh-keygen","ssh-copy-id",
  "speedtest","iperf","mtr","tcpdump","wireshark",
  "htop","glances","iotop","nethogs","bmon",
  "tmux","screen","byobu","tty","stty",
  "alias","unalias","export","source","which","whereis","type",
  "ln","readlink","stat","file","md5sum","sha256sum",
  "curl ifconfig.me","curl icanhazip.com",
  "xargs","tee","head","tail","less","more","cat","diff","patch",
  "make","cmake","gcc","g++","clang","rustc","javac",
  "git stash","git tag","git log --oneline",
  "fullscreen","minimize","maximize",
  "rick","doge","nyan","parrot",
  "sudo please","sudo make me a sandwich",
  ":(){ :|:& };:","while true","for i in","exit 1",
  "motd","banner2","figlet","toilet",
]

// ── Command map (sync) ────────────────────────────────────────────────────────
const COMMANDS: Record<string, (args?: string) => Line[]> = {
  help: () => [
    L("┌────────────────┬────────────────────────────────┐", col.primary),
    L("│ command        │ description                    │", col.primary),
    L("├────────────────┼────────────────────────────────┤", col.primary),
    L("│ -- SITE ──────────────────────────────────────── │", col.muted),
    L("│ whoami         │ who is running this            │", col.fg),
    L("│ ls / ls -la    │ list site pages                │", col.fg),
    L("│ cat about      │ read about.md                  │", col.fg),
    L("│ cat readme     │ site readme                    │", col.fg),
    L("│ cat vulnradar  │ vulnradar info                 │", col.fg),
    L("│ skills         │ skill levels                   │", col.fg),
    L("│ links          │ social / contact links         │", col.fg),
    L("│ projects       │ pinned projects                │", col.fg),
    L("│ friends        │ list friends                   │", col.fg),
    L("│ contact        │ how to reach me                │", col.fg),
    L("│ spotify        │ now playing                    │", col.fg),
    L("│ -- SYSTEM ────────────────────────────────────── │", col.muted),
    L("│ date / cal     │ date & calendar                │", col.fg),
    L("│ uname          │ system info                    │", col.fg),
    L("│ neofetch       │ system info (fancy)            │", col.fg),
    L("│ top / ps       │ processes                      │", col.fg),
    L("│ df / free      │ disk & memory                  │", col.fg),
    L("│ ifconfig       │ network interfaces             │", col.fg),
    L("│ env            │ environment variables          │", col.fg),
    L("│ status / uptime│ live site health               │", col.fg),
    L("│ -- NETWORK ───────────────────────────────────── │", col.muted),
    L("│ ping           │ ping the server                │", col.fg),
    L("│ curl           │ fetch site headers             │", col.fg),
    L("│ whois          │ whois lookup                   │", col.fg),
    L("│ traceroute     │ trace the route                │", col.fg),
    L("│ nmap           │ port scan                      │", col.fg),
    L("│ ssh            │ ssh into something             │", col.fg),
    L("│ netstat        │ network connections            │", col.fg),
    L("│ dig            │ dns lookup                     │", col.fg),
    L("│ myip           │ your public IP                 │", col.fg),
    L("│ -- GIT ───────────────────────────────────────── │", col.muted),
    L("│ git log        │ commit history                 │", col.fg),
    L("│ git status     │ repo status                    │", col.fg),
    L("│ git diff       │ show changes                   │", col.fg),
    L("│ git branch     │ list branches                  │", col.fg),
    L("│ -- TOOLS ─────────────────────────────────────── │", col.muted),
    L("│ base64 [txt]   │ encode to base64               │", col.fg),
    L("│ rot13 [txt]    │ rot13 encode/decode            │", col.fg),
    L("│ morse [txt]    │ encode to morse code           │", col.fg),
    L("│ binary [txt]   │ encode to binary               │", col.fg),
    L("│ hex [txt]      │ encode to hex                  │", col.fg),
    L("│ password       │ generate a password            │", col.fg),
    L("│ uuid           │ generate a uuid                │", col.fg),
    L("│ md5 [txt]      │ md5-ish hash                   │", col.fg),
    L("│ -- GAMES ─────────────────────────────────────── │", col.muted),
    L("│ dice [N]       │ roll N dice                    │", col.fg),
    L("│ coinflip       │ flip a coin                    │", col.fg),
    L("│ rps [choice]   │ rock paper scissors            │", col.fg),
    L("│ 2048           │ play 2048 (jk)                 │", col.fg),
    L("│ snake          │ play snake (jk)                │", col.fg),
    L("│ doom           │ it runs doom                   │", col.fg),
    L("│ -- FUN ───────────────────────────────────────── │", col.muted),
    L("│ hack           │ ...                            │", col.fg),
    L("│ matrix         │ go deeper                      │", col.fg),
    L("│ cmatrix        │ the real matrix                │", col.fg),
    L("│ rick           │ never gonna give you up        │", col.fg),
    L("│ doge           │ wow. such terminal.            │", col.fg),
    L("│ nyan           │ nyan cat                       │", col.fg),
    L("│ parrot         │ party parrot                   │", col.fg),
    L("│ ascii          │ print logo                     │", col.fg),
    L("│ banner         │ big text banner                │", col.fg),
    L("│ cowsay         │ a cow says something           │", col.fg),
    L("│ fortune        │ random fortune                 │", col.fg),
    L("│ joke           │ programming joke               │", col.fg),
    L("│ quote          │ inspirational quote            │", col.fg),
    L("│ weather        │ weather report                 │", col.fg),
    L("│ lolcat         │ rainbow text                   │", col.fg),
    L("│ yes            │ yes                            │", col.fg),
    L("│ sl             │ steam locomotive               │", col.fg),
    L("│ shrug          │ shrug emoticon                 │", col.fg),
    L("│ tableflip      │ flip a table                   │", col.fg),
    L("│ unflip         │ put it back                    │", col.fg),
    L("│ whoishiring    │ whos hiring in sec             │", col.fg),
    L("│ -- EDITORS ───────────────────────────────────── │", col.muted),
    L("│ vim            │ you can never leave            │", col.fg),
    L("│ nano           │ the sensible choice            │", col.fg),
    L("│ emacs          │ an OS with a text editor       │", col.fg),
    L("│ -- SYSTEM OPS ────────────────────────────────── │", col.muted),
    L("│ man [cmd]      │ manual page                    │", col.fg),
    L("│ touch [file]   │ make a new file                │", col.fg),
    L("│ reboot         │ restart the site               │", col.fg),
    L("│ shutdown       │ turn it all off                │", col.fg),
    L("│ :(){ :|:& };:  │ fork bomb (jk)                 │", col.fg),
    L("│ sudo [cmd]     │ try your luck                  │", col.fg),
    L("│ rm -rf /       │ please don't                   │", col.fg),
    L("│ -- TERMINAL ──────────────────────────────────── │", col.muted),
    L("│ fullscreen     │ toggle fullscreen              │", col.fg),
    L("│ history        │ command history                │", col.fg),
    L("│ echo [text]    │ echo text back                 │", col.fg),
    L("│ clear          │ clear terminal                 │", col.fg),
    L("│ exit           │ close terminal                 │", col.fg),
    L("└────────────────┴────────────────────────────────┘", col.primary),
    BR(),
    L("Tip: drag the title bar to move • click ⛶ to fullscreen", col.muted),
    BR(),
  ],

  whoami: () => [
    L("uid=1000(rejectmodders) gid=1000(rejectmodders)", col.green),
    L("groups=security,developer,founder,nerd", col.green),
    BR(),
    L("Name:       RejectModders", col.fg),
    L("Location:   Missouri, USA", col.fg),
    L("Role:       Cybersecurity Developer", col.fg),
    L("Focus:      Vulnerability research & security tooling", col.fg),
    L("Currently:  Building VulnRadar", col.primary),
    BR(),
  ],

  ls: () => [
    L("total 6", col.muted),
    L("drwxr-xr-x  /", col.muted),
    L("-rw-r--r--  home         /                  [ public ]", col.fg),
    L("-rw-r--r--  about        /about             [ public ]", col.fg),
    L("-rw-r--r--  projects     /projects          [ public ]", col.fg),
    L("-rw-r--r--  friends      /friends           [ public ]", col.fg),
    L("-rw-r--r--  spotify      /spotify           [ public ]", col.fg),
    L("-rw-------  secrets      /???               [ hidden ]", col.red),
    BR(),
  ],

  pwd: () => [
    L("https://rejectmodders.is-a.dev", col.cyan),
    BR(),
  ],

  "cat about": () => [
    L("# about.md", col.primary),
    BR(),
    L("Hey, I'm RejectModders.", col.fg),
    L("Cybersecurity developer from Missouri. I got into this stuff because I", col.muted),
    L("genuinely enjoy finding how things break — and then stopping it.", col.muted),
    BR(),
    L("Languages I actually use:", col.fg),
    L("  Python (main), C, C++, C# — I'll write it in whatever fits.", col.muted),
    BR(),
    L("What I do:", col.fg),
    L("  › Vulnerability research", col.muted),
    L("  › Security tooling & scanners", col.muted),
    L("  › Discord bot development (past)", col.muted),
    L("  › Open-source projects", col.muted),
    BR(),
    L("Currently:", col.primary),
    L("  Building VulnRadar — a platform with 175+ vulnerability checks,", col.muted),
    L("  severity ratings, and fix guidance. The tool I wished existed.", col.muted),
    BR(),
  ],

  "cat readme": () => [
    L("# rejectmodders.is-a.dev", col.primary),
    BR(),
    L("Personal portfolio built with:", col.fg),
    L("  Next.js 16, TypeScript, Tailwind CSS v4", col.muted),
    L("  Framer Motion, shadcn/ui", col.muted),
    L("  Deployed on Vercel", col.muted),
    BR(),
    L("Source: github.com/RejectModders/rejectmodders.is-a.dev", col.cyan),
    BR(),
    L("You found the terminal easter egg!", col.green),
    L("Trigger: ↑ ↑ ↓ ↓ ← → ← → B A", col.primary),
    BR(),
  ],

  "cat vulnradar": () => [
    L("# VulnRadar", col.primary),
    BR(),
    L("Security scanning platform built to find real vulnerabilities.", col.fg),
    BR(),
    L("Features:", col.fg),
    L("  › 175+ vulnerability checks", col.muted),
    L("  › Instant reports with severity ratings", col.muted),
    L("  › Fix guidance for every finding", col.muted),
    L("  › Headers, DNS, CSP, CORS analysis", col.muted),
    L("  › Email security (SPF, DKIM, DMARC)", col.muted),
    BR(),
    L("URL:    https://vulnradar.dev", col.cyan),
    L("GitHub: github.com/VulnRadar", col.cyan),
    BR(),
    L("This very site was scanned by VulnRadar.", col.primary),
    BR(),
  ],

  skills: () => [
    L("# skills.json — proficiency levels", col.primary),
    BR(),
    L("  Python              ████████████████████  95%", col.primary),
    L("  Cybersecurity       ██████████████████░░  90%", col.primary),
    L("  Git / GitHub        ██████████████████░░  90%", col.primary),
    L("  Vuln Research       █████████████████░░░  85%", col.primary),
    L("  Discord Bot Dev     █████████████████░░░  85%", col.primary),
    L("  Linux               █████████████████░░░  85%", col.primary),
    L("  C / C++             ████████████████░░░░  80%", col.fg),
    L("  C#                  ███████████████░░░░░  75%", col.fg),
    L("  JavaScript          ██████████████░░░░░░  70%", col.muted),
    L("  TypeScript          █████████████░░░░░░░  65%", col.muted),
    BR(),
  ],

  links: () => [
    L("# links", col.primary),
    BR(),
    L("  GitHub      https://github.com/RejectModders", col.cyan),
    L("  VulnRadar   https://vulnradar.dev", col.cyan),
    L("  Repo        https://github.com/RejectModders/rejectmodders.is-a.dev", col.cyan),
    BR(),
  ],

  projects: () => [
    L("# pinned projects", col.primary),
    BR(),
    L("  VulnRadar        Security scanning platform, 175+ checks", col.fg),
    L("                   https://vulnradar.dev", col.cyan),
    BR(),
    L("  Zero-Trace       CLI vulnerability scanner (CLI precursor to VulnRadar)", col.fg),
    L("                   github.com/RejectModders/Zero-Trace", col.cyan),
    BR(),
    L("  Disckit          Discord bot framework (Disutils era)", col.muted),
    L("  DisMusic         Discord music bot (Disutils era)", col.muted),
    BR(),
    L("  + more at /projects", col.muted),
    BR(),
  ],

  friends: () => [
    L("# friends.json — listing members...", col.primary),
    BR(),
    L("  [1]  Amanda        ♥  (classified)", col.primary),
    L("  [2]  HD            ●  realhd.dev", col.fg),
    L("  [3]  joe?          ●  just a guy", col.fg),
    L("  [4]  Jiggly Balls  ●  krish-space.is-a.dev", col.fg),
    L("  [5]  Alex Gallego  ●  nyalex.dev", col.fg),
    L("  [6]  FeralHS       ●  (lurker)", col.fg),
    L("  [7]  Wolf          ●  github.com/wolf4605", col.fg),
    L("  [8]  weebuhd       ●  (mysterious)", col.fg),
    L("  [9]  CrownScorpion ●  youtube.com/@crownscorpion", col.fg),
    L(" [10]  + others...   ●  /friends", col.muted),
    BR(),
  ],

  contact: () => [
    L("# contact", col.primary),
    BR(),
    L("  GitHub:    github.com/RejectModders", col.cyan),
    L("  VulnRadar: vulnradar.dev", col.cyan),
    L("  PRs:       github.com/RejectModders/rejectmodders.is-a.dev", col.cyan),
    BR(),
    L("  Or just open an issue. I'll see it.", col.muted),
    BR(),
  ],

  spotify: () => [
    L("Fetching now playing...", col.muted),
    L("(live data at /spotify)", col.muted),
    BR(),
    L("User:    31tfph3mamrlj4uch76albbptgay", col.fg),
    L("Profile: open.spotify.com/user/31tfph3mamrlj4uch76albbptgay", col.cyan),
    BR(),
    L("Visit /spotify for the live player.", col.muted),
    BR(),
  ],

  date: () => [
    L(new Date().toString(), col.green),
    BR(),
  ],

  uname: () => [
    L("Linux rejectmodders.is-a.dev 6.x.x #1 SMP x86_64 GNU/Linux", col.green),
    L("Next.js 16.1.6 / Vercel Edge Runtime", col.muted),
    BR(),
  ],

  env: () => [
    L("# environment (sanitized)", col.primary),
    BR(),
    L("  NODE_ENV=production", col.fg),
    L("  NEXT_PUBLIC_SITE=rejectmodders.is-a.dev", col.fg),
    L("  FLAG=rm{y0u_f0und_th3_t3rm1n4l_e4st3r_egg}", col.red),
    BR(),
    L("  nice try.", col.muted),
    BR(),
  ],

  ping: () => [
    L("PING rejectmodders.is-a.dev (76.76.21.21): 56 bytes", col.fg),
    L("64 bytes from 76.76.21.21: icmp_seq=0 ttl=57 time=4.2 ms", col.green),
    L("64 bytes from 76.76.21.21: icmp_seq=1 ttl=57 time=3.8 ms", col.green),
    L("64 bytes from 76.76.21.21: icmp_seq=2 ttl=57 time=4.1 ms", col.green),
    BR(),
    L("--- rejectmodders.is-a.dev ping statistics ---", col.fg),
    L("3 packets transmitted, 3 received, 0% packet loss", col.green),
    L("round-trip min/avg/max = 3.8/4.0/4.2 ms", col.muted),
    BR(),
  ],

  curl: () => [
    L("$ curl -I https://rejectmodders.is-a.dev", col.muted),
    BR(),
    L("HTTP/2 200", col.green),
    L("content-type: text/html; charset=utf-8", col.fg),
    L("x-powered-by: Next.js", col.fg),
    L("strict-transport-security: max-age=31536000; includeSubDomains; preload", col.fg),
    L("x-content-type-options: nosniff", col.fg),
    L("x-frame-options: DENY", col.fg),
    L("content-security-policy: default-src 'self'; ...", col.fg),
    L("cross-origin-embedder-policy: credentialless", col.fg),
    L("permissions-policy: camera=(), microphone=(), ...", col.fg),
    L("nel: {\"report_to\":\"default\",\"max_age\":86400}", col.fg),
    BR(),
  ],

  hack: () => [
    L("Initializing attack sequence...", col.red),
    L("Scanning target...", col.red),
    L("Bypassing firewall...", col.red),
    L("Accessing mainframe...", col.red),
    L("Decrypting database...", col.red),
    BR(),
    L("lol no.", col.primary),
    L("If you actually want to do security stuff, check out VulnRadar.", col.muted),
    L("https://vulnradar.dev", col.cyan),
    BR(),
  ],

  matrix: () => [
    L("Wake up, Neo...", col.green),
    L("The Matrix has you...", col.green),
    L("Follow the white rabbit.", col.green),
    BR(),
    L("01010010 01000101 01001010 01000101 01000011 01010100", col.green),
    L("01001101 01001111 01000100 01000100 01000101 01010010", col.green),
    L("01010011 00100000 01010010 01010101 01001100 01000101", col.green),
    BR(),
    L("(decoded: REJECTMODDERS RULE)", col.muted),
    BR(),
  ],

  ascii: () => [...LOGO_LINES],

  "sudo": (_args) => [
    L("sudo: you are not in the sudoers file.", col.red),
    L("This incident will be reported.", col.red),
    BR(),
  ],

  "rm -rf /": () => [
    L("rm: it is dangerous to operate recursively on '/'", col.red),
    L("rm: use --no-preserve-root to override this failsafe", col.red),
    BR(),
    L("nice try.", col.muted),
    BR(),
  ],

  "rm -rf / --no-preserve-root": () => [
    L("rm: removing all files in /...", col.red),
    L("rm: /bin... deleted", col.red),
    L("rm: /etc... deleted", col.red),
    L("rm: /usr... deleted", col.red),
    L("rm: /var... deleted", col.red),
    L("rm: /home... deleted", col.red),
    L("rm: /root... deleted", col.red),
    L("rm: /proc... deleted", col.red),
    BR(),
    L("bash: command not found: bash", col.red),
    L("sh: command not found: sh", col.red),
    BR(),
    L("lol jk. site's still up.", col.green),
    L("nice dedication though.", col.muted),
    BR(),
  ],

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

  neofetch: () => [
    L("        ███████╗          rm@rejectmodders.is-a.dev", col.primary),
    L("        ██╔══██╗          ─────────────────────────", col.primary),
    L("        ███████╔╝         OS:     Vercel Edge Linux", col.fg),
    L("        ██╔══██╗          Host:   rejectmodders.is-a.dev", col.fg),
    L("        ██║  ██║          Kernel: Next.js 16.1.6", col.fg),
    L("        ╚═╝  ╚═╝          Shell:  rm-terminal v2.0", col.fg),
    BR(),
    L("                          Resolution: ∞ × ∞", col.fg),
    L("                          DE: React 19 + Framer Motion", col.fg),
    L("                          WM: Tailwind CSS v4", col.fg),
    L("                          Theme: Dark (obviously)", col.fg),
    L("                          CPU: big brain", col.fg),
    L("                          Memory: 69mb / 420mb", col.fg),
    BR(),
    L("                          ████████████████████████", col.green),
    BR(),
  ],

  top: () => [
    L("top - " + new Date().toLocaleTimeString() + " up forever,  1 user", col.green),
    L("Tasks:   4 total,   1 running,   3 sleeping", col.fg),
    L("%Cpu(s): 0.1 us,  0.0 sy,  0.0 ni, 99.8 id", col.fg),
    L("MiB Mem:    420.0 total,   351.0 free,    69.0 used", col.fg),
    BR(),
    L("  PID USER      PR  NI    VIRT    RES  %CPU  %MEM COMMAND", col.primary),
    L("    1 rm         0   0  123456   4200   0.3   1.0 next-server", col.fg),
    L("    2 rm         0   0   98765   3100   0.1   0.7 vercel-edge", col.fg),
    L("    3 rm         0   0   45678   2100   0.0   0.5 tailwind", col.fg),
    L("   69 rm        20   0    1337    420   0.0   0.1 easter-egg", col.green),
    BR(),
    L("(you found process 69: easter-egg)", col.muted),
    BR(),
  ],

  ps: () => [
    L("  PID TTY          TIME CMD", col.primary),
    L("    1 ?        00:00:01 next-server", col.fg),
    L("    2 ?        00:00:00 vercel-edge", col.fg),
    L("   69 pts/0    00:00:00 easter-egg", col.green),
    L("  420 pts/0    00:00:00 bash", col.fg),
    L("  421 pts/0    00:00:00 ps", col.fg),
    BR(),
  ],

  df: () => [
    L("Filesystem       Size  Used Avail Use% Mounted on", col.primary),
    L("/dev/vercel      100G  4.2G   96G   4% /", col.fg),
    L("/dev/cdn         999G  420G  579G  42% /public", col.fg),
    L("tmpfs            420M   69M  351M  16% /tmp", col.fg),
    L("feelings          ∞G    ∞G    0G  100% /dev/null", col.red),
    BR(),
  ],

  free: () => [
    L("               total        used        free     shared    buff/cache", col.primary),
    L("Mem:          430000       69000      351000        1337       10000", col.fg),
    L("Swap:         420000       13370      406630", col.fg),
    BR(),
    L("(enough to keep this site running and your secrets safe)", col.muted),
    BR(),
  ],

  ifconfig: () => [
    L("eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500", col.fg),
    L("      inet 76.76.21.21  netmask 255.255.255.0  broadcast 76.76.21.255", col.fg),
    L("      inet6 ::1  prefixlen 128  scopeid 0x10<host>", col.fg),
    L("      ether 00:00:00:00:de:ad  txqueuelen 1000  (Ethernet)", col.fg),
    BR(),
    L("lo:   flags=73<UP,LOOPBACK,RUNNING>  mtu 65536", col.fg),
    L("      inet 127.0.0.1  netmask 255.0.0.0", col.fg),
    BR(),
  ],

  cal: () => {
    const now = new Date()
    const month = now.toLocaleString("default", { month: "long" })
    const year = now.getFullYear()
    const day = now.getDate()
    const firstDay = new Date(year, now.getMonth(), 1).getDay()
    const daysInMonth = new Date(year, now.getMonth() + 1, 0).getDate()
    const header = `      ${month} ${year}`
    const dayRow = "  Su  Mo  Tu  We  Th  Fr  Sa"
    let weeks = ""
    let d = 1
    for (let w = 0; w < 6; w++) {
      let row = ""
      for (let wd = 0; wd < 7; wd++) {
        const pos = w * 7 + wd
        if (pos < firstDay || d > daysInMonth) {
          row += "    "
        } else {
          const label = String(d).padStart(3, " ") + " "
          row += d === day ? `[${String(d).padStart(2)}]` : label
          d++
        }
      }
      if (row.trim()) weeks += row + "\n"
    }
    const lines: Line[] = [
      L(header, col.primary),
      L(dayRow, col.muted),
    ]
    weeks.trimEnd().split("\n").forEach(r => lines.push(L(r, col.fg)))
    lines.push(BR())
    return lines
  },

  cowsay: () => [
    L(" ________________________________", col.fg),
    L("< moo. you found the terminal. >", col.fg),
    L(" --------------------------------", col.fg),
    L("        \\   ^__^", col.fg),
    L("         \\  (oo)\\_______", col.fg),
    L("            (__)\\       )\\/\\", col.fg),
    L("                ||----w |", col.fg),
    L("                ||     ||", col.fg),
    BR(),
  ],

  fortune: () => {
    const fortunes = [
      "There's no place like 127.0.0.1.",
      "It works on my machine.",
      "Have you tried turning it off and on again?",
      "rm -rf / is not a valid debugging strategy.",
      "The best code is no code at all.",
      "A bug is just an undocumented feature.",
      "99 little bugs in the code... 99 little bugs... take one down, patch it around... 127 little bugs in the code.",
      "To understand recursion, you must first understand recursion.",
      "Go to sleep. The code will still be broken in the morning.",
      "Always code as if the person maintaining your code is a violent psychopath who knows where you live.",
      "Talk is cheap. Show me the code. — Linus Torvalds",
      "First, solve the problem. Then, write the code. — John Johnson",
    ]
    const f = fortunes[Math.floor(Math.random() * fortunes.length)]
    return [
      L("─────────────────────────────────────", col.muted),
      L(f, col.yellow),
      L("─────────────────────────────────────", col.muted),
      BR(),
    ]
  },

  joke: () => {
    const jokes = [
      ["Why do programmers prefer dark mode?", "Because light attracts bugs."],
      ["How many programmers does it take to change a light bulb?", "None — it's a hardware problem."],
      ["A SQL query walks into a bar...", "...walks up to two tables and asks: 'Can I join you?'"],
      ["Why do Java developers wear glasses?", "Because they don't C#."],
      ["What's a programmer's favourite hangout place?", "Foo Bar."],
      ["Why did the developer go broke?", "Because they used up all their cache."],
      ["What do you call a programmer from Finland?", "Nerdic."],
      ["Why was the JavaScript developer sad?", "Because they didn't Node how to Express themselves."],
      ["I have a joke about UDP...", "...but you might not get it."],
      ["There are 10 types of people in the world.", "Those who understand binary and those who don't."],
    ]
    const [setup, punchline] = jokes[Math.floor(Math.random() * jokes.length)]
    return [
      L(setup, col.fg),
      L(punchline, col.yellow),
      BR(),
    ]
  },

  quote: () => {
    const quotes = [
      ["The quieter you become, the more you can hear.", "— Ram Dass"],
      ["First, do no harm.", "— Hippocrates (also applies to prod deployments)"],
      ["The only way to do great work is to love what you do.", "— Steve Jobs"],
      ["Security is a process, not a product.", "— Bruce Schneier"],
      ["With great power comes great responsibility.", "— Uncle Ben (and sudo)"],
      ["The best defense is a good offense.", "— Sun Tzu / every pentester ever"],
      ["Simplicity is the ultimate sophistication.", "— Leonardo da Vinci"],
      ["Move fast and break things.", "— Zuckerberg (please don't do this in prod)"],
      ["If it's stupid but it works, it's not stupid.", "— Murphy's Other Law"],
      ["Never trust user input.", "— Every security engineer, always"],
    ]
    const [q, attr] = quotes[Math.floor(Math.random() * quotes.length)]
    return [
      L(`"${q}"`, col.cyan),
      L(`  ${attr}`, col.muted),
      BR(),
    ]
  },

  weather: () => [
    L("Weather for: rejectmodders.is-a.dev (76.76.21.21)", col.primary),
    BR(),
    L("  Location:    The Cloud™, Vercel Edge Region", col.fg),
    L("  Condition:   ⛅  Partly Cloudy with a chance of downtime", col.fg),
    L("  Temp:        20°C (68°F)", col.fg),
    L("  Humidity:    69%", col.fg),
    L("  Wind:        4.2 Gbps NNE", col.fg),
    L("  UV Index:    0 (it's a server room)", col.fg),
    BR(),
    L("  Forecast: Clear skies and fast response times all week.", col.green),
    BR(),
  ],

  lolcat: () => [
    L("R", "text-red-400"),
    L("e", "text-orange-400"),
    L("j", "text-yellow-400"),
    L("e", "text-green-400"),
    L("c", "text-cyan-400"),
    L("t", "text-blue-400"),
    L("M", "text-violet-400"),
    L("o", "text-red-400"),
    L("d", "text-orange-400"),
    L("d", "text-yellow-400"),
    L("e", "text-green-400"),
    L("r", "text-cyan-400"),
    L("s", "text-blue-400"),
    BR(),
    L("(lolcat applied. much rainbow. very wow.)", col.muted),
    BR(),
  ],

  yes: () => [
    L("y", col.fg),
    L("y", col.fg),
    L("y", col.fg),
    L("y", col.fg),
    L("y", col.fg),
    L("y", col.fg),
    L("y", col.fg),
    L("y", col.fg),
    L("y", col.fg),
    L("y", col.fg),
    L("^C", col.red),
    BR(),
  ],

  sl: () => [
    L("        ====        ________                ___________            ", col.yellow),
    L("    _D _|  |_______/        \\__I_I_____===__|_________|            ", col.yellow),
    L("     |(_)---  |   H\\________/ |   |        =|___ ___|    _________________", col.yellow),
    L("     /     |  |   H  |  |     |   |         ||_| |_||   _|                \\_____A", col.yellow),
    L("    |      |  |   H  |__--------------------| [___] |   =|                      |", col.yellow),
    L("    | ________|___H__/__|_____/[][]~\\_______|       |   -|                      |", col.yellow),
    L("    |/ |   |-----------I_____I [][] []  D   |=======|____|________________________|_", col.yellow),
    L("  __/ =| o |=-O=====O=====O=====O \\ ____Y___________|__|__________________________|_", col.yellow),
    L(" |/-=|___|=    ||    ||    ||    |_____/~\\___/          |_D__D__D_|  |_D__D__D_|", col.yellow),
    L("  \\_/      \\__/  \\__/  \\__/  \\__/      \\_/               \\_/   \\_/    \\_/   \\_/", col.yellow),
    BR(),
    L("CHOO CHOO! (install sl to avoid this)", col.muted),
    BR(),
  ],

  flip: () => {
    const result = Math.random() < 0.5 ? "HEADS" : "TAILS"
    return [
      L("Flipping coin...", col.muted),
      L(`  ● ${result}`, result === "HEADS" ? col.green : col.yellow),
      BR(),
    ]
  },

  shrug: () => [
    L("¯\\_(ツ)_/¯", col.fg),
    BR(),
  ],

  tableflip: () => [
    L("(╯°□°）╯︵ ┻━┻", col.red),
    BR(),
  ],

  unflip: () => [
    L("┬─┬ノ( º _ ºノ)", col.green),
    BR(),
  ],

  whoishiring: () => [
    L("# Who's Hiring in Security? (Mar 2026)", col.primary),
    BR(),
    L("  › Cloudflare         — Security Engineer", col.fg),
    L("    cloudflare.com/careers", col.cyan),
    BR(),
    L("  › Google Project Zero — Vulnerability Researcher", col.fg),
    L("    careers.google.com", col.cyan),
    BR(),
    L("  › Synack              — Pentest / Red Team", col.fg),
    L("    synack.com/company/careers", col.cyan),
    BR(),
    L("  › VulnRadar           — You? :)", col.primary),
    L("    vulnradar.dev", col.cyan),
    BR(),
    L("  Check HN: Who's Hiring thread for more.", col.muted),
    BR(),
  ],

  banner: () => [
    L("██████╗ ███╗   ███╗", col.primary),
    L("██╔══██╗████╗ ████║", col.primary),
    L("███████╔╝██╔████╔██║", col.primary),
    L("██╔══██╗██║╚██╔╝██║", col.primary),
    L("██║  ██║██║ ╚═╝ ██║", col.primary),
    L("╚═╝  ╚═╝╚═╝     ╚═╝", col.primary),
    BR(),
  ],

  cmatrix: () => [
    L("01001000 01100001 01100011 01101011", col.green),
    L("01100101 01110010 00100000 01110011", col.green),
    L("01110000 01101111 01110100 01110100", col.green),
    L("01100101 01100100 00100001 00100000", col.green),
    BR(),
    L("Decoded: Hacker spotted! ", col.muted),
    L("The matrix is just Next.js all the way down.", col.primary),
    BR(),
  ],

  whois: () => [
    L("% WHOIS rejectmodders.is-a.dev", col.muted),
    BR(),
    L("  Domain Name:   REJECTMODDERS.IS-A.DEV", col.fg),
    L("  Registrar:     is-a.dev (open-source subdomain project)", col.fg),
    L("  Created:       2024", col.fg),
    L("  Status:        ACTIVE", col.green),
    L("  Name Servers:  ns1.vercel-dns.com, ns2.vercel-dns.com", col.fg),
    L("  Owner:         RejectModders", col.primary),
    BR(),
    L("  whois github.com/is-a-dev/register for your own!", col.muted),
    BR(),
  ],

  traceroute: () => [
    L("traceroute to rejectmodders.is-a.dev (76.76.21.21)", col.fg),
    BR(),
    L(" 1  your-router (192.168.1.1)          0.4 ms", col.fg),
    L(" 2  isp-gateway (10.0.0.1)             2.1 ms", col.fg),
    L(" 3  backbone-1 (45.12.34.56)           8.3 ms", col.fg),
    L(" 4  cloudflare-edge (104.21.0.1)      12.7 ms", col.fg),
    L(" 5  vercel-edge (76.76.21.1)          14.2 ms", col.fg),
    L(" 6  rejectmodders.is-a.dev (76.76.21.21)  14.9 ms", col.green),
    BR(),
    L("6 hops. not bad.", col.muted),
    BR(),
  ],

  nmap: () => [
    L("Starting Nmap scan on rejectmodders.is-a.dev...", col.fg),
    BR(),
    L("  PORT    STATE  SERVICE", col.primary),
    L("  80/tcp  open   http     → redirects to HTTPS", col.fg),
    L("  443/tcp open   https    → Next.js 16", col.green),
    L("  22/tcp  closed ssh      → nice try", col.red),
    L("  3306    closed mysql    → really nice try", col.red),
    L("  6969    open   easter   → you're already in it", col.yellow),
    BR(),
    L("Nmap done: 1 IP address scanned.", col.muted),
    BR(),
  ],

  ssh: () => [
    L("ssh rm@rejectmodders.is-a.dev", col.muted),
    BR(),
    L("ssh: connect to host rejectmodders.is-a.dev port 22: Connection refused", col.red),
    BR(),
    L("Yeah, no SSH here. It's a static site.", col.muted),
    L("Try the terminal easter egg instead (you already did).", col.muted),
    BR(),
  ],

  "git log": () => [
    L("commit a1b2c3d (HEAD -> main, origin/main)", col.yellow),
    L("Author: RejectModders <rm@rejectmodders.is-a.dev>", col.fg),
    L("Date:   " + new Date().toDateString(), col.fg),
    BR(),
    L("    feat: added more terminal easter egg commands", col.fg),
    BR(),
    L("commit f00dcafe", col.yellow),
    L("Author: RejectModders <rm@rejectmodders.is-a.dev>", col.fg),
    L("Date:   Sat Mar 1 2026", col.fg),
    BR(),
    L("    fix: restored truncated terminal-easter-egg.tsx", col.fg),
    BR(),
    L("commit deadbeef", col.yellow),
    L("Author: RejectModders <rm@rejectmodders.is-a.dev>", col.fg),
    L("Date:   Fri Feb 28 2026", col.fg),
    BR(),
    L("    init: portfolio v2 with konami code terminal", col.fg),
    BR(),
    L("(END — press q to quit)", col.muted),
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
    L("  M-x butterfly     — fix bugs by flapping wings", col.fg),
    L("  M-x doctor        — tell emacs your problems", col.fg),
    L("  M-x psychoanalyze-pinhead — self explanatory", col.fg),
    L("  M-x zone          — watch emacs have a meltdown", col.fg),
    BR(),
    L("  (to exit: C-x C-c — if you dare)", col.muted),
    BR(),
  ],

  reboot: () => [
    L("Broadcast message from rm@rejectmodders.is-a.dev:", col.red),
    L("The system is going down for reboot NOW!", col.red),
    BR(),
    L("...", col.muted),
    L("...", col.muted),
    L("just kidding. Vercel handles uptime.", col.green),
    BR(),
  ],

  shutdown: () => [
    L("Broadcast message from rm@rejectmodders.is-a.dev:", col.red),
    L("The system is going down for poweroff NOW!", col.red),
    BR(),
    L("...", col.muted),
    L("...", col.muted),
    L("nah. site stays up.", col.green),
    BR(),
  ],

  touch: (args) => {
    const file = (args ?? "").replace("touch ", "").trim() || "newfile.txt"
    return [
      L(`touch: created '${file}'`, col.fg),
      L(`(not really — this is a browser, not a filesystem)`, col.muted),
      BR(),
    ]
  },

  man: (args) => {
    const cmd = (args ?? "").replace("man ", "").trim()
    if (!cmd) return [L("What manual page do you want?", col.red), BR()]
    return [
      L(`MAN(1)                    User Commands                   MAN(1)`, col.primary),
      BR(),
      L(`NAME`, col.fg),
      L(`       ${cmd} — a command in the rm-terminal`, col.fg),
      BR(),
      L(`SYNOPSIS`, col.fg),
      L(`       ${cmd} [options]`, col.fg),
      BR(),
      L(`DESCRIPTION`, col.fg),
      L(`       ${cmd} does exactly what you think it does.`, col.fg),
      L(`       Trust the process.`, col.muted),
      BR(),
      L(`BUGS`, col.fg),
      L(`       Probably. Report them on GitHub.`, col.muted),
      BR(),
      L(`(END — press q to quit)`, col.muted),
      BR(),
    ]
  },

  firefox: () => [
    L("Error: cannot open Firefox in a terminal.", col.red),
    L("You're already in a browser.", col.muted),
    L("That's not how any of this works.", col.muted),
    BR(),
  ],

  chrome: () => [
    L("Error: cannot open Chrome in a terminal.", col.red),
    L("You're already in a browser.", col.muted),
    L("Also Chrome is using 4GB of your RAM right now.", col.muted),
    BR(),
  ],

  dd: () => [
    L("dd: warning: this will destroy your data", col.red),
    L("dd: skipping... (no drives found in browser)", col.muted),
    L("phew.", col.green),
    BR(),
  ],

  // ── NEW COMMANDS ──────────────────────────────────────────────────────────

  coinflip: () => {
    const r = Math.random() < 0.5 ? "HEADS 🪙" : "TAILS 🪙"
    return [L("Flipping...", col.muted), L(`  → ${r}`, col.yellow), BR()]
  },


  dice: (args) => {
    const n = Math.min(parseInt((args ?? "").replace(/\D/g, "") || "1"), 10)
    const rolls = Array.from({ length: n }, () => Math.floor(Math.random() * 6) + 1)
    const faces = ["", "⚀","⚁","⚂","⚃","⚄","⚅"]
    return [
      L(`Rolling ${n}d6...`, col.muted),
      L(`  ${rolls.map(r => faces[r]).join("  ")}`, col.yellow),
      L(`  Values: ${rolls.join(", ")}  →  Total: ${rolls.reduce((a,b) => a+b, 0)}`, col.fg),
      BR(),
    ]
  },

  rps: (args) => {
    const choices = ["rock","paper","scissors"] as const
    const icons = { rock: "🪨", paper: "📄", scissors: "✂️" }
    const raw = (args ?? "").replace(/^rps\s*/i, "").trim().toLowerCase() as typeof choices[number]
    const player = choices.includes(raw) ? raw : choices[Math.floor(Math.random() * 3)]
    const cpu = choices[Math.floor(Math.random() * 3)]
    const win = (player === "rock" && cpu === "scissors") ||
                (player === "paper" && cpu === "rock") ||
                (player === "scissors" && cpu === "paper")
    const result = player === cpu ? "TIE 🤝" : win ? "YOU WIN 🎉" : "YOU LOSE 💀"
    return [
      L(`  You:      ${icons[player]} ${player}`, col.fg),
      L(`  Computer: ${icons[cpu]} ${cpu}`, col.fg),
      L(`  Result:   ${result}`, win ? col.green : player === cpu ? col.yellow : col.red),
      BR(),
    ]
  },

  base64: (args) => {
    const txt = (args ?? "").replace(/^base64\s*/i, "").trim()
    if (!txt) return [L("Usage: base64 <text>", col.red), BR()]
    try {
      const encoded = btoa(unescape(encodeURIComponent(txt)))
      return [L(`  Input:   ${txt}`, col.muted), L(`  Base64:  ${encoded}`, col.green), BR()]
    } catch {
      return [L("Error encoding text.", col.red), BR()]
    }
  },

  rot13: (args) => {
    const txt = (args ?? "").replace(/^rot13\s*/i, "").trim()
    if (!txt) return [L("Usage: rot13 <text>", col.red), BR()]
    const encoded = txt.replace(/[a-zA-Z]/g, c => {
      const base = c <= "Z" ? 65 : 97
      return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base)
    })
    return [L(`  Input:   ${txt}`, col.muted), L(`  ROT13:   ${encoded}`, col.green), BR()]
  },

  morse: (args) => {
    const txt = (args ?? "").replace(/^morse\s*/i, "").trim().toUpperCase()
    if (!txt) return [L("Usage: morse <text>", col.red), BR()]
    const map: Record<string, string> = {
      A:".-",B:"-...",C:"-.-.",D:"-..",E:".",F:"..-.",G:"--.",H:"....",I:"..",
      J:".---",K:"-.-",L:".-..",M:"--",N:"-.",O:"---",P:".--.",Q:"--.-",
      R:".-.",S:"...",T:"-",U:"..-",V:"...-",W:".--",X:"-..-",Y:"-.--",Z:"--..",
      "0":"-----","1":".----","2":"..---","3":"...--","4":"....-","5":".....",
      "6":"-....","7":"--...","8":"---..","9":"----.",".":`.-.-.-`,",":`--..--`,
      "?":"..--..","/":"-..-.","!":`-.-.--`," ":"/"
    }
    const encoded = txt.split("").map(c => map[c] ?? "?").join(" ")
    return [L(`  Input:  ${txt}`, col.muted), L(`  Morse:  ${encoded}`, col.green), BR()]
  },

  binary: (args) => {
    const txt = (args ?? "").replace(/^binary\s*/i, "").trim()
    if (!txt) return [L("Usage: binary <text>", col.red), BR()]
    const encoded = txt.split("").map(c => c.charCodeAt(0).toString(2).padStart(8,"0")).join(" ")
    return [
      L(`  Input:   ${txt}`, col.muted),
      L(`  Binary:  ${encoded.slice(0, 80)}${encoded.length > 80 ? "..." : ""}`, col.green),
      BR(),
    ]
  },

  hex: (args) => {
    const txt = (args ?? "").replace(/^hex\s*/i, "").trim()
    if (!txt) return [L("Usage: hex <text>", col.red), BR()]
    const encoded = txt.split("").map(c => c.charCodeAt(0).toString(16).padStart(2,"0")).join(" ")
    return [L(`  Input:  ${txt}`, col.muted), L(`  Hex:    ${encoded}`, col.green), BR()]
  },

  password: () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|"
    const pw = Array.from({length: 20}, () => chars[Math.floor(Math.random() * chars.length)]).join("")
    return [
      L("Generated password (20 chars):", col.primary),
      L(`  ${pw}`, col.green),
      BR(),
      L("(don't actually use terminal-generated passwords)", col.muted),
      BR(),
    ]
  },

  uuid: () => {
    const id = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0
      return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16)
    })
    return [L(`  UUID: ${id}`, col.green), BR()]
  },

  md5: (args) => {
    const txt = (args ?? "").replace(/^md5\s*/i, "").trim()
    if (!txt) return [L("Usage: md5 <text>", col.red), BR()]
    // Not real MD5 (no crypto in browser without async), but looks fun
    const fake = Array.from({length: 32}, () => Math.floor(Math.random() * 16).toString(16)).join("")
    return [
      L(`  Input:  ${txt}`, col.muted),
      L(`  MD5:    ${fake}`, col.green),
      L("  (simulated — use a real tool for actual hashing)", col.muted),
      BR(),
    ]
  },

  myip: () => [
    L("Fetching your IP...", col.muted),
    L("  (this is a static terminal, so here's a fun fact instead)", col.muted),
    L("  Your IP is visible to every server you connect to.", col.fg),
    L("  Consider a VPN if that bothers you.", col.muted),
    L("  Real check: curl ifconfig.me in your actual terminal.", col.cyan),
    BR(),
  ],

  netstat: () => [
    L("Active Internet connections (servers and established)", col.primary),
    BR(),
    L("Proto  Local Address           Foreign Address         State", col.muted),
    L("tcp    0.0.0.0:443             0.0.0.0:*               LISTEN", col.fg),
    L("tcp    0.0.0.0:80              0.0.0.0:*               LISTEN", col.fg),
    L("tcp    127.0.0.1:3000          127.0.0.1:52341         ESTABLISHED", col.green),
    L("tcp    76.76.21.21:443         your-ip:*               ESTABLISHED", col.green),
    L("tcp    0.0.0.0:6969            0.0.0.0:*               LISTEN", col.yellow),
    BR(),
    L("Port 6969: easter-egg service (you're connected)", col.muted),
    BR(),
  ],

  dig: (args) => {
    const domain = (args ?? "").replace(/^dig\s*/i, "").trim() || "rejectmodders.is-a.dev"
    return [
      L(`; <<>> DiG 9.18 <<>> ${domain}`, col.muted),
      L(";; QUESTION SECTION:", col.fg),
      L(`;${domain}.    IN  A`, col.fg),
      BR(),
      L(";; ANSWER SECTION:", col.fg),
      L(`${domain}.    300  IN  A  76.76.21.21`, col.green),
      L(`${domain}.    300  IN  A  76.76.21.22`, col.green),
      BR(),
      L(";; Query time: 4 msec", col.muted),
      L(";; SERVER: 1.1.1.1#53(1.1.1.1)", col.muted),
      BR(),
    ]
  },

  "git diff": () => [
    L("diff --git a/components/terminal-easter-egg.tsx b/components/terminal-easter-egg.tsx", col.fg),
    L("--- a/components/terminal-easter-egg.tsx", col.red),
    L("+++ b/components/terminal-easter-egg.tsx", col.green),
    L("@@ -1,3 +1,3 @@", col.cyan),
    L("-  Loaded 50 commands.", col.red),
    L("+  Loaded 100 commands.", col.green),
    L("+  // added 50 more fun commands", col.green),
    BR(),
    L("1 file changed, 50 insertions(+), 1 deletion(-)", col.muted),
    BR(),
  ],

  "git branch": () => [
    L("* main", col.green),
    L("  dev", col.fg),
    L("  feat/more-terminal-cmds", col.fg),
    L("  feat/draggable-terminal", col.fg),
    L("  fix/help-table-alignment", col.muted),
    BR(),
  ],

  rick: () => [
    L("♪ Never gonna give you up", col.primary),
    L("♪ Never gonna let you down", col.primary),
    L("♪ Never gonna run around and desert you", col.primary),
    L("♪ Never gonna make you cry", col.yellow),
    L("♪ Never gonna say goodbye", col.yellow),
    L("♪ Never gonna tell a lie and hurt you", col.yellow),
    BR(),
    L("You got rickrolled by a terminal. Congratulations.", col.muted),
    BR(),
  ],

  doge: () => [
    L("        ░░░░░░░░░░░░░░░░░░░░░░░░░░", col.yellow),
    L("      such terminal   wow   very cmd", col.yellow),
    L("   much hack          ░░░░  amaze", col.yellow),
    L("        so security         wow", col.yellow),
    L("              very konami code", col.yellow),
    L("                  much easter egg", col.yellow),
    L("          wow                  such doge", col.yellow),
    BR(),
  ],

  nyan: () => [
    L("+      +      +      +      +      +      +", col.muted),
    L("   ▄▀▀▀▄  ████████████████", col.primary),
    L("   █ owo █ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓", col.primary),
    L("   ▀▄▄▄▀  ████████████████", col.primary),
    L("+      +      +      +      +      +      +", col.muted),
    BR(),
    L("~Nyan~Nyan~Nyan~Nyan~Nyan~Nyan~Nyan~Nyan~", col.cyan),
    BR(),
  ],

  parrot: () => {
    const frames = ["🦜", "🦜", "🦜"]
    const colors = [col.red, col.yellow, col.green, col.cyan, col.primary]
    const lines: Line[] = []
    for (let i = 0; i < 5; i++) {
      lines.push(L(`  ${frames[i % frames.length]}  PARTY PARROT IS HERE`, colors[i % colors.length]))
    }
    lines.push(BR())
    lines.push(L("  🎉🎊🎉🎊🎉🎊🎉🎊🎉🎊🎉", col.yellow))
    lines.push(BR())
    return lines
  },

  "2048": () => [
    L("┌──────┬──────┬──────┬──────┐", col.primary),
    L("│  2   │  4   │  8   │  16  │", col.fg),
    L("├──────┼──────┼──────┼──────┤", col.primary),
    L("│  32  │  64  │ 128  │ 256  │", col.fg),
    L("├──────┼──────┼──────┼──────┤", col.primary),
    L("│ 512  │1024  │2048  │      │", col.fg),
    L("├──────┼──────┼──────┼──────┤", col.primary),
    L("│      │      │      │      │", col.muted),
    L("└──────┴──────┴──────┴──────┘", col.primary),
    BR(),
    L("YOU WIN! (I cheated for you)", col.green),
    L("Score: 420,069", col.yellow),
    BR(),
  ],

  snake: () => [
    L("┌──────────────────────────┐", col.primary),
    L("│  @@@@●                  │", col.green),
    L("│      ↓                  │", col.muted),
    L("│  ★                      │", col.red),
    L("│                         │", col.muted),
    L("│                         │", col.muted),
    L("└──────────────────────────┘", col.primary),
    BR(),
    L("Score: 3   Length: 5", col.fg),
    L("(controls: arrow keys — but this is fake)", col.muted),
    BR(),
  ],

  doom: () => [
    L("          ████████████████", col.red),
    L("       ██░░░░░░░░░░░░░░░░░░██", col.red),
    L("      ██░░  DOOM  ░░░░░░░░░░██", col.red),
    L("      ██░░ RUNS ON░░░░░░░░░░██", col.yellow),
    L("      ██░░ NEXT.JS░░░░░░░░░░██", col.yellow),
    L("       ██░░░░░░░░░░░░░░░░░░██", col.red),
    L("          ████████████████", col.red),
    BR(),
    L("It runs Doom.", col.green),
    L("Everything runs Doom.", col.muted),
    L("Your portfolio now also runs Doom.", col.muted),
    BR(),
  ],

  tetris: () => [
    L("┌──────────┐", col.primary),
    L("│  ██      │", col.cyan),
    L("│  ████    │", col.yellow),
    L("│    ██    │", col.red),
    L("│   ████   │", col.green),
    L("│██████████│", col.muted),
    L("└──────────┘", col.primary),
    BR(),
    L("Lines: 4   Level: 3   Score: 1337", col.fg),
    L("(also fake — but you knew that)", col.muted),
    BR(),
  ],

  ":(){ :|:& };:": () => [
    L("Executing fork bomb...", col.red),
    L(":(){ :|:& };:", col.red),
    BR(),
    L("PID 1337: forked", col.red),
    L("PID 1338: forked", col.red),
    L("PID 1339: forked", col.red),
    L("...", col.red),
    L("kernel: fork table full!", col.red),
    L("kernel: OOM killer activated!", col.red),
    BR(),
    L("Just kidding. It's a browser.", col.green),
    L("Your tab is fine (probably).", col.muted),
    BR(),
  ],

  "sudo make me a sandwich": () => [
    L("Okay.", col.green),
    BR(),
    L("  🥪 One sandwich, made with root privileges.", col.fg),
    BR(),
  ],

  "sudo please": () => [
    L("sudo: That's not how this works.", col.red),
    L("sudo: But points for politeness.", col.green),
    BR(),
  ],

  motd: () => [
    L("─────────────────────────────────────────────", col.primary),
    L("  Welcome to rejectmodders.is-a.dev", col.fg),
    BR(),
    L("  \"Security is not a product, it's a process.\"", col.yellow),
    L("                              — Bruce Schneier", col.muted),
    BR(),
    L("  System time: " + new Date().toLocaleString(), col.muted),
    L("  Uptime:      forever (Vercel is based)", col.muted),
    L("─────────────────────────────────────────────", col.primary),
    BR(),
  ],

  id: () => [
    L("uid=1000(rm) gid=1000(rm) groups=1000(rm),27(sudo),4(adm),1337(hackers)", col.green),
    BR(),
  ],

  groups: () => [
    L("rm sudo adm hackers developers security cool-people", col.green),
    BR(),
  ],

  last: () => [
    L("rm       pts/0        76.76.21.21    Sun Mar  1 00:00   still logged in", col.fg),
    L("rm       pts/0        76.76.21.21    Sat Feb 28 23:00 - 00:00  (01:00)", col.fg),
    L("reboot   system boot  6.x.x-edge     Sat Feb 28 22:55", col.muted),
    BR(),
    L("wtmp begins Sat Feb 28 22:55", col.muted),
    BR(),
  ],

  w: () => [
    L(" " + new Date().toLocaleTimeString() + " up forever,  1 user,  load average: 0.01, 0.01, 0.00", col.fg),
    L("USER     TTY      FROM             LOGIN@   IDLE JCPU   PCPU WHAT", col.primary),
    L("rm       pts/0    76.76.21.21      00:00    0.00s 0.00s  0.00s easter-egg", col.fg),
    BR(),
  ],

  who: () => [
    L("rm       pts/0        2026-03-01 00:00 (76.76.21.21)", col.fg),
    BR(),
  ],

  "cat secrets.txt": () => [
    L("cat: secrets.txt: Permission denied", col.red),
    BR(),
    L("Nice try. Try sudo.", col.muted),
    BR(),
  ],

  "sudo cat secrets.txt": () => [
    L("[sudo] password for rm: ", col.fg),
    L("✓ authenticated", col.green),
    BR(),
    L("# secrets.txt", col.primary),
    BR(),
    L("  1. The konami code opens this terminal.", col.fg),
    L("  2. rejectmodders is from Missouri.", col.fg),
    L("  3. VulnRadar was the tool I wished existed.", col.fg),
    L("  4. rm{y0u_f0und_th3_t3rm1n4l_e4st3r_egg}", col.red),
    L("  5. Amanda is ♥", col.primary),
    L("  6. I debug by adding print statements. Sorry.", col.muted),
    BR(),
  ],

  "cat .env.local": () => [
    L("cat: .env.local: Permission denied", col.red),
    L("(and there's nothing interesting in there anyway)", col.muted),
    BR(),
  ],

  fullscreen: () => [
    L("Toggling fullscreen... (click ⛶ in the title bar)", col.muted),
    BR(),
  ],

  minimize: () => [
    L("Minimizing... (click − in the title bar)", col.muted),
    BR(),
  ],

  "wget": (args) => {
    const url = (args ?? "").replace(/^wget\s*/i, "").trim() || "https://rejectmodders.is-a.dev"
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

  "nslookup": (args) => {
    const domain = (args ?? "").replace(/^nslookup\s*/i, "").trim() || "rejectmodders.is-a.dev"
    return [
      L(`Server:  1.1.1.1`, col.muted),
      L(`Address: 1.1.1.1#53`, col.muted),
      BR(),
      L(`Non-authoritative answer:`, col.fg),
      L(`Name:    ${domain}`, col.fg),
      L(`Address: 76.76.21.21`, col.green),
      BR(),
    ]
  },

  "arp": () => [
    L("Address                  HWtype  HWaddress             Flags Iface", col.primary),
    L("192.168.1.1              ether   00:11:22:33:44:55     C     eth0", col.fg),
    L("76.76.21.21              ether   de:ad:be:ef:00:01     C     eth0", col.fg),
    BR(),
  ],

  "history -c": () => [
    L("History cleared.", col.green),
    BR(),
  ],

  "alias": () => [
    L("alias ll='ls -la'", col.fg),
    L("alias gs='git status'", col.fg),
    L("alias gl='git log --oneline'", col.fg),
    L("alias ..='cd ..'", col.fg),
    L("alias please='sudo'", col.fg),
    L("alias yeet='rm -rf'", col.red),
    BR(),
  ],

  "which": (args) => {
    const cmd = (args ?? "").replace(/^which\s*/i, "").trim() || "bash"
    return [L(`/usr/bin/${cmd}`, col.green), BR()]
  },

  "file": (args) => {
    const f = (args ?? "").replace(/^file\s*/i, "").trim() || "terminal-easter-egg.tsx"
    return [
      L(`${f}: TypeScript React component, ASCII text, with very long lines (fun)`, col.fg),
      BR(),
    ]
  },

  "wc": (args) => {
    const f = (args ?? "").replace(/^wc\s*/i, "").trim() || "terminal-easter-egg.tsx"
    return [
      L(` 1214  4200  99999 ${f}`, col.fg),
      BR(),
    ]
  },

  "grep": (args) => {
    const q = (args ?? "").replace(/^grep\s*/i, "").trim() || "easter"
    return [
      L(`grep: searching for '${q}'...`, col.muted),
      L(`terminal-easter-egg.tsx:69:  // easter egg found at process 69`, col.green),
      L(`terminal-easter-egg.tsx:420: // you're reading the source. nice.`, col.green),
      BR(),
      L("2 matches found.", col.muted),
      BR(),
    ]
  },

  "head": () => [
    L('"use client"', col.fg),
    L("", col.muted),
    L('import { useEffect, useRef, useState, useCallback } from "react"', col.fg),
    L('import { motion, AnimatePresence } from "framer-motion"', col.fg),
    L('import { X, Terminal, Maximize2, Minimize2, Minus } from "lucide-react"', col.fg),
    BR(),
    L("(first 5 lines of terminal-easter-egg.tsx)", col.muted),
    BR(),
  ],

  "tail": () => [
    L("  )}", col.fg),
    L("}", col.fg),
    BR(),
    L("(last lines of terminal-easter-egg.tsx)", col.muted),
    L("(there's nothing secret down here)", col.muted),
    BR(),
  ],

  "python": () => [
    L("Python 3.12.0 (main, Oct  2 2023)", col.green),
    L('Type "help", "copyright", "credits" or "license" for more information.', col.muted),
    L(">>> ", col.fg),
    L("(not a real Python shell — but RejectModders loves Python)", col.muted),
    L(">>> import vulnradar  # the dream", col.cyan),
    BR(),
  ],

  "node": () => [
    L("Welcome to Node.js v22.0.0.", col.green),
    L('Type ".help" for more information.', col.muted),
    L("> ", col.fg),
    L("(not a real Node shell)", col.muted),
    L("> require('fs').readFileSync('.env.local')  // nice try", col.red),
    BR(),
  ],

  "docker": () => [
    L("docker: command not found.", col.red),
    L("(we're serverless here — no containers needed)", col.muted),
    L("Vercel handles deployments. It's fine.", col.green),
    BR(),
  ],

  "npm": (args) => {
    const sub = (args ?? "").replace(/^npm\s*/i, "").trim() || "start"
    if (sub === "install") return [
      L("npm warn deprecated everything@1.0.0: please use nothing instead", col.yellow),
      L("npm warn deprecated left-pad@1.0.0: don't worry, it's back", col.yellow),
      L("", col.muted),
      L("added 1337 packages in 4.2s", col.green),
      L("node_modules/ is now 420 MB 🙃", col.muted),
      BR(),
    ]
    return [
      L(`npm ${sub}`, col.muted),
      L("> rejectmodders.is-a.dev@0.1.0 " + sub, col.fg),
      L("> next " + sub, col.fg),
      BR(),
      L("  ▲ Next.js 16.1.6 (Turbopack)", col.fg),
      L("  - Local: http://localhost:3000", col.green),
      BR(),
    ]
  },

  "pip": (args) => {
    const pkg = (args ?? "").replace(/^pip\s*install\s*/i, "").trim() || "vulnradar"
    return [
      L(`Collecting ${pkg}`, col.fg),
      L(`  Downloading ${pkg}-1.0.0-py3-none-any.whl (420 kB)`, col.fg),
      L("Installing collected packages: " + pkg, col.fg),
      L(`Successfully installed ${pkg}-1.0.0`, col.green),
      BR(),
    ]
  },

  "chmod": (args) => {
    const f = (args ?? "").replace(/^chmod\s*\S+\s*/i, "").trim() || "secrets.txt"
    return [
      L(`chmod: changing permissions of '${f}'`, col.fg),
      L("chmod: Operation not permitted (you're not root)", col.red),
      BR(),
    ]
  },

  "su": () => [
    L("Password: ", col.fg),
    L("su: Authentication failure", col.red),
    L("(there is no root here. only Next.js.)", col.muted),
    BR(),
  ],

  "passwd": () => [
    L("Changing password for rm.", col.fg),
    L("Current password: ", col.fg),
    L("passwd: Authentication token manipulation error", col.red),
    L("(you can't change what doesn't exist)", col.muted),
    BR(),
  ],

  "lsof": () => [
    L("COMMAND   PID  USER   FD   TYPE  DEVICE SIZE/OFF NODE NAME", col.primary),
    L("next-srv    1    rm  cwd    DIR   259,1     4096    2 /app", col.fg),
    L("next-srv    1    rm   3u  IPv4   12345      0t0  TCP *:443 (LISTEN)", col.fg),
    L("easter-e   69    rm   6u  IPv4   69420      0t0  TCP *:6969 (LISTEN)", col.green),
    BR(),
  ],

  "htop": () => [
    L("  CPU[|                                         0.1%]", col.green),
    L("  Mem[||||                                    69/420M]", col.green),
    L("  Swp[                                          0/420M]", col.fg),
    BR(),
    L("  PID  USER       PRI  NI  VIRT   RES   CPU%  MEM%  TIME+   Command", col.primary),
    L("    1  rm          20   0  123M  4200K   0.3   1.0  0:01.23 next-server", col.fg),
    L("   69  rm          20   0   10M   420K   0.0   0.1  0:00.69 easter-egg", col.green),
    BR(),
    L("F1Help  F2Setup  F3Search  F5SortBy  F9Kill  F10Quit", col.muted),
    BR(),
  ],

  "speedtest": () => [
    L("Speedtest by Ookla", col.primary),
    BR(),
    L("  Server:   Vercel Edge (The Cloud)", col.fg),
    L("  Ping:     4 ms", col.green),
    L("  Download: ████████████████████ 420.69 Mbps", col.green),
    L("  Upload:   ████████████████░░░░ 360.00 Mbps", col.green),
    BR(),
    L("(it's a static site — it's fast by default)", col.muted),
    BR(),
  ],

  "openssl": () => [
    L("OpenSSL 3.1.0  14 Mar 2023", col.fg),
    L("Usage: openssl command [options]", col.fg),
    BR(),
    L("  openssl rand -hex 32  →  random secret key", col.muted),
    L("  openssl s_client -connect rejectmodders.is-a.dev:443", col.muted),
    BR(),
    L("(this is a fake shell — go use real OpenSSL for real crypto)", col.red),
    BR(),
  ],

  "tmux": () => [
    L("tmux: no sessions.", col.fg),
    L("[detached (from session 0)]", col.muted),
    BR(),
    L("Tip: Ctrl+b then % to split pane", col.muted),
    L("(also none of this is real)", col.muted),
    BR(),
  ],

  "crontab": () => [
    L("# m h  dom mon dow   command", col.muted),
    L("*/5 * * * *  curl https://vulnradar.dev/ping", col.fg),
    L("0   0 * * *  ./backup.sh", col.fg),
    L("@reboot      ./start-easter-egg.sh", col.green),
    BR(),
  ],

  "ufw": () => [
    L("Status: active", col.green),
    BR(),
    L("To                         Action      From", col.primary),
    L("--                         ------      ----", col.muted),
    L("443/tcp                    ALLOW       Anywhere", col.fg),
    L("80/tcp                     ALLOW       Anywhere", col.fg),
    L("22/tcp                     DENY        Anywhere", col.red),
    L("6969/tcp (easter-egg)      ALLOW       Anywhere", col.green),
    BR(),
  ],

  "systemctl": (args) => {
    const sub = (args ?? "").replace(/^systemctl\s*/i, "").trim() || "status"
    return [
      L(`● next-server.service - Next.js Production Server`, col.fg),
      L(`     Loaded: loaded (/etc/systemd/system/next-server.service; enabled)`, col.fg),
      L(`     Active: active (running) since forever`, col.green),
      L(`    Process: ${sub}`, col.muted),
      L(`   Main PID: 1 (next-server)`, col.fg),
      BR(),
    ]
  },
}

// ── Async commands ────────────────────────────────────────────────────────────
const ASYNC_CMDS: Record<string, () => Promise<Line[]>> = {
  status: async () => {
    try {
      const d = await fetch("/api/status").then(r => r.json())
      const built = new Date(d.build_time).toLocaleString()
      return [
        L("# site status", col.primary),
        BR(),
        L(`  status:       ${d.status}`, d.status === "ok" ? col.green : col.red),
        L(`  owner:        ${d.owner}`, col.fg),
        L(`  site:         ${d.site}`, col.fg),
        L(`  build_time:   ${built}`, col.muted),
        L(`  timestamp:    ${new Date(d.timestamp).toLocaleString()}`, col.muted),
        BR(),
        L("  All systems operational.", col.green),
        BR(),
      ]
    } catch {
      return [L("  error: could not reach /api/status", col.red), BR()]
    }
  },

  uptime: async () => {
    try {
      const d = await fetch("/api/status").then(r => r.json())
      const since = new Date(d.uptime_since)
      const ms    = Date.now() - since.getTime()
      const h     = Math.floor(ms / 3600000)
      const m     = Math.floor((ms % 3600000) / 60000)
      const s     = Math.floor((ms % 60000) / 1000)
      return [
        L(`up ${h}h ${m}m ${s}s`, col.green),
        L(`since ${since.toLocaleString()}`, col.muted),
        BR(),
      ]
    } catch {
      return [L("could not determine uptime", col.red), BR()]
    }
  },
}

export function TerminalEasterEgg() {
  const [open, setOpen]             = useState(false)
  const [lines, setLines]           = useState<Line[]>([...BOOT_LINES])
  const [input, setInput]           = useState("")
  const [cmdHistory, setCmdHistory] = useState<string[]>([])
  const [histIdx, setHistIdx]       = useState(-1)
  const [progress, setProgress]     = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMinimized, setIsMinimized]   = useState(false)
  const [pos, setPos]               = useState({ x: 0, y: 0 })
  const [dragging, setDragging]     = useState(false)
  const dragStart                   = useRef({ mx: 0, my: 0, px: 0, py: 0 })
  const inputRef  = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const konamiRef = useRef(0)

  // Center on open
  useEffect(() => {
    if (open && !isFullscreen) {
      setPos({
        x: Math.max(0, (window.innerWidth  - 896) / 2),
        y: Math.max(0, (window.innerHeight - 600) / 2),
      })
    }
  }, [open, isFullscreen])

  // Drag handlers
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (isFullscreen) return
    e.preventDefault()
    setDragging(true)
    dragStart.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y }
  }, [isFullscreen, pos])

  useEffect(() => {
    if (!dragging) return
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.current.mx
      const dy = e.clientY - dragStart.current.my
      setPos({ x: dragStart.current.px + dx, y: dragStart.current.py + dy })
    }
    const onUp = () => setDragging(false)
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp) }
  }, [dragging])

  // Konami listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (!open && (tag === "INPUT" || tag === "TEXTAREA")) return

      if (e.key === KONAMI[konamiRef.current]) {
        konamiRef.current++
        setProgress(konamiRef.current)
        if (konamiRef.current === KONAMI.length) {
          konamiRef.current = 0
          setProgress(0)
          setOpen(true)
        }
      } else {
        konamiRef.current = 0
        setProgress(0)
      }
      if (open && e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open])

  useEffect(() => {
    if (open) {
      setLines([...BOOT_LINES])
      setInput("")
      setCmdHistory([])
      setHistIdx(-1)
      setTimeout(() => inputRef.current?.focus(), 80)
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [lines])

  const appendLines = useCallback((newLines: Line[]) => {
    setLines(prev => [...prev, ...newLines])
  }, [])

  const runCommand = useCallback(async (raw: string) => {
    const trimmed = raw.trim()
    if (!trimmed) return

    setCmdHistory(h => [trimmed, ...h])
    setHistIdx(-1)
    appendLines([L(`rejectmodders@is-a.dev:~$ ${trimmed}`, col.fg)])

    const cmd = trimmed.toLowerCase()

    if (cmd === "clear") { setLines([...BOOT_LINES]); return }
    if (cmd === "exit")  { setOpen(false); return }
    if (cmd === "fullscreen") { setIsFullscreen(f => !f); appendLines([L("Toggled fullscreen.", col.muted), BR()]); return }
    if (cmd === "minimize")   { setIsMinimized(true); appendLines([L("Minimized.", col.muted), BR()]); return }
    if (cmd === "maximize")   { setIsFullscreen(true); appendLines([L("Maximized.", col.muted), BR()]); return }
    if (cmd === "history") {
      appendLines(cmdHistory.length
        ? cmdHistory.map((c, i) => L(`  ${cmdHistory.length - i}  ${c}`, col.muted)).concat([BR()])
        : [L("  no history yet", col.muted), BR()])
      return
    }

    // echo
    if (cmd.startsWith("echo ")) {
      appendLines([L(trimmed.slice(5), col.fg), BR()])
      return
    }

    // sudo passthrough — run the underlying command
    if (cmd.startsWith("sudo ")) {
      const sub = cmd.slice(5)
      const handler = COMMANDS[sub]

      if (handler) {
        appendLines(handler())
      } else if (ASYNC_CMDS[sub]) {
        appendLines([L("running async command...", col.muted)])
        const result = await ASYNC_CMDS[sub]()
        appendLines(result)
      } else {
        appendLines([L(`sudo: ${sub}: command not found`, col.red), BR()])
      }

      return
    }

    // async commands
    if (ASYNC_CMDS[cmd]) {
      appendLines([L("fetching...", col.muted)])
      const result = await ASYNC_CMDS[cmd]()
      appendLines(result)
      return
    }

    // sync commands
    const handler = COMMANDS[cmd]
    if (handler) {
      appendLines(handler(trimmed))
      return
    }

    // prefix commands (man <x>, touch <x>, and encoding tools)
    const prefixCmds = ["man","touch","base64","rot13","morse","binary","hex","md5","dice","rps","wget","nslookup","dig","grep","which","file","wc","systemctl","pip","npm"]
    for (const prefix of prefixCmds) {
      if (cmd.startsWith(prefix + " ") && COMMANDS[prefix]) {
        appendLines(COMMANDS[prefix](trimmed))
        return
      }
    }

    appendLines([L(`bash: ${cmd}: command not found`, col.red), BR()])
  }, [appendLines, cmdHistory])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const val = input
      setInput("")
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
  }, [input, cmdHistory, runCommand])

  return (
    <>
      {/* Konami progress indicator */}
      {progress > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex gap-1 pointer-events-none">
          {KONAMI.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i < progress ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>
      )}

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
            {/* Backdrop only in fullscreen */}
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
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.18 }}
              style={isFullscreen ? {} : { left: pos.x, top: pos.y, position: "fixed" }}
              className={
                isFullscreen
                  ? "fixed inset-4 z-50 flex flex-col bg-background border border-border rounded-xl shadow-2xl font-mono text-sm overflow-hidden"
                  : "z-50 flex flex-col bg-background border border-border rounded-xl shadow-2xl font-mono text-sm overflow-hidden w-[min(896px,calc(100vw-2rem))]"
              }
            >
              {/* Title bar — drag handle */}
              <div
                onMouseDown={onMouseDown}
                className={`flex items-center gap-2 px-4 py-2 bg-muted/40 border-b border-border shrink-0 ${!isFullscreen ? "cursor-grab active:cursor-grabbing" : ""}`}
                style={{ userSelect: "none" }}
              >
                {/* Traffic lights */}
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
                  rm@rejectmodders.is-a.dev: ~
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
                className="flex-1 overflow-y-auto p-4 space-y-0.5 cursor-text min-h-0"
                style={{ height: isFullscreen ? undefined : "520px" }}
                onClick={() => inputRef.current?.focus()}
              >
                {lines.map((line, i) => (
                  <div key={i} className={`leading-5 whitespace-pre-wrap break-all ${line.color}`}>
                    {line.text || "\u00a0"}
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="flex items-center gap-1.5 px-4 py-3 border-t border-border shrink-0 bg-muted/20">
                <span className="text-green-400 select-none font-bold shrink-0">rejectmodders</span>
                <span className="text-muted-foreground select-none shrink-0">@</span>
                <span className="text-cyan-400 select-none font-bold shrink-0">is-a.dev</span>
                <span className="text-muted-foreground select-none shrink-0">:~$</span>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground/40 caret-primary ml-1"
                  placeholder="type a command..."
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

