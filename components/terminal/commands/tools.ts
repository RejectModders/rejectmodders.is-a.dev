import { col, L, BR } from "../colors"
import type { CommandHandler } from "../types"

// ── Tools & Utilities Commands ─────────────────────────────────────────────────

export const toolsCommands: Record<string, CommandHandler> = {
  echo: (args) => {
    const msg = (args ?? "").replace(/^echo\s*/i, "").trim()
    return [L(msg || "(empty)", col.fg), BR()]
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
    const fake = Array.from({length: 32}, () => Math.floor(Math.random() * 16).toString(16)).join("")
    return [
      L(`  Input:  ${txt}`, col.muted),
      L(`  MD5:    ${fake}`, col.green),
      L("  (simulated - use a real tool for actual hashing)", col.muted),
      BR(),
    ]
  },

  md5sum: (args) => {
    const txt = (args ?? "").replace(/^md5sum\s*/i, "").trim()
    if (!txt) return [L("Usage: md5sum <text>", col.red), BR()]
    const fake = Array.from({length: 32}, () => Math.floor(Math.random() * 16).toString(16)).join("")
    return [L(`${fake}  ${txt}`, col.green), BR()]
  },

  sha256sum: (args) => {
    const txt = (args ?? "").replace(/^sha256sum\s*/i, "").trim()
    if (!txt) return [L("Usage: sha256sum <text>", col.red), BR()]
    const fake = Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join("")
    return [L(`${fake}  ${txt}`, col.green), BR()]
  },

  which: (args) => {
    const cmd = (args ?? "").replace(/which\s*/i, "").trim() || "bash"
    const paths: Record<string, string> = {
      bash: "/bin/bash", python3: "/usr/bin/python3", node: "/usr/local/bin/node",
      vim: "/usr/bin/vim", git: "/usr/bin/git", curl: "/usr/bin/curl",
      ssh: "/usr/bin/ssh", docker: "/usr/bin/docker",
    }
    return [L(paths[cmd] ?? `/usr/local/bin/${cmd}`, col.green), BR()]
  },

  type: (args) => {
    const cmd = (args ?? "").replace(/type\s*/i, "").trim() || "ls"
    return [L(`${cmd} is a shell builtin`, col.fg), BR()]
  },

  alias: () => [
    L("alias ll='ls -la'", col.cyan),
    L("alias py='python3'", col.cyan),
    L("alias gs='git status'", col.cyan),
    L("alias gp='git push'", col.cyan),
    L("alias gc='git commit -m'", col.cyan),
    L("alias hack='cd ~/vulnradar && python3 main.py'", col.cyan),
    L("alias please='sudo'", col.yellow),
    L("alias fuck='sudo !!'", col.yellow),
    L("alias ..='cd ..'", col.fg),
    L("alias ...='cd ../..'", col.fg),
    BR(),
  ],

  export: (args) => {
    const kv = (args ?? "").replace(/export\s*/i, "").trim()
    if (!kv) return [L("declare -x NODE_ENV=production", col.fg), L("declare -x SITE=rejectmodders.dev", col.fg), BR()]
    return [L(`export: ${kv} - set for this session only`, col.green), BR()]
  },

  source: (args) => {
    const f = (args ?? "").replace(/source\s*/i, "").trim() || ".bashrc"
    return [L(`Sourcing ${f}...`, col.muted), L("done.", col.green), BR()]
  },

  strace: (args) => {
    const cmd = (args ?? "").replace(/strace\s*/i, "").trim() || "ls"
    return [
      L(`strace: ${cmd}`, col.muted),
      L(`execve("/bin/${cmd}", ["${cmd}"], envp) = 0`, col.fg),
      L(`brk(NULL)                               = 0x55a2d4620000`, col.fg),
      L(`read(3, "\\177ELF...", 832)               = 832`, col.fg),
      L(`write(1, "output\\n", 7)                 = 7`, col.fg),
      L(`exit_group(0)                           = ?`, col.fg),
      BR(),
      L("(everything looks clean. no rootkits detected.)", col.green),
      BR(),
    ]
  },

  watch: (args) => {
    const cmd = (args ?? "").replace(/watch\s*/i, "").trim() || "date"
    return [
      L(`Every 2.0s: ${cmd}`, col.fg),
      BR(),
      L(new Date().toString(), col.green),
      BR(),
      L("(press Ctrl+C to quit - jk type clear)", col.muted),
      BR(),
    ]
  },

  crontab: () => [
    L("# crontab -l", col.primary),
    BR(),
    L("# m h  dom mon dow   command", col.muted),
    L("  * * * * *  curl -s https://rejectmodders.dev > /dev/null", col.fg),
    L("  0 9 * * 1  echo 'start of week: touch grass'", col.yellow),
    L("  0 2 * * *  vulnradar --scan rejectmodders.dev", col.green),
    BR(),
  ],

  tmux: () => [
    L("[detached (from session rm-terminal)]", col.green),
    BR(),
    L("  tmux ls:", col.primary),
    L("  0: rm-terminal (1 window) created just now", col.fg),
    L("  1: vulnradar (3 windows) created yesterday", col.fg),
    BR(),
    L("(press Ctrl+B then D to detach - jk type clear)", col.muted),
    BR(),
  ],

  man: (args) => {
    const cmd = (args ?? "").replace("man ", "").trim()
    if (!cmd) return [L("What manual page do you want?", col.yellow), BR()]
    return [
      L(`${cmd.toUpperCase()}(1)                   User Commands                   ${cmd.toUpperCase()}(1)`, col.fg),
      BR(),
      L("NAME", col.primary),
      L(`       ${cmd} - does ${cmd} things`, col.fg),
      BR(),
      L("SYNOPSIS", col.primary),
      L(`       ${cmd} [OPTIONS] [FILE]...`, col.fg),
      BR(),
      L("DESCRIPTION", col.primary),
      L(`       ${cmd} is a command that does exactly what you'd expect.`, col.fg),
      L("       Or maybe not. Who knows. This is a fake manual page.", col.muted),
      BR(),
      L("SEE ALSO", col.primary),
      L("       help(1), google(1), stackoverflow(1)", col.fg),
      BR(),
    ]
  },

  openssl: (args) => {
    const sub = (args ?? "").replace(/openssl\s*/i, "").trim() || "version"
    if (sub === "version") return [L("OpenSSL 3.2.0 (browser stub)", col.green), BR()]
    if (sub.startsWith("rand")) {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
      const n = 32
      let s = ""
      for (let i = 0; i < n; i++) s += chars[Math.floor(Math.random() * chars.length)]
      return [L(s, col.green), BR()]
    }
    return [
      L("openssl s_client -connect rejectmodders.dev:443", col.muted),
      L("depth=2 C=US, O=Let's Encrypt", col.fg),
      L("verify return:1", col.green),
      L("Certificate chain verified: OK", col.green),
      L("TLS 1.3, cipher TLS_AES_256_GCM_SHA384", col.fg),
      BR(),
    ]
  },

  "ssh-keygen": () => [
    L("Generating public/private ed25519 key pair.", col.fg),
    L("Enter file: /home/rm/.ssh/id_ed25519", col.fg),
    L("Enter passphrase: ****", col.muted),
    BR(),
    L("Your identification has been saved in /home/rm/.ssh/id_ed25519", col.fg),
    L("Your public key has been saved in /home/rm/.ssh/id_ed25519.pub", col.fg),
    BR(),
    L("SHA256:rm4c3sSg00dK3y+f0rS3cur1ty (rm@rejectmodders.dev)", col.green),
    BR(),
    L("(key not actually generated - this is a browser)", col.muted),
    BR(),
  ],

  gpg: () => [
    L("gpg (GnuPG) 2.4.0", col.fg),
    BR(),
    L("pub   ed25519 2024-01-01 [SC]", col.fg),
    L("      DEADBEEF1337C0FFEEBADC0FFEECAFEF00D", col.green),
    L("uid   RejectModders <rm@rejectmodders.dev>", col.fg),
    L("sub   cv25519 2024-01-01 [E]", col.fg),
    BR(),
  ],
}
