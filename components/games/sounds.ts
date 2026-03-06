// ── Game Sound Effects ───────────────────────────────────────────────────────
// Uses Web Audio API for instant, lag-free sounds

type SoundType = "eat" | "die" | "move" | "start" | "levelup"

class GameSounds {
  private ctx: AudioContext | null = null
  private enabled = true

  private getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    // Resume if suspended (browser autoplay policy)
    if (this.ctx.state === "suspended") {
      this.ctx.resume()
    }
    return this.ctx
  }

  toggle(): boolean {
    this.enabled = !this.enabled
    return this.enabled
  }

  isEnabled(): boolean {
    return this.enabled
  }

  play(type: SoundType) {
    if (!this.enabled) return

    try {
      const ctx = this.getContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.connect(gain)
      gain.connect(ctx.destination)

      const now = ctx.currentTime

      switch (type) {
        case "eat":
          // Happy blip - rising tone
          osc.type = "sine"
          osc.frequency.setValueAtTime(400, now)
          osc.frequency.exponentialRampToValueAtTime(800, now + 0.1)
          gain.gain.setValueAtTime(0.15, now)
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15)
          osc.start(now)
          osc.stop(now + 0.15)
          break

        case "die":
          // Sad descending tone
          osc.type = "sawtooth"
          osc.frequency.setValueAtTime(400, now)
          osc.frequency.exponentialRampToValueAtTime(100, now + 0.3)
          gain.gain.setValueAtTime(0.12, now)
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35)
          osc.start(now)
          osc.stop(now + 0.35)
          break

        case "move":
          // Subtle tick
          osc.type = "sine"
          osc.frequency.setValueAtTime(200, now)
          gain.gain.setValueAtTime(0.03, now)
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03)
          osc.start(now)
          osc.stop(now + 0.03)
          break

        case "start":
          // Game start jingle - 3 rising notes
          osc.type = "sine"
          osc.frequency.setValueAtTime(330, now)
          osc.frequency.setValueAtTime(440, now + 0.1)
          osc.frequency.setValueAtTime(550, now + 0.2)
          gain.gain.setValueAtTime(0.12, now)
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35)
          osc.start(now)
          osc.stop(now + 0.35)
          break

        case "levelup":
          // Speed increase notification
          osc.type = "square"
          osc.frequency.setValueAtTime(500, now)
          osc.frequency.setValueAtTime(600, now + 0.05)
          osc.frequency.setValueAtTime(700, now + 0.1)
          gain.gain.setValueAtTime(0.08, now)
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2)
          osc.start(now)
          osc.stop(now + 0.2)
          break
      }
    } catch {
      // Audio not available - fail silently
    }
  }
}

// Singleton instance
export const gameSounds = new GameSounds()
