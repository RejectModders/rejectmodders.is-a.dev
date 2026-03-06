import { col, L, BR } from "../colors"
import type { CommandHandler } from "../types"

// ── Sudo & Easter Egg Commands ─────────────────────────────────────────────────

export const sudoCommands: Record<string, CommandHandler> = {
  sudo: () => [
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

  "sudo please": () => [
    L("sudo: you said please - points for politeness.", col.yellow),
    L("sudo: still denied though.", col.red),
    L("  hint: try 'sudo make me a sandwich'", col.muted),
    BR(),
  ],

  "sudo make me a sandwich": () => [
    L("[sudo] password for rm: authenticated", col.green),
    BR(),
    L("    sandwich", col.fg),
    BR(),
    L("One sandwich, made with root privileges.", col.green),
    BR(),
  ],

  "sudo please make me a sandwich": () => [
    L("[sudo] password for rm: authenticated", col.green),
    BR(),
    L("    sandwich  sandwich  sandwich", col.fg),
    BR(),
    L("Three sandwiches. You said please.", col.green),
    BR(),
  ],

  ":(){ :|:& };:": () => [
    L("bash: fork bomb detected!", col.red),
    L("Activating countermeasures...", col.red),
    L("Process tree limited to 1337 processes.", col.yellow),
    L("Crisis averted. Next.js survived.", col.green),
    BR(),
  ],

  fullscreen: () => [
    L("Toggling fullscreen... (click the green button in the title bar)", col.muted),
    BR(),
  ],

  minimize: () => [
    L("Minimizing... (click the yellow button in the title bar)", col.muted),
    BR(),
  ],

  "history -c": () => [
    L("History cleared.", col.green),
    BR(),
  ],
}
