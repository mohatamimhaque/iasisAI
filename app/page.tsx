import { SiteHeader } from "@/components/marketing/site-header"
import { SiteFooter } from "@/components/marketing/site-footer"
import { Hero } from "@/components/marketing/hero"
import { ValuePillars } from "@/components/marketing/value-pillars"
import { Audiences } from "@/components/marketing/audiences"
import { HowItWorks } from "@/components/marketing/how-it-works"
import { CtaSection } from "@/components/marketing/cta-section"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) redirect("/app")

  return (
    <div className="flex min-h-svh flex-col bg-background" suppressHydrationWarning>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <ValuePillars />
        <HowItWorks />
        <Audiences />
        <CtaSection />
      </main>
      <SiteFooter />
    </div>
  )
}
