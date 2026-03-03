import { GamesPageContent } from "@/components/games-page-content"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Games | RejectModders",
  description: "A small arcade — classic games built in the browser.",
}

export default function GamesPage() {
  return (
    <div className="relative min-h-screen">
      <Navbar />
      <GamesPageContent />
      <FooterSection />
    </div>
  )
}

