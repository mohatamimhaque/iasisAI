import { redirect } from "next/navigation"
import Link from "next/link"
import { Calendar, Plus, Video, MapPin } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Appointments",
}

const STATUS_STYLES: Record<string, string> = {
  scheduled: "bg-primary/10 text-primary",
  completed: "bg-secondary text-secondary-foreground",
  cancelled: "bg-muted text-muted-foreground",
  no_show: "bg-destructive/10 text-destructive",
}

export default async function AppointmentsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: rows } = await supabase
    .from("appointments")
    .select("id, scheduled_at, reason, status, consultation_type, doctor_id")
    .eq("patient_id", user.id)
    .order("scheduled_at", { ascending: false })

  const list = rows ?? []
  const doctorIds = Array.from(new Set(list.map((a) => a.doctor_id).filter(Boolean) as string[]))
  let doctorsById: Record<string, { full_name: string; specialty: string }> = {}
  if (doctorIds.length > 0) {
    const { data: docs } = await supabase
      .from("doctors")
      .select("id, full_name, specialty")
      .in("id", doctorIds)
    doctorsById = Object.fromEntries(
      (docs ?? []).map((d) => [d.id, { full_name: d.full_name, specialty: d.specialty }]),
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wider text-primary">Care</p>
          <h1 className="mt-1 font-serif text-4xl tracking-tight text-foreground">Appointments</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Telemedicine and in-person visits with verified doctors across Bangladesh.
          </p>
        </div>
        <Button asChild>
          <Link href="/app/appointments/new">
            <Plus className="size-4" />
            Book new
          </Link>
        </Button>
      </header>

      {list.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-muted/30 p-10 text-center">
          <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Calendar className="size-5" />
          </span>
          <h2 className="mt-4 font-serif text-2xl text-foreground">No appointments yet</h2>
          <p className="mx-auto mt-2 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
            Book a video consultation with a verified specialist or schedule an in-person visit to a partner clinic.
          </p>
          <div className="mt-6">
            <Button asChild>
              <Link href="/app/appointments/new">Browse doctors</Link>
            </Button>
          </div>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {list.map((a) => {
            const doc = a.doctor_id ? doctorsById[a.doctor_id] : null
            const when = new Date(a.scheduled_at)
            return (
              <li key={a.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <p className="font-serif text-lg text-foreground">{doc?.full_name ?? "Doctor"}</p>
                      <span className="text-xs text-muted-foreground">{doc?.specialty}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{a.reason}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="size-3.5" />
                        {when.toLocaleString("en-GB", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        {a.consultation_type === "telemedicine" ? (
                          <Video className="size-3.5" />
                        ) : (
                          <MapPin className="size-3.5" />
                        )}
                        {a.consultation_type === "telemedicine" ? "Telemedicine" : "In-person"}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                      STATUS_STYLES[a.status] ?? "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {a.status.replace("_", " ")}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
