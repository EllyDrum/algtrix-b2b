import { Navbar } from '@/sections/Navbar'
import { Hero } from '@/sections/Hero'
import { TrustStrip } from '@/sections/TrustStrip'
import { ComoFunciona } from '@/sections/ComoFunciona'
import { DemoSection } from '@/sections/DemoSection'
import { Benefits } from '@/sections/Benefits'
import { DataSample } from '@/sections/DataSample'
import { Segments } from '@/sections/Segments'
import { Comparison } from '@/sections/Comparison'
import { Pricing } from '@/sections/Pricing'
import { WhyAlgtrix } from '@/sections/WhyAlgtrix'
import { FAQ } from '@/sections/FAQ'
import { FinalCTA } from '@/sections/FinalCTA'
import { Footer } from '@/sections/Footer'
import { StickyCTA } from '@/sections/StickyCTA'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustStrip />
        <ComoFunciona />
        <DemoSection />
        <Benefits />
        <DataSample />
        <Segments />
        <Comparison />
        <Pricing />
        <WhyAlgtrix />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <StickyCTA />
    </>
  )
}
