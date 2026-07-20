import { BackgroundFx } from '@/components/background-fx'
import { CursorGlow } from '@/components/cursor-glow'
import { SiteNav } from '@/components/site-nav'
import { Hero } from '@/components/hero'
import { Features } from '@/components/features'
import { PricingFooter } from '@/components/pricing-footer'

export default function Page() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <BackgroundFx />
      <CursorGlow />
      <SiteNav />
      <Hero />
      <Features />
      <PricingFooter />
    </main>
  )
}
