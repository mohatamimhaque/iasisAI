import { MarketingPage } from "@/components/marketing/marketing-page"

export const metadata = { title: "Privacy policy" }

export default function PrivacyPage() {
  return (
    <MarketingPage
      eyebrow="Legal"
      title="Privacy policy"
      description="What data Iasis collects, how we use it, who can access it, and the rights you have."
    >
      <div className="space-y-8 text-pretty text-base leading-relaxed text-foreground">
        <section>
          <h2 className="font-serif text-2xl tracking-tight">What we collect</h2>
          <p className="mt-3 text-muted-foreground">
            Your name, contact information, demographic data you choose to share, and the health data you actively input
            (symptoms, lab reports, prescriptions, medication schedules). We collect technical telemetry to keep the
            service secure and reliable.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-2xl tracking-tight">How we use it</h2>
          <p className="mt-3 text-muted-foreground">
            To provide care to you and your family — AI triage, doctor matching, prescription delivery, lab access, and
            personalized health guidance. Aggregated, fully-anonymized statistics may be shared with the Ministry of
            Health for public-health research.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-2xl tracking-tight">Who can see it</h2>
          <p className="mt-3 text-muted-foreground">
            Only you, by default. Doctors and clinics see only what you explicitly share, per consultation. No data is
            sold to third parties. Iasis staff cannot access your medical record without an audit-logged service ticket.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-2xl tracking-tight">Your rights</h2>
          <p className="mt-3 text-muted-foreground">
            You can export, correct, or delete your data at any time from Settings. Account closure removes your medical
            record in line with national retention requirements.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-2xl tracking-tight">Security</h2>
          <p className="mt-3 text-muted-foreground">
            Data is encrypted at rest (AES-256) and in transit (TLS 1.3). We follow OWASP best practices and undergo
            annual third-party security audits. Iasis is HIPAA-equivalent in its data-handling and is aligned with the
            Bangladesh Data Protection Act.
          </p>
        </section>
      </div>
    </MarketingPage>
  )
}
