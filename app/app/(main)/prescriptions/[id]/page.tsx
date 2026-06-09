import Link from "next/link"
import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft, Pill, QrCode, ShieldCheck } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { PrescriptionQR } from "@/components/prescriptions/prescription-qr"

export const metadata = {
  title: "Prescription",
}

export default async function PrescriptionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: rx } = await supabase
    .from("prescriptions")
    .select("id, diagnosis, notes, status, signed_at, verification_token")
    .eq("id", id)
    .eq("patient_id", user.id)
    .single()
  if (!rx) notFound()

  const h = await headers()
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000"
  const proto = h.get("x-forwarded-proto") ?? "https"
  const verifyUrl = `${proto}://${host}/verify/rx/${rx.id}?t=${rx.verification_token}`

  const { data: items } = await supabase
    .from("prescription_items")
    .select("id, medicine_name, dosage, frequency, duration, instructions")
    .eq("prescription_id", rx.id)
    .order("created_at", { ascending: true })

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <Link
        href="/app/prescriptions"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to prescriptions
      </Link>

      <header className="mt-6 flex flex-col gap-2">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <ShieldCheck className="size-3" />
          Digitally signed · Status: {rx.status}
        </span>
        <h1 className="font-serif text-4xl tracking-tight text-foreground">
          {rx.diagnosis ?? "Prescription"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Signed{" "}
          {new Date(rx.signed_at).toLocaleString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      </header>

      <section className="mt-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-serif text-2xl tracking-tight text-foreground">Medicines</h2>
        {(!items || items.length === 0) ? (
          <p className="mt-3 text-sm text-muted-foreground">No medicines listed.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {items.map((it) => (
              <li key={it.id} className="rounded-xl border border-border bg-background p-4">
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

      {rx.notes ? (
        <section className="mt-6 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-serif text-xl tracking-tight text-foreground">Doctor&apos;s notes</h2>
          <p className="mt-2 text-sm leading-relaxed text-foreground">{rx.notes}</p>
        </section>
      ) : null}

      <section className="mt-6 flex flex-col items-start gap-4 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <QrCode className="size-5" />
          </span>
          <div>
            <h2 className="font-serif text-xl tracking-tight text-foreground">Pharmacy verification</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Show this prescription at any verified pharmacy. They will scan the QR to confirm authenticity.
            </p>
          </div>
        </div>
        <PrescriptionQR url={verifyUrl} />
      </section>
    </div>
  )
}
