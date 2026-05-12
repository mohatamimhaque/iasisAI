import { redirect } from "next/navigation"
import { CalendarClock } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: "Appointments",
}

export default async function DoctorAppointmentsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: appts } = await supabase
    .from("appointments")
    .select("id, scheduled_at, reason, status, consultation_type")
    .eq("doctor_id", user.id)
    .order("scheduled_at", { ascending: true })

  const list = appts ?? []

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <header>
        <p className="text-sm uppercase tracking-wider text-primary">Doctor portal</p>
        <h1 className="mt-1 font-serif text-4xl tracking-tight text-foreground">Appointments</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Every consultation booked with you — past, present and future.
        </p>
      </header>

      {list.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-muted/30 p-10 text-center">
          <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CalendarClock className="size-5" />
          </span>
          <h2 className="mt-4 font-serif text-2xl text-foreground">No appointments yet</h2>
          <p className="mx-auto mt-2 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
            Patients booked with you will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full">
            <thead className="border-b border-border bg-muted/30">
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3 font-medium">When</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Reason</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {list.map((a) => (
                <tr key={a.id}>
                  <td className="px-6 py-4 text-foreground">
                    {new Date(a.scheduled_at).toLocaleString("en-GB", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-6 py-4 capitalize text-muted-foreground">{a.consultation_type.replace("_", " ")}</td>
                  <td className="px-6 py-4 text-muted-foreground">{a.reason ?? "—"}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
