"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { ChevronDown, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Particles } from "@/components/particles"
// Letter animation — starts at 0.4s, each letter adds 0.025s
const letterVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.4 + i * 0.025, duration: 0.35, ease: [0.215, 0.61, 0.355, 1] },
  }),
}

const AnimatedText = ({ text, className }: { text: string; className?: string }) => (
  <span className={className}>
    {text.split("").map((char, i) => (
      <motion.span key={i} custom={i} variants={letterVariants} initial="hidden" animate="visible" className="inline-block">
        {char === " " ? "\u00A0" : char}
      </motion.span>
    ))}
  </span>
)

export function HeroSection() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"], layoutEffect: false })
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <section className="relative flex min-h-screen items-center justify-center" style={{ overflow: "clip" }}>
      <div ref={ref} className="absolute inset-0" />

      {/* Grid bg */}
      <motion.div
        className="absolute inset-0 grid-bg opacity-20"
        animate={{ backgroundPosition: ["0px 0px", "60px 60px"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      {/* Particles */}
      <Particles count={55} />

      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 40%, oklch(0.58 0.2 15 / 0.1) 0%, transparent 60%)" }} />

      {/* Floating orbs */}
      <motion.div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full opacity-[0.03] pointer-events-none" style={{ background: "oklch(0.58 0.2 15)", willChange: "transform" }} animate={{ x: [0, 20, 0], y: [0, -15, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full opacity-[0.02] pointer-events-none" style={{ background: "oklch(0.58 0.2 15)", willChange: "transform" }} animate={{ x: [0, -15, 0], y: [0, 20, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} />

      <motion.div style={{ y, opacity, willChange: "transform, opacity" }} className="relative z-10 flex flex-col items-center gap-5 px-4 text-center">

        {/* Status badge — appears right after navbar (0.38s) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.3, ease: "easeOut" }}
          className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 backdrop-blur-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <span className="font-mono text-xs text-primary">Available for hire</span>
        </motion.div>

        {/* Name — letters from 0.4s, "RejectModders" = 13 letters × 0.025 = last letter at ~0.72s */}
        <h1 className="whitespace-nowrap text-5xl font-bold tracking-tight text-foreground md:text-7xl lg:text-8xl">
          <AnimatedText text="Reject" />
          {"Modders".split("").map((char, i) => (
            <motion.span
              key={i}
              custom={i + 6}
              variants={letterVariants}
              initial="hidden"
              animate="visible"
              className="inline-block"
              style={{ background: "linear-gradient(135deg, #f87171, #dc2626)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
            >
              {char}
            </motion.span>
          ))}
        </h1>

        {/* Subtitle — 0.75s (right after name finishes) */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.4, ease: "easeOut" }}
          className="max-w-xl text-pretty text-lg text-muted-foreground md:text-xl"
        >
          Cybersecurity dev from Missouri, building things I actually care about.
          <br />
          <span className="text-foreground">Right now that means security tools and keeping people safe online.</span>
        </motion.p>

        {/* Tech tags — start at 0.82s, stagger 0.04s, last tag at ~1.02s */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.04, delayChildren: 0.82 } } }}
          className="flex flex-wrap justify-center gap-2"
        >
          {["Python", "C", "C++", "C#", "JavaScript", "TypeScript"].map((lang) => (
            <motion.span
              key={lang}
              variants={{
                hidden: { opacity: 0, y: 6 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
              }}
              className="rounded-md border border-border bg-secondary/80 px-3 py-1 font-mono text-xs text-muted-foreground backdrop-blur-sm transition-all duration-150 hover:scale-105 hover:border-primary/40"
            >
              {lang}
            </motion.span>
          ))}
        </motion.div>

        {/* CTA buttons — start at 0.62s, stagger 0.07s (appear while name is still animating, feels parallel) */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.07, delayChildren: 0.62 } } }}
          className="flex flex-col items-center gap-3 pt-1 sm:flex-row sm:gap-4"
        >
          <motion.div
            variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } } }}
            whileTap={{ scale: 0.97 }}
          >
            <Link href="/projects" className="group inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:brightness-110 glow-red transition-transform duration-150 hover:-translate-y-0.5">
              View Projects
              <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" />
            </Link>
          </motion.div>
          <motion.div
            variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } } }}
            whileTap={{ scale: 0.97 }}
          >
            <Link href="/about" className="rounded-lg border border-border bg-secondary px-6 py-3 font-medium text-secondary-foreground hover:border-primary/30 hover:bg-muted transition-all duration-150 hover:-translate-y-0.5">
              About Me
            </Link>
          </motion.div>
          <motion.a
            variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } } }}
            whileTap={{ scale: 0.97 }}
            href="https://github.com/RejectModders"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-border bg-secondary px-6 py-3 font-medium text-secondary-foreground hover:border-primary/30 hover:bg-muted transition-all duration-150 hover:-translate-y-0.5"
          >
            GitHub
          </motion.a>
        </motion.div>

      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4, duration: 2 }}
          className="font-mono text-[10px] text-muted-foreground/25 select-none"
        >
          {`// psst — try the konami code`}
        </motion.p>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
          <ChevronDown className="h-6 w-6 text-muted-foreground" />
        </motion.div>
      </motion.div>
    </section>
  )
}
