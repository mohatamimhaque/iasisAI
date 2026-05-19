import { Brain, Stethoscope, FileText, Pill, Building2, FlaskConical } from "lucide-react"

const PILLARS = [
  {
    icon: Brain,
    title: "AI Triage",
    body: "Describe symptoms in Bangla or English. Get urgency, possible conditions, and recommended next steps in seconds — guided, never diagnostic.",
  },
  {
    icon: Stethoscope,
    title: "Telemedicine",
    body: "Book a verified doctor by specialty, district, or rating. Audio, video, and chat consultations with a full clinical note at the end.",
  },
  {
    icon: FileText,
    title: "Unified Records",
    body: "One medical record per citizen. Prescriptions, lab reports, vitals, and family history follow you across every clinic in Bangladesh.",
  },
  {
    icon: Pill,
    title: "Prescriptions",
    body: "Doctors issue digital prescriptions with dosage reminders. Patients get refill alerts; pharmacies fulfil through verified partners.",
  },
  {
    icon: FlaskConical,
    title: "Lab Reports",
    body: "Labs upload PDFs directly to a patient's record. AI summarises flagged values, and the treating doctor sees them instantly.",
  },
  {
    icon: Building2,
    title: "Clinic Operations",
    body: "Clinics manage doctors, schedules, in-person bookings, and analytics from one dashboard. Built for both 4-bed clinics and 400-bed hospitals.",
  },
]

export function ValuePillars() {
  return (
    <section className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28" suppressHydrationWarning>
        <div className="max-w-2xl" suppressHydrationWarning>
          <p className="text-sm uppercase tracking-wider text-primary">The platform</p>
          <h2 className="mt-3 text-balance font-serif text-4xl leading-tight tracking-tight text-foreground sm:text-5xl">
            One layer underneath every healthcare interaction in South Asia.
          </h2>
          <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
            Iasis AI replaces fragmented paperwork, lost reports, and guesswork with a single, secure, AI-assisted
            health record — accessible to citizens, doctors, clinics and the government.
          </p>
        </div>

        <ul className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3" suppressHydrationWarning>
          {PILLARS.map((pillar) => (
            <li key={pillar.title} className="group bg-card p-8 transition-colors hover:bg-secondary/40">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <pillar.icon className="size-5" />
              </span>
              <h3 className="mt-5 font-serif text-2xl tracking-tight text-foreground">{pillar.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{pillar.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
