import { col, L, BR } from "../colors"
import type { CommandHandler } from "../types"

// ── System Commands ────────────────────────────────────────────────────────────

export const systemCommands: Record<string, CommandHandler> = {
  date: () => [L(new Date().toString(), col.fg), BR()],

  uname: () => [
    L("Linux rejectmodders.dev 6.1.0-vercel #1 SMP PREEMPT Next.js x86_64 GNU/Linux", col.fg),
    BR(),
  ],

  env: () => [
    L("USER=rm", col.fg),
    L("HOME=/home/rm", col.fg),
    L("SHELL=/bin/bash", col.fg),
    L("PATH=/usr/local/bin:/usr/bin:/bin", col.fg),
    L("NODE_ENV=production", col.fg),
    L("NEXT_RUNTIME=edge", col.fg),
    L("VERCEL=1", col.fg),
    L("VERCEL_ENV=production", col.fg),
    L("FLAG=rm{y0u_f0und_th3_env_fl4g}", col.red),
    BR(),
  ],

  neofetch: () => [
    L("  ____  __  __    rm@rejectmodders.dev", col.primary),
    L(" |  _ \\|  \\/  |   -------------------------", col.primary),
    L(" | |_) | |\\/| |   OS:     Vercel Edge Linux", col.fg),
    L(" |  _ <| |  | |   Host:   rejectmodders.dev", col.fg),
    L(" |_| \\_\\_|  |_|   Kernel: Next.js 16", col.fg),
    L("                  Shell:  rm-terminal v2.0", col.fg),
    L("                  DE:     React 19 + Framer Motion", col.fg),
    L("                  WM:     Tailwind CSS v4", col.fg),
    L("                  Theme:  Dark (obviously)", col.fg),
    L("                  CPU:    big brain", col.fg),
    L("                  Memory: 69mb / 420mb", col.fg),
    BR(),
    L("                  ████████████████████████", col.green),
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

  "ps aux": () => [
    L("USER       PID  %CPU %MEM    VSZ   RSS TTY      STAT  COMMAND", col.primary),
    L("root         1   0.0  0.1   2376   980 ?        Ss    /sbin/init", col.fg),
    L("rm           2   0.2  2.1 123456  4200 pts/0    S     next-server", col.fg),
    L("rm          69   0.0  0.1   1337   420 pts/0    S     easter-egg", col.green),
    L("rm         420   0.0  0.1   6969   690 pts/0    R     bash", col.fg),
    L("rm         421   0.0  0.0   5555   420 pts/0    R+    ps aux", col.cyan),
    BR(),
  ],

  htop: () => [
    L("  CPU [|||||||||||                  24%]   Tasks: 5 total", col.green),
    L("  MEM [||||||||||||||||             69%]   Load avg: 0.1 0.1 0.0", col.yellow),
    L("  SWP [||                            8%]   Uptime: forever", col.fg),
    BR(),
    L("  PID   USER    PRI  NI   VIRT   RES  CPU% MEM%  COMMAND", col.primary),
    L("    1   root     20   0   2376   980   0.0  0.1   init", col.fg),
    L("    2   rm       20   0  123456 4200   0.2  2.1   next-server", col.fg),
    L("   69   rm       20   0   1337   420   0.0  0.1   easter-egg", col.green),
    L("  420   rm       20   0   6969   690   0.0  0.1   bash", col.fg),
    BR(),
    L("F1 Help  F2 Setup  F3 Search  F4 Filter  F9 Kill  F10 Quit", col.muted),
    L("(press q or F10 to quit htop - jk type clear)", col.muted),
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
    const lines: ReturnType<typeof L>[] = [
      L(header, col.primary),
      L(dayRow, col.muted),
    ]
    weeks.trimEnd().split("\n").forEach(r => lines.push(L(r, col.fg)))
    lines.push(BR())
    return lines
  },

  reboot: () => [
    L("Broadcast message from rm@rejectmodders.dev:", col.red),
    L("The system is going down for reboot NOW!", col.red),
    BR(),
    L("...", col.muted),
    L("...", col.muted),
    L("just kidding. Vercel handles uptime.", col.green),
    BR(),
  ],

  shutdown: () => [
    L("Broadcast message from rm@rejectmodders.dev:", col.red),
    L("The system is going down for poweroff NOW!", col.red),
    BR(),
    L("...", col.muted),
    L("...", col.muted),
    L("nah. site stays up.", col.green),
    BR(),
  ],

  "id": () => [
    L("uid=1000(rm) gid=1000(rm) groups=1000(rm),27(sudo),100(users)", col.fg),
    BR(),
  ],

  groups: () => [
    L("rm sudo users developers hackers", col.fg),
    BR(),
  ],

  last: () => [
    L("rm       pts/0        you              " + new Date().toDateString() + " - still logged in", col.green),
    L("rm       pts/0        crawler          " + new Date().toDateString() + " (00:00)", col.fg),
    L("rm       pts/0        googlebot        " + new Date().toDateString() + " (00:00)", col.fg),
    BR(),
  ],

  w: () => [
    L(" " + new Date().toLocaleTimeString() + " up forever,  1 user,  load average: 0.00, 0.01, 0.05", col.fg),
    L("USER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT", col.primary),
    L("rm       pts/0    you              now      0.00s  0.01s  0.00s terminal", col.fg),
    BR(),
  ],

  who: () => [
    L("rm       pts/0        " + new Date().toDateString() + " (you)", col.fg),
    BR(),
  ],

  lsof: () => [
    L("COMMAND   PID  USER   FD   TYPE    DEVICE SIZE/OFF NODE NAME", col.primary),
    L("next        2    rm    4u  IPv4    0x1337     0t0  TCP *:3000 (LISTEN)", col.fg),
    L("next        2    rm    6u  IPv4    0xdead     0t0  TCP *:443  (LISTEN)", col.fg),
    L("bash      420    rm    0u   CHR      5,0     0t0    3 /dev/tty", col.fg),
    L("terminal   69    rm    1u   REG      8,1    1337   42 /dev/easter-egg", col.green),
    BR(),
  ],

  lsblk: () => [
    L("NAME   MAJ:MIN RM   SIZE RO TYPE MOUNTPOINT", col.primary),
    L("sda      8:0    0   100G  0 disk", col.fg),
    L("├─sda1   8:1    0    99G  0 part /", col.fg),
    L("└─sda2   8:2    0     1G  0 part [SWAP]", col.fg),
    BR(),
  ],

  mount: () => [
    L("/dev/sda1 on / type ext4 (rw,relatime)", col.fg),
    L("tmpfs on /tmp type tmpfs (rw,nosuid,nodev)", col.fg),
    L("vercel on /var/vercel type vercelfs (ro,edge)", col.fg),
    BR(),
  ],

  uptime: () => [
    L(" " + new Date().toLocaleTimeString() + " up 69 days, 4:20, 1 user, load average: 0.00, 0.01, 0.05", col.fg),
    BR(),
  ],

  systemctl: (args) => {
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

  speedtest: () => [
    L("Speedtest by Ookla", col.primary),
    BR(),
    L("  Server:   Vercel Edge (The Cloud)", col.fg),
    L("  Ping:     4 ms", col.green),
    L("  Download: ████████████████████ 420.69 Mbps", col.green),
    L("  Upload:   ████████████████░░░░ 360.00 Mbps", col.green),
    BR(),
    L("(it's a static site - it's fast by default)", col.muted),
    BR(),
  ],

  kill: (args) => {
    const pid = (args ?? "").replace(/kill\s*/i, "").trim() || "69"
    if (pid === "69" || pid === "-9 69") return [L(`kill: (69) easter-egg: Operation not permitted`, col.red), BR()]
    if (pid === "1")  return [L(`kill: (1) init: Operation not permitted. Don't kill init.`, col.red), BR()]
    return [
      L(`kill: sent SIGTERM to PID ${pid}`, col.yellow),
      L(`(not really - there's no real process here)`, col.muted),
      BR(),
    ]
  },

  killall: (args) => {
    const name = (args ?? "").replace(/killall\s*/i, "").trim() || "bash"
    if (name === "easter-egg" || name === "terminal") return [L(`killall: (69) easter-egg: Operation not permitted`, col.red), BR()]
    if (name === "next-server" || name === "node") return [L(`killall: (1) next-server: Operation not permitted`, col.red), BR()]
    return [
      L(`Killed ${name} (PID ${Math.floor(Math.random() * 9000) + 1000})`, col.green),
      L(`(not really - nothing actually runs here)`, col.muted),
      BR(),
    ]
  },
}
