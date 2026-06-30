import { Hero } from '@/components/sections/hero'
import { About } from '@/components/sections/about'
import { TechStackMarquee } from '@/components/sections/tech-stack-marquee'
import { BridgeSection } from '@/components/sections/bridge-section'
import { ComexShowcase } from '@/components/sections/comex-showcase'
import { ContactSection } from '@/components/sections/contact-section'

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <TechStackMarquee />
      <BridgeSection />
      <ComexShowcase />
      <ContactSection />
    </main>
  )
}
