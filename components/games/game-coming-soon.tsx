"use client"

import { motion } from "framer-motion"
import { Clock, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { EASE, DUR, PAGE_START } from "@/lib/animation"

export function GameComingSoon({ title }: { title: string }) {
  return (
    <main className="min-h-screen pt-24 pb-16 flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DUR, delay: PAGE_START, ease: EASE }}
        className="flex flex-col items-center gap-6 text-center"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-muted">
          <Clock className="h-10 w-10 text-muted-foreground" />
        </div>
        
        <div>
          <h1 className="font-mono text-2xl font-bold text-foreground mb-2">{title}</h1>
          <p className="font-mono text-sm text-muted-foreground">
            This game is being rebuilt with improved graphics and sounds.
          </p>
          <p className="font-mono text-xs text-muted-foreground/60 mt-1">
            Check back soon!
          </p>
        </div>

        <Link
          href="/games"
          className="flex items-center gap-2 font-mono text-sm text-primary hover:text-primary/80 transition-colors mt-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Games
        </Link>
      </motion.div>
    </main>
  )
}
