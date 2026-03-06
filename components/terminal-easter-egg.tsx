// Re-export from new modular location for backwards compatibility
export { TerminalEasterEgg } from "./terminal"

/* 
 * Terminal Easter Egg - Now modularized!
 * 
 * The terminal has been split into multiple files for easier maintenance:
 * 
 * /components/terminal/
 *   index.tsx       - Main component (UI, state, event handlers)
 *   types.ts        - TypeScript interfaces
 *   colors.ts       - Color utilities & site color management
 *   utils.ts        - Helper functions (cookies, etc.)
 *   constants.ts    - ASCII art, boot lines, command list
 *   help.ts         - Help system & paginator
 *   commands/
 *     index.ts      - Aggregates all commands
 *     info.ts       - whoami, about, skills, contact, socials
 *     system.ts     - clear, exit, history, alias, theme, etc.
 *     network.ts    - ping, curl, dig, traceroute, etc.
 *     fun.ts        - cowsay, fortune, matrix, hack, sl, etc.
 *     filesystem.ts - ls, cd, cat, pwd, tree, find, etc.
 *     tools.ts      - calc, date, uptime, weather, etc.
 *     dev.ts        - git, npm, node, python, docker, etc.
 *     sudo.ts       - sudo command handler
 */
