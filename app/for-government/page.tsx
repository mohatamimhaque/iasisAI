import Link from "next/link"
import { BarChart3, Building, Globe, Landmark, MapPin, ShieldCheck } from "lucide-react"
import { MarketingPage } from "@/components/marketing/marketing-page"
import { Button } from "@/components/ui/button"

export const metadata = { title: "For government & public health" }

const FEATURES = [
  { icon: Landmark, title: "National coverage", body: "One platform that serves every district, every union, every citizen — bridging the urban-rural healthcare gap." },
  { icon: BarChart3, title: "Real-time analytics", body: "Population health dashboards: disease trends, outbreak detection, regional service gaps." },
  { icon: ShieldCheck, title: "Aligned with policy", body: "Built around BMDC, DGHS, DGDA, and ICT Ministry standards. Data residency in Bangladesh." },
  { icon: Globe, title: "Multilingual", body: "Native support for Bangla, English, and regional languages — culturally and linguistically appropriate." },
  { icon: MapPin, title: "Outbreak intelligence", body: "Aggregated, anonymised triage data flags outbreaks days before traditional reporting." },
  { icon: Building, title: "Public infrastructure", body: "Operates as critical national health infrastructure — open APIs for public hospitals." },
]

export default function ForGovernmentPage() {
  return (
    <MarketingPage
      eyebrow="For government & public health"
      title="National healthcare infrastructure"
      description="Iasis is built to be Bangladesh's foundational health-tech layer — supporting the Ministry of Health, DGHS, BMDC, DGDA, and the Smart Bangladesh vision."
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <article key={f.title} className="rounded-2xl border border-border bg-card p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <f.icon className="size-5" />
            </div>
            <h3 className="mt-4 font-serif text-xl tracking-tight text-foreground">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
          </article>
        ))}
      </div>
      <div className="mt-12">
        <Button asChild size="lg">
          <Link href="/contact">Schedule a briefing</Link>
        </Button>
      </div>
    </MarketingPage>
  )
}
