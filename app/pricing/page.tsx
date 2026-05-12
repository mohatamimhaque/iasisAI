import Link from "next/link"
import { Check } from "lucide-react"
import { MarketingPage } from "@/components/marketing/marketing-page"
import { Button } from "@/components/ui/button"

export const metadata = { title: "Pricing" }

const PLANS = [
  {
    name: "Free Citizen",
    price: "৳0",
    cadence: "forever",
    description: "AI-first care, accessible to every Bangladeshi.",
    features: [
      "Unlimited AI triage and AI chat",
      "Family member profiles",
      "Medicine reminders",
      "Lab report storage and AI summary",
      "Emergency SOS to nearest hospital",
    ],
    cta: { label: "Sign up free", href: "/auth/sign-up" },
    highlight: false,
  },
  {
    name: "Doctor Consultation",
    price: "৳200",
    cadence: "/ consultation",
    description: "Verified BMDC doctor review and digital prescription.",
    features: [
      "Verified BMDC doctor",
      "Audio or video telemedicine",
      "Digital prescription with pharmacy QR",
      "Follow-up chat within 7 days",
      "Saved to your medical record",
    ],
    cta: { label: "Get started", href: "/auth/sign-up" },
    highlight: true,
  },
  {
    name: "Specialist",
    price: "৳800",
    cadence: "/ consultation",
    description: "Cardiology, neurology, oncology, mental health.",
    features: [
      "Senior consultant review",
      "Priority appointment booking",
      "Second-opinion detail report",
      "Care plan with follow-ups",
      "Audio/video on demand",
    ],
    cta: { label: "Browse specialists", href: "/auth/sign-up" },
    highlight: false,
  },
]

export default function PricingPage() {
  return (
    <MarketingPage
      eyebrow="Pricing"
      title="Free for AI. Pay only for verified care."
      description="AI triage and AI chat are free for every citizen, forever. You only pay when a verified BMDC doctor reviews your case."
    >
      <div className="grid gap-6 md:grid-cols-3">
        {PLANS.map((plan) => (
          <article
            key={plan.name}
            className={`flex flex-col rounded-2xl border p-6 ${plan.highlight ? "border-primary bg-primary/5" : "border-border bg-card"}`}
          >
            <h3 className="font-serif text-xl tracking-tight text-foreground">{plan.name}</h3>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="font-serif text-4xl tracking-tight text-foreground">{plan.price}</span>
              <span className="text-sm text-muted-foreground">{plan.cadence}</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{plan.description}</p>
            <ul className="mt-6 space-y-3 text-sm">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Button asChild className="w-full" variant={plan.highlight ? "default" : "outline"}>
                <Link href={plan.cta.href}>{plan.cta.label}</Link>
              </Button>
            </div>
          </article>
        ))}
      </div>

      <p className="mt-10 text-sm text-muted-foreground">
        Payments accepted: bKash, Nagad, Rocket, VISA, Mastercard. Government and NGO partners can request bulk pricing
        from{" "}
        <Link href="/contact" className="text-foreground underline-offset-4 hover:underline">
          our team
        </Link>
        .
      </p>
    </MarketingPage>
  )
}
