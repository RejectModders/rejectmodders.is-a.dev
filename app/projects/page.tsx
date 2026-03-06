import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { ProjectsPageContent } from "@/components/projects-page-content"

export const revalidate = 7200

export default function ProjectsPage() {
  return (
    <main className="relative min-h-screen">
      <Navbar />
      <ProjectsPageContent />
      <FooterSection />
    </main>
  )
}
