import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft, Calendar, Pill, User, Video } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"

export const metadata = { title: "Consultation" }

export default async function DoctorAppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: appt } = await supabase
    .from("appointments")
    .select("id, scheduled_at, reason, status, consultation_type, notes, patient_id")
    .eq("id", id)
    .eq("doctor_id", user.id)
    .maybeSingle()

  if (!appt) notFound()

  const { data: patient } = await supabase
    .from("profiles")
    .select("full_name, blood_group, gender, date_of_birth")
    .eq("id", appt.patient_id)
    .maybeSingle()

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <Link
        href="/doctor/appointments"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to appointments
      </Link>

      <header className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wider text-primary">Consultation</p>
          <h1 className="mt-1 font-serif text-4xl tracking-tight text-foreground">
            {patient?.full_name ?? "Patient"}
          </h1>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="size-3.5" />
            {new Date(appt.scheduled_at).toLocaleString()}
          </p>
        </div>
        <span className="self-start rounded-full bg-primary/10 px-3 py-1 text-xs uppercase tracking-wider text-primary">
          {appt.status}
        </span>
      </header>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <article className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
          <h2 className="font-serif text-xl tracking-tight text-foreground">Visit details</h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">Type</dt>
              <dd className="text-foreground capitalize">{appt.consultation_type.replace("_", " ")}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Reason</dt>
              <dd className="text-foreground">{appt.reason ?? "Not provided"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-muted-foreground">Patient notes</dt>
              <dd className="mt-1 whitespace-pre-wrap text-foreground">{appt.notes ?? "No notes"}</dd>
            </div>
          </dl>
        </article>

        <article className="rounded-2xl border border-border bg-card p-6">
          <h2 className="flex items-center gap-2 font-serif text-xl tracking-tight text-foreground">
            <User className="size-4 text-primary" />
            About the patient
          </h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Gender</dt>
              <dd className="text-foreground capitalize">{patient?.gender ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">DOB</dt>
              <dd className="text-foreground">{patient?.date_of_birth ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Blood</dt>
              <dd className="text-foreground">{patient?.blood_group ?? "—"}</dd>
            </div>
          </dl>
          <Button asChild variant="outline" className="mt-5 w-full">
            <Link href={`/doctor/patients/${appt.patient_id}`}>View full record</Link>
          </Button>
        </article>
      </section>

      <section className="mt-8 flex flex-col gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Video className="size-5" />
          </div>
          <div>
            <p className="font-serif text-lg tracking-tight text-foreground">Start video consultation</p>
            <p className="text-sm text-muted-foreground">
              Video consultations launch with Daily.co integration. Audio fallback for low-bandwidth available at launch.
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/doctor/consult/video">
            <Video className="size-4" />
            Open call (Coming soon)
          </Link>
        </Button>
      </section>

      <section className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button asChild variant="outline">
          <Link href={`/doctor/prescriptions/new?patient=${appt.patient_id}&appointment=${appt.id}`}>
            <Pill className="size-4" />
            Write prescription
          </Link>
        </Button>
      </section>
    </div>
  )
}
