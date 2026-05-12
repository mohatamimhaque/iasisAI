import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { PrescriptionComposeForm } from "@/components/doctor/prescription-compose-form"

export const metadata = {
  title: "Write prescription",
}

export default async function NewPrescriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ patient?: string; appointment?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const params = await searchParams

  // Pull doctor's patient list from past appointments.
  const { data: appts } = await supabase
    .from("appointments")
    .select("patient_id")
    .eq("doctor_id", user.id)

  const uniquePatientIds = Array.from(new Set((appts ?? []).map((a) => a.patient_id))).filter(Boolean)
  let patients: { id: string; full_name: string | null }[] = []
  if (uniquePatientIds.length > 0) {
    const { data: profileRows } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", uniquePatientIds)
    patients = profileRows ?? []
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <Link
        href="/doctor/prescriptions"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to prescriptions
      </Link>

      <header className="mt-6">
        <p className="text-sm uppercase tracking-wider text-primary">Doctor portal</p>
        <h1 className="mt-1 font-serif text-4xl tracking-tight text-foreground">Write a prescription</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Diagnosis, clinical notes, and structured medicine instructions. Signed prescriptions are immutable
          and carry a QR code for pharmacy verification.
        </p>
      </header>

      <div className="mt-8">
        <PrescriptionComposeForm
          patients={patients}
          defaultPatientId={params.patient}
          defaultAppointmentId={params.appointment}
        />
      </div>
    </div>
  )
}
