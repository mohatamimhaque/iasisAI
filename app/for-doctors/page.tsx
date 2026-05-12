import Link from "next/link"
import { BarChart3, Brain, Calendar, FileText, ShieldCheck, Stethoscope } from "lucide-react"
import { MarketingPage } from "@/components/marketing/marketing-page"
import { Button } from "@/components/ui/button"

export const metadata = { title: "For doctors" }

const FEATURES = [
  { icon: Stethoscope, title: "Run your practice", body: "Manage appointments, telemedicine, and patient records in one verified workspace." },
  { icon: Brain, title: "AI scribe & co-pilot", body: "AI captures notes during consultations and drafts prescriptions for your review." },
  { icon: Calendar, title: "Flexible scheduling", body: "Set your availability, fee, and accept telemedicine on your terms." },
  { icon: FileText, title: "Digital prescriptions", body: "Every prescription is signed, QR-verified, and saved to the patient record." },
  { icon: BarChart3, title: "Reach more patients", body: "Get discovered by patients across all 64 districts of Bangladesh." },
  { icon: ShieldCheck, title: "BMDC verified", body: "Every doctor is BMDC-verified — patients trust the platform because we do the work." },
]

export default function ForDoctorsPage() {
  return (
    <MarketingPage
      eyebrow="For doctors"
      title="Practice modern medicine, at scale"
      description="A complete workspace for BMDC-verified doctors — appointments, telemedicine, AI co-pilot, and digital prescriptions, all consent-gated and audit-logged."
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
          <Link href="/auth/sign-up?role=doctor">Apply to join</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/contact">Talk to our team</Link>
        </Button>
      </div>
    </MarketingPage>
  )
}
