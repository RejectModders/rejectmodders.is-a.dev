import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { AboutPageContent } from "@/components/about-page-content"

export const revalidate = 7200

export default function AboutPage() {
  return (
    <main className="relative min-h-screen">
      <Navbar />
      <AboutPageContent />
      <FooterSection />
    </main>
  )
}
