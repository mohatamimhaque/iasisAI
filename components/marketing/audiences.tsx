import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

const AUDIENCES = [
  {
    id: "citizens",
    eyebrow: "For citizens",
    title: "Healthcare that travels with you.",
    body: "From rural villages to city centers, every South Asian gets a single health record, AI triage at midnight, and a trusted doctor a tap away. No more lost lab reports. No more guessing.",
    bullets: ["Triage in Bangla or English", "Family profiles (parents, children)", "Lab reports & prescriptions in one place"],
    image: "/marketing/citizen-mobile-health.svg",
    imageAlt: "A citizen using Iasis AI on mobile — health score, reminders and family profiles",
    cta: { label: "Create your account", href: "/auth/sign-up" },
  },
  {
    id: "doctors",
    eyebrow: "For doctors",
    title: "Practice anywhere. Keep your patients with you.",
    body: "Verified specialists run consultations, prescribe, and follow up — without the admin. Iasis handles bookings, payments, clinical notes and patient history so you can focus on care.",
    bullets: ["BMDC-verified profiles", "Audio, video & chat consults", "Smart clinical notes & follow-ups"],
    image: "/marketing/doctor-portrait.jpg",
    imageAlt: "A South Asian doctor in a modern hospital",
    cta: { label: "Join as a doctor", href: "/auth/sign-up?role=doctor" },
    reverse: true,
  },
  {
    id: "clinics",
    eyebrow: "For clinics & hospitals",
    title: "From a 4-bed clinic to a 400-bed hospital.",
    body: "Onboard your doctors, manage schedules, accept in-person and online bookings, and track operations in real time. Iasis is your full clinical operating layer — at the price of a phone bill.",
    bullets: ["Doctor & schedule management", "In-person + online bookings", "Operational analytics"],
    image: "/marketing/clinic-interior.jpg",
    imageAlt: "Interior of a modern small clinic in South Asia",
    cta: { label: "Onboard your clinic", href: "/auth/sign-up?role=clinic" },
  },
  {
    id: "government",
    eyebrow: "For the government",
    title: "National health, in real time.",
    body: "An anonymised, district-level view of consultations, prescriptions, outbreaks and outcomes — built to support ministries, health agencies, and policy makers shaping South Asia's healthcare future.",
    bullets: ["Anonymised analytics by district", "Outbreak & trend detection", "API access for partner agencies"],
    image: "/marketing/government-analytics.svg",
    imageAlt: "Regional health intelligence dashboard showing district-level analytics across South Asia",
    cta: { label: "Talk to our team", href: "#" },
    reverse: true,
  },
]

export function Audiences() {
  return (
    <section className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28" suppressHydrationWarning>
        <div className="max-w-2xl" suppressHydrationWarning>
          <p className="text-sm uppercase tracking-wider text-primary">Who it&apos;s for</p>
          <h2 className="mt-3 text-balance font-serif text-4xl leading-tight tracking-tight text-foreground sm:text-5xl">
            Built for every side of South Asian healthcare.
          </h2>
        </div>

        <div className="mt-16 space-y-20 lg:space-y-28" suppressHydrationWarning>
          {AUDIENCES.map((aud) => (
            <article
              key={aud.id}
              id={aud.id}
              className="grid scroll-mt-24 grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16"
              suppressHydrationWarning
            >
              <div className={`lg:col-span-6 ${aud.reverse ? "lg:order-2" : ""}`} suppressHydrationWarning>
                <p className="text-sm uppercase tracking-wider text-primary">{aud.eyebrow}</p>
                <h3 className="mt-3 text-balance font-serif text-3xl leading-tight tracking-tight text-foreground sm:text-4xl">
                  {aud.title}
                </h3>
                <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">{aud.body}</p>
                <ul className="mt-6 space-y-3">
                  {aud.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-3 text-sm text-foreground">
                      <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span className="leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={aud.cta.href}
                  className="mt-8 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80"
                >
                  {aud.cta.label}
                  <ArrowUpRight className="size-4" />
                </Link>
              </div>

              <div className={`lg:col-span-6 ${aud.reverse ? "lg:order-1" : ""}`} suppressHydrationWarning>
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-muted" suppressHydrationWarning>
                  <Image
                    src={aud.image || "/placeholder.svg"}
                    alt={aud.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
