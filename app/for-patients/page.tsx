import Link from "next/link"
import { AlertTriangle, Brain, FlaskConical, Pill, Users, Video } from "lucide-react"
import { MarketingPage } from "@/components/marketing/marketing-page"
import { Button } from "@/components/ui/button"

export const metadata = { title: "For citizens & patients" }

const FEATURES = [
  { icon: Brain, title: "AI Triage", body: "Describe your symptoms in Bangla or English and get instant, evidence-based guidance." },
  { icon: Video, title: "Telemedicine", body: "Consult with verified BMDC doctors over secure video — from anywhere." },
  { icon: Pill, title: "Digital prescriptions", body: "Get prescriptions with a pharmacy-scannable QR. Order delivery in minutes." },
  { icon: FlaskConical, title: "Unified lab reports", body: "All your test results in one place, with plain-language AI summaries." },
  { icon: Users, title: "Family profiles", body: "Manage health for parents, children, and dependants from one account." },
  { icon: AlertTriangle, title: "Emergency SOS", body: "One tap dispatches your location and medical record to emergency contacts." },
]

export default function ForPatientsPage() {
  return (
    <MarketingPage
      eyebrow="For citizens"
      title="Your family's health, in your pocket"
      description="AI-assisted care, verified doctors, and your full medical record — free for every citizen, paid only when a doctor reviews your case."
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
          <Link href="/auth/sign-up">Get started free</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/pricing">See pricing</Link>
        </Button>
      </div>
    </MarketingPage>
  )
}
