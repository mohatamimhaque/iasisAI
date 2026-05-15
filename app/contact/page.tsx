import { Mail, MapPin, Phone } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { MarketingPage } from "@/components/marketing/marketing-page"

export const metadata = { title: "Contact Iasis AI" }
export const dynamic = "force-dynamic"

export default async function ContactPage() {
  const supabase = await createClient()
  const { data: rows } = await supabase
    .from("site_config")
    .select("key, value")
    .in("key", ["contact_email", "contact_phone", "contact_office", "contact_partnership_email"])

  const cfg = Object.fromEntries((rows ?? []).filter((r) => r.value).map((r) => [r.key, r.value as string]))

  const email = cfg.contact_email ?? "hello@iasis.health"
  const phone = cfg.contact_phone ?? "+880 1700 000 000"
  const office = cfg.contact_office ?? "Gulshan-2, Dhaka 1212"
  const partnershipEmail = cfg.contact_partnership_email ?? "partners@iasis.health"

  return (
    <MarketingPage
      eyebrow="Contact"
      title="Talk to our team"
      description="Whether you're a citizen needing help, a clinic ready to onboard, or a government partner — we'd love to hear from you."
    >
      <div className="grid gap-6 sm:grid-cols-3">
        {[
          { icon: Mail, label: "Email", value: email },
          { icon: Phone, label: "Phone", value: phone },
          { icon: MapPin, label: "Office", value: office },
        ].map((item) => (
          <article key={item.label} className="rounded-2xl border border-border bg-card p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <item.icon className="size-5" />
            </div>
            <p className="mt-4 text-xs uppercase tracking-wider text-muted-foreground">{item.label}</p>
            <p className="mt-1 text-base text-foreground">{item.value}</p>
          </article>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-border bg-card p-8">
        <h2 className="font-serif text-2xl tracking-tight text-foreground">Partnership enquiries</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          For clinic onboarding, diagnostic lab partnerships, government deployments, and enterprise health programs,
          email <span className="text-foreground">{partnershipEmail}</span>. We respond within one business day.
        </p>
      </div>
    </MarketingPage>
  )
}
