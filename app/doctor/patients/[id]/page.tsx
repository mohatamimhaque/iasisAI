import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft, FileText, FlaskConical, Pill } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"

export const metadata = { title: "Patient" }

export default async function DoctorPatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Doctor sees a patient only if they have an appointment/prescription with them (RLS-protected).
  const { data: appts } = await supabase
    .from("appointments")
    .select("id, scheduled_at, reason, status, consultation_type")
    .eq("doctor_id", user.id)
    .eq("patient_id", id)
    .order("scheduled_at", { ascending: false })

  const { data: rx } = await supabase
    .from("prescriptions")
    .select("id, diagnosis, status, signed_at")
    .eq("doctor_id", user.id)
    .eq("patient_id", id)
    .order("signed_at", { ascending: false })

  if ((!appts || appts.length === 0) && (!rx || rx.length === 0)) notFound()

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, blood_group, date_of_birth, gender")
    .eq("id", id)
    .maybeSingle()

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <Link
        href="/doctor/patients"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to patients
      </Link>

      <header className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wider text-primary">Patient</p>
          <h1 className="mt-1 font-serif text-4xl tracking-tight text-foreground">
            {profile?.full_name ?? "Patient record"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {[profile?.gender, profile?.blood_group, profile?.date_of_birth].filter(Boolean).join(" · ") || "No demographic data shared"}
          </p>
        </div>
        <Button asChild>
          <Link href={`/doctor/prescriptions/new?patient=${id}`}>
            <Pill className="size-4" />
            Write prescription
          </Link>
        </Button>
      </header>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-border bg-card p-6">
          <h2 className="flex items-center gap-2 font-serif text-xl tracking-tight text-foreground">
            <FileText className="size-4 text-primary" />
            Appointments with you
          </h2>
          {!appts || appts.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No appointments yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {appts.map((a) => (
                <li key={a.id} className="flex items-start justify-between gap-3 py-3 text-sm">
                  <div>
                    <p className="text-foreground">{new Date(a.scheduled_at).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.consultation_type === "telemedicine" ? "Telemedicine" : "In-person"} · {a.reason ?? "—"}
                    </p>
                  </div>
                  <span className="text-xs uppercase tracking-wider text-primary">{a.status}</span>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="rounded-2xl border border-border bg-card p-6">
          <h2 className="flex items-center gap-2 font-serif text-xl tracking-tight text-foreground">
            <Pill className="size-4 text-primary" />
            Prescriptions you wrote
          </h2>
          {!rx || rx.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No prescriptions yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {rx.map((r) => (
                <li key={r.id} className="flex items-start justify-between gap-3 py-3 text-sm">
                  <div>
                    <p className="text-foreground">{r.diagnosis ?? "Prescription"}</p>
                    <p className="text-xs text-muted-foreground">{new Date(r.signed_at).toLocaleDateString()}</p>
                  </div>
                  <span className="text-xs uppercase tracking-wider text-primary">{r.status}</span>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      <section className="mt-8 rounded-2xl border border-border bg-muted/30 p-5 text-sm leading-relaxed text-muted-foreground">
        <FlaskConical className="mb-2 size-4 text-primary" />
        Lab reports for this patient appear here when they grant consent. Iasis uses a consent-based sharing model — you
        only see what the patient explicitly shares.
      </section>
    </div>
  )
}
