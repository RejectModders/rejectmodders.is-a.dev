import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { SpotifyPageContent } from "@/components/spotify-page-content"

export const revalidate = 0

export default function SpotifyPage() {
  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <Navbar />
      <SpotifyPageContent />
      <FooterSection />
    </main>
  )
}
