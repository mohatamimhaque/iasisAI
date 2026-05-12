import { MarketingPage } from "@/components/marketing/marketing-page"

export const metadata = { title: "About Iasis AI" }

export default function AboutPage() {
  return (
    <MarketingPage
      eyebrow="About"
      title="Healthcare infrastructure for Bangladesh"
      description="Iasis AI is a national-scale healthcare platform built to serve every Bangladeshi citizen — connecting AI triage, telemedicine, diagnostic labs, and digital prescriptions under one secure, government-aligned system."
    >
      <div className="prose prose-neutral max-w-none text-pretty text-base leading-relaxed text-foreground">
        <p>
          Bangladesh has world-class doctors, dedicated nurses, and a fast-growing healthcare market — but rural
          patients still travel hours for diagnostic care, prescriptions are paper-only, and there is no unified
          health record. Iasis exists to fix that.
        </p>
        <h2 className="mt-10 font-serif text-2xl tracking-tight">Our mission</h2>
        <p>
          Make high-quality healthcare accessible to every citizen — in every district, in every language — through
          AI-assisted triage, verified telemedicine, and a unified medical record patients truly own.
        </p>
        <h2 className="mt-10 font-serif text-2xl tracking-tight">Built in Bangladesh, for Bangladesh</h2>
        <p>
          Localized for Bangla and regional languages, integrated with bKash, Nagad, and Rocket, aligned with the
          Ministry of Health and ICT, and designed for 4G mobile networks first.
        </p>
        <h2 className="mt-10 font-serif text-2xl tracking-tight">Trust by design</h2>
        <p>
          Every prescription is signed by a BMDC-verified doctor. Every clinic is licensed by DGHS. Every medication
          comes from a DGDA-licensed pharmacy. Patient data is encrypted, consent-gated, and never sold.
        </p>
      </div>
    </MarketingPage>
  )
}
