import Link from "next/link"
import { CheckCircle2, Pill, ShieldAlert, ShieldCheck } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { IasisLogo } from "@/components/brand/iasis-logo"
import { getBrandingConfig } from "@/lib/site-config"

export const metadata = {
  title: "Verify prescription",
}

interface RxItem {
  medicine_name: string
  dosage: string | null
  frequency: string | null
  duration: string | null
  instructions: string | null
}

interface VerifyResult {
  valid: boolean
  id?: string
  diagnosis?: string | null
  status?: string
  signed_at?: string
  doctor_name?: string | null
  items?: RxItem[]
}

export default async function VerifyPrescriptionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ t?: string }>
}) {
  const { id } = await params
  const { t } = await searchParams
  const token = t ?? ""

  const supabase = await createClient()
  const { data, error } = await supabase.rpc("verify_prescription", {
    rx_id: id,
    rx_token: token,
  })

  const result = (data as VerifyResult | null) ?? { valid: false }
  const isValid = !error && result.valid === true
  const { logoUrl } = await getBrandingConfig()

  return (
    <main className="min-h-svh bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="inline-flex">
            <IasisLogo logoUrl={logoUrl} />
          </Link>
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Pharmacy verification</span>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        {!isValid ? (
          <section className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <ShieldAlert className="size-7" />
            </span>
            <h1 className="mt-4 font-serif text-3xl tracking-tight text-foreground">Not a valid Iasis prescription</h1>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              The QR code you scanned does not match any prescription in our system, or the verification token is
              invalid. Do not dispense medication against this document.
            </p>
          </section>
        ) : (
          <>
            <section className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
                <ShieldCheck className="size-3" />
                Authentic · Status: {result.status}
              </span>
              <h1 className="mt-3 font-serif text-3xl tracking-tight text-foreground">
                Verified Iasis prescription
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Issued by{" "}
                <span className="font-medium text-foreground">{result.doctor_name ?? "Registered doctor"}</span>
                {result.signed_at
                  ? ` on ${new Date(result.signed_at).toLocaleString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}`
                  : null}
              </p>
            </section>

            {result.diagnosis ? (
              <section className="mt-6 rounded-2xl border border-border bg-card p-6">
                <h2 className="text-xs uppercase tracking-wider text-muted-foreground">Diagnosis</h2>
                <p className="mt-2 text-base leading-relaxed text-foreground">{result.diagnosis}</p>
              </section>
            ) : null}

            <section className="mt-6 rounded-2xl border border-border bg-card p-6">
              <h2 className="font-serif text-2xl tracking-tight text-foreground">Medicines</h2>
              {!result.items || result.items.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">No medicines listed.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {result.items.map((it, idx) => (
                    <li key={idx} className="rounded-xl border border-border bg-background p-4">
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Pill className="size-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base font-medium text-foreground">{it.medicine_name}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {[it.dosage, it.frequency, it.duration].filter(Boolean).join(" · ") || "—"}
                          </p>
                          {it.instructions ? (
                            <p className="mt-2 text-sm leading-relaxed text-foreground">{it.instructions}</p>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="mt-6 flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
              <p>
                This document was digitally signed by an Iasis-verified doctor. The patient identity has been redacted
                for privacy. Pharmacy staff should match the patient at the counter to the name on the printed copy.
              </p>
            </section>
          </>
        )}
      </div>
    </main>
  )
}
