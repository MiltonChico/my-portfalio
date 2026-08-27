import { Hero } from '@/components/sections/hero'
import { About } from '@/components/sections/about'
import { TechPillars } from '@/components/sections/tech-pillars'
import { BridgeSection } from '@/components/sections/bridge-section'
import { ComexShowcase } from '@/components/sections/comex-showcase'
import { ContactSection } from '@/components/sections/contact-section'

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <TechPillars />
      <BridgeSection />
      <ComexShowcase />
      <ContactSection />
    </main>
  )
}
