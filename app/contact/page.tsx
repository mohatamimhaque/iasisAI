import { Mail, MapPin, Phone } from "lucide-react"
import { MarketingPage } from "@/components/marketing/marketing-page"

export const metadata = { title: "Contact Iasis AI" }

export default function ContactPage() {
  return (
    <MarketingPage
      eyebrow="Contact"
      title="Talk to our team"
      description="Whether you're a citizen needing help, a clinic ready to onboard, or a government partner — we'd love to hear from you."
    >
      <div className="grid gap-6 sm:grid-cols-3">
        {[
          { icon: Mail, label: "Email", value: "hello@iasis.health" },
          { icon: Phone, label: "Phone", value: "+880 1700 000 000" },
          { icon: MapPin, label: "Office", value: "Gulshan-2, Dhaka 1212" },
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
          email <span className="text-foreground">partners@iasis.health</span>. We respond within one business day.
        </p>
      </div>
    </MarketingPage>
  )
}
