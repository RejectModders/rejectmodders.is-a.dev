import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { IntroStrip } from "@/components/intro-strip"
import { VulnRadarSection } from "@/components/vulnradar-section"
import { ProjectsSection } from "@/components/projects-section"
import { ContactSection } from "@/components/contact-section"
import { FooterSection } from "@/components/footer-section"

export const revalidate = 7200

export default function Home() {
  return (
    <main id="main-content" className="relative min-h-screen">
      <Navbar />
      <HeroSection />
      <IntroStrip />
      <VulnRadarSection />
      <ProjectsSection />
      <ContactSection />
      <FooterSection />
    </main>
  )
}
