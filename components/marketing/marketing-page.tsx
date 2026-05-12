import type { ReactNode } from "react"
import { SiteHeader } from "@/components/marketing/site-header"
import { SiteFooter } from "@/components/marketing/site-footer"

type MarketingPageProps = {
  eyebrow?: string
  title: string
  description?: string
  children: ReactNode
}

export function MarketingPage({ eyebrow, title, description, children }: MarketingPageProps) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border/60 bg-muted/30">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
            {eyebrow && <p className="text-sm uppercase tracking-[0.18em] text-primary">{eyebrow}</p>}
            <h1 className="mt-3 font-serif text-5xl tracking-tight text-foreground sm:text-6xl">{title}</h1>
            {description && (
              <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">{description}</p>
            )}
          </div>
        </section>
        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">{children}</section>
      </main>
      <SiteFooter />
    </div>
  )
}
