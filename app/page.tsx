import { Navbar } from '@/sections/Navbar'
import { Hero } from '@/sections/Hero'
import { TrustStrip } from '@/sections/TrustStrip'
import { Problem } from '@/sections/Problem'
import { DemoSection } from '@/sections/DemoSection'
import { Benefits } from '@/sections/Benefits'
import { Filters } from '@/sections/Filters'
import { ICP } from '@/sections/ICP'
import { DataSample } from '@/sections/DataSample'
import { Segments } from '@/sections/Segments'
import { WhyAlgtrix } from '@/sections/WhyAlgtrix'
import { Comparison } from '@/sections/Comparison'
import { Offer } from '@/sections/Offer'
import { Pricing } from '@/sections/Pricing'
import { ObjectionsMicro } from '@/sections/ObjectionsMicro'
import { Guarantee } from '@/sections/Guarantee'
import { FAQ } from '@/sections/FAQ'
import { FinalCTA } from '@/sections/FinalCTA'
import { Footer } from '@/sections/Footer'
import { StickyCTA } from '@/sections/StickyCTA'
import { ExitIntentTrigger } from '@/sections/ExitIntentTrigger'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustStrip />
        <Problem />
        <DemoSection />
        <Benefits />
        <Filters />
        <ICP />
        <DataSample />
        <Segments />
        <WhyAlgtrix />
        <Comparison />
        <Offer />
        <Pricing />
        <ObjectionsMicro />
        <Guarantee />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <StickyCTA />
      <ExitIntentTrigger />
    </>
  )
}
