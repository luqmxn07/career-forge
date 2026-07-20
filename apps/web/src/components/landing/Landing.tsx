import { CursorGlow } from './cursor-glow'
import { BackgroundFx } from './background-fx'
import { SiteNav } from './site-nav'
import { Hero } from './hero'
import { Features } from './features'
import { PricingFooter } from './pricing-footer'

export function LandingPage() {
  return (
    <div className="relative min-h-screen bg-background font-sans text-foreground selection:bg-brand-cyan/30 selection:text-brand-cyan">
      <CursorGlow />
      <BackgroundFx />
      <SiteNav />
      <main>
        <Hero />
        <Features />
      </main>
      <PricingFooter />
    </div>
  )
}

export default LandingPage;
