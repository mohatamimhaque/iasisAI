import Link from "next/link"
import { Check } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { MarketingPage } from "@/components/marketing/marketing-page"
import { Button } from "@/components/ui/button"

export const metadata = { title: "Pricing" }
export const dynamic = "force-dynamic"

const FALLBACK_PLANS = [
  {
    id: "free",
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
    cta_label: "Sign up free",
    cta_href: "/auth/sign-up",
    is_highlighted: false,
  },
  {
    id: "doctor",
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
    cta_label: "Get started",
    cta_href: "/auth/sign-up",
    is_highlighted: true,
  },
  {
    id: "specialist",
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
    cta_label: "Browse specialists",
    cta_href: "/auth/sign-up",
    is_highlighted: false,
  },
]

export default async function PricingPage() {
  const adminClient = createAdminClient()
  const supabase = adminClient ?? (await createClient())
  const { data } = await supabase
    .from("pricing_plans")
    .select("id, name, price, cadence, description, features, cta_label, cta_href, is_highlighted")
    .eq("is_active", true)
    .order("order_index")
    .order("name")

  const plans = data && data.length > 0 ? data : FALLBACK_PLANS

  return (
    <MarketingPage
      eyebrow="Pricing"
      title="Free for AI. Pay only for verified care."
      description="AI triage and AI chat are free for every citizen, forever. You only pay when a verified BMDC doctor reviews your case."
    >
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <article
            key={plan.id}
            className={[
              "group relative flex flex-col rounded-2xl border p-6",
              "transition-all duration-300 ease-out",
              "hover:-translate-y-2 cursor-default",
              plan.is_highlighted
                ? "border-primary bg-primary/5 shadow-md hover:shadow-2xl hover:shadow-primary/15 hover:border-primary"
                : "border-border bg-card hover:border-primary/50 hover:shadow-xl hover:shadow-black/5",
            ].join(" ")}
          >
            {plan.is_highlighted && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground shadow-sm">
                  Most popular
                </span>
              </div>
            )}

            <h3 className="font-serif text-xl tracking-tight text-foreground">{plan.name}</h3>

            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="font-serif text-4xl tracking-tight text-foreground">{plan.price}</span>
              <span className="text-sm text-muted-foreground">{plan.cadence}</span>
            </div>

            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{plan.description}</p>

            <ul className="mt-6 flex-1 space-y-3 text-sm">
              {(plan.features ?? []).map((f: string) => (
                <li key={f} className="flex items-start gap-2.5 text-foreground">
                  <span className="mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                    <Check className="size-3 text-primary" />
                  </span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Button
                asChild
                className="w-full transition-transform duration-200 group-hover:scale-[1.02]"
                variant={plan.is_highlighted ? "default" : "outline"}
              >
                <Link href={plan.cta_href}>{plan.cta_label}</Link>
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
