import Link from "next/link"
import { Check, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = { title: "Plans & billing" }

const PLANS = [
  {
    name: "Free",
    price: "৳0",
    cadence: "forever",
    description: "AI-first care, accessible to every Bangladeshi citizen.",
    features: ["AI triage and AI health chat", "Family member profiles (up to 6)", "Medicine reminders", "Lab report storage and AI summary"],
    cta: "Current plan",
    highlight: false,
  },
  {
    name: "Doctor Plan",
    price: "৳200",
    cadence: "/ consultation",
    description: "Verified doctor review, diagnosis, and digital prescription.",
    features: [
      "Verified BMDC doctor consultation",
      "Audio or video telemedicine",
      "Digital prescription with pharmacy QR",
      "Follow-up chat within 7 days",
    ],
    cta: "Book a doctor",
    highlight: true,
    href: "/app/clinics",
  },
  {
    name: "Specialist",
    price: "৳800",
    cadence: "/ consultation",
    description: "Cardiology, neurology, oncology, mental health — and more.",
    features: ["Senior consultant review", "Priority appointment booking", "Detailed second opinion", "Care plan with follow-ups"],
    cta: "Browse specialists",
    highlight: false,
    href: "/app/clinics",
  },
]

export default function BillingPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <header>
        <p className="text-sm uppercase tracking-wider text-primary">Plans & billing</p>
        <h1 className="mt-1 font-serif text-4xl tracking-tight text-foreground">Pay only for what you use</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          AI triage and AI chat are free for every citizen. Verified doctor consultations and lab tests are billed per
          use via bKash, Nagad, Rocket, or card.
        </p>
      </header>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
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
              {plan.href ? (
                <Button asChild className="w-full" variant={plan.highlight ? "default" : "outline"}>
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              ) : (
                <Button className="w-full" variant="outline" disabled>
                  {plan.cta}
                </Button>
              )}
            </div>
          </article>
        ))}
      </div>

      <section className="mt-16 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CreditCard className="size-5" />
          </div>
          <div>
            <h2 className="font-serif text-2xl tracking-tight text-foreground">Payment history</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Detailed transaction history with bKash, Nagad, Rocket, and card payments is coming soon. Receipts will be
              auto-mailed for every consultation.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
