import Link from "next/link"
import { Building2, FlaskConical, Layers, ShieldCheck, Sparkles, Upload } from "lucide-react"
import { MarketingPage } from "@/components/marketing/marketing-page"
import { Button } from "@/components/ui/button"

export const metadata = { title: "For clinics & diagnostic labs" }

const FEATURES = [
  { icon: Upload, title: "Upload lab reports", body: "Drag & drop test results — the patient is notified in real time and the AI summary is auto-generated." },
  { icon: Sparkles, title: "AI report explanations", body: "Every report comes with a plain-language summary patients actually understand." },
  { icon: Building2, title: "Get discovered", body: "Be visible to patients in your district searching for the tests you offer." },
  { icon: FlaskConical, title: "Service catalogue", body: "List your tests, pricing, and turnaround time. Updates appear instantly in patient search." },
  { icon: Layers, title: "Unified dashboard", body: "Track uploads, patients, and revenue in one place." },
  { icon: ShieldCheck, title: "DGHS aligned", body: "Compliance with diagnostic-centre licensing built into the workflow." },
]

export default function ForClinicsPage() {
  return (
    <MarketingPage
      eyebrow="For clinics & diagnostic labs"
      title="Bring your clinic online in minutes"
      description="Upload reports, list your services, and connect with patients across Bangladesh — without changing how you work."
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
      <div className="mt-12 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/auth/sign-up?role=clinic">Register your clinic</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/contact">Talk to our team</Link>
        </Button>
      </div>
    </MarketingPage>
  )
}
