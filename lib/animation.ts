/**
 * Global animation constants and reusable variants — single source of truth.
 * Import from '@/lib/animation' for consistent motion across the site.
 */

// ── Timing Constants ─────────────────────────────────────────────────────────
/** Standard easing curve (snappy ease-out) */
export const EASE = [0.25, 0.1, 0.25, 1] as const

/** Base duration - fast and snappy */
export const DUR = 0.3

/** Page-load sequence: navbar finishes ~0.35s, content starts at 0.4s */
export const PAGE_START = 0.4
export const PAGE_STEP = 0.06

/** Scroll-triggered stagger - faster for scroll-in */
export const SCROLL_STEP = 0.05

// ── Reusable Variants ────────────────────────────────────────────────────────
/** Fade up animation - most common pattern */
export const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: DUR, ease: EASE, delay },
  }),
}

/** Fade in (no movement) */
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: (delay = 0) => ({
    opacity: 1,
    transition: { duration: DUR, ease: EASE, delay },
  }),
}

/** Scale up from smaller */
export const scaleUp = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (delay = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: DUR, ease: EASE, delay },
  }),
}

/** Slide in from left */
export const slideInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: (delay = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: DUR, ease: EASE, delay },
  }),
}

/** Slide in from right */
export const slideInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: (delay = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: DUR, ease: EASE, delay },
  }),
}

// ── Container Variants ───────────────────────────────────────────────────────
/** Stagger children on page load */
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: PAGE_STEP,
      delayChildren: PAGE_START,
    },
  },
}

/** Stagger children on scroll */
export const scrollStaggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: SCROLL_STEP,
      delayChildren: 0.1,
    },
  },
}

// ── Utility Functions ────────────────────────────────────────────────────────
/** Calculate delay for nth item in a sequence */
export const getStaggerDelay = (index: number, base = PAGE_START) => 
  base + index * PAGE_STEP

/** Calculate delay for scroll-triggered nth item */
export const getScrollDelay = (index: number) => 
  0.1 + index * SCROLL_STEP
