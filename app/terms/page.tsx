import { MarketingPage } from "@/components/marketing/marketing-page"

export const metadata = { title: "Terms of service" }

export default function TermsPage() {
  return (
    <MarketingPage
      eyebrow="Legal"
      title="Terms of service"
      description="The agreement between you and Iasis AI when you use our platform."
    >
      <div className="space-y-8 text-pretty text-base leading-relaxed text-foreground">
        <section>
          <h2 className="font-serif text-2xl tracking-tight">Medical disclaimer</h2>
          <p className="mt-3 text-muted-foreground">
            Iasis AI provides health information and connects you to licensed providers. AI features assist with triage
            and information — they do not replace clinical judgment. In an emergency, call 999 or use the in-app SOS
            button.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-2xl tracking-tight">Your account</h2>
          <p className="mt-3 text-muted-foreground">
            You agree to provide accurate information and to keep your credentials secure. You are responsible for the
            health data you share with doctors and clinics. You can deactivate your account at any time.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-2xl tracking-tight">Provider verification</h2>
          <p className="mt-3 text-muted-foreground">
            Doctors on Iasis are verified by BMDC ID; clinics by DGHS license; pharmacies by DGDA license. We act as the
            platform — providers are independent clinicians and businesses.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-2xl tracking-tight">Payments and refunds</h2>
          <p className="mt-3 text-muted-foreground">
            Consultation fees are charged per use via bKash, Nagad, Rocket, or card. If a consultation is cancelled by
            the doctor or platform, a refund is issued within 5 business days.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-2xl tracking-tight">Governing law</h2>
          <p className="mt-3 text-muted-foreground">
            These terms are governed by the laws of Bangladesh. Disputes will be resolved in the courts of Dhaka.
          </p>
        </section>
      </div>
    </MarketingPage>
  )
}
