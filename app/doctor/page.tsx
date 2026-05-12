import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowUpRight, CalendarClock, FileSignature, Stethoscope, Users } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Doctor overview",
}

function startOfDayISO() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}
function endOfDayISO() {
  const d = new Date()
  d.setHours(23, 59, 59, 999)
  return d.toISOString()
}

export default async function DoctorOverviewPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single()
  const firstName = profile?.full_name?.split(" ")[0] ?? "Doctor"

  const [{ count: todayCount }, { count: rxCount }, { data: nextAppts }, { count: patientCount }] = await Promise.all([
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("doctor_id", user.id)
      .gte("scheduled_at", startOfDayISO())
      .lte("scheduled_at", endOfDayISO()),
    supabase.from("prescriptions").select("id", { count: "exact", head: true }).eq("doctor_id", user.id),
    supabase
      .from("appointments")
      .select("id, scheduled_at, reason, status, consultation_type, patient_id")
      .eq("doctor_id", user.id)
      .gte("scheduled_at", new Date().toISOString())
      .order("scheduled_at", { ascending: true })
      .limit(5),
    supabase
      .from("appointments")
      .select("patient_id", { count: "exact", head: true })
      .eq("doctor_id", user.id),
  ])

  const stats = [
    {
      label: "Today's appointments",
      value: todayCount ?? 0,
      icon: CalendarClock,
      href: "/doctor/appointments",
    },
    {
      label: "Active patients",
      value: patientCount ?? 0,
      icon: Users,
      href: "/doctor/patients",
    },
    {
      label: "Prescriptions written",
      value: rxCount ?? 0,
      icon: FileSignature,
      href: "/doctor/prescriptions",
    },
  ]

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <header className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-wider text-primary">Doctor portal</p>
        <h1 className="text-balance font-serif text-4xl tracking-tight text-foreground sm:text-5xl">
          Good morning, Dr. {firstName}.
        </h1>
        <p className="text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
          Here&apos;s what your day looks like on Iasis.
        </p>
      </header>

      <section className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 transition-colors hover:bg-secondary/40"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <s.icon className="size-4" />
              </span>
              <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </div>
            <div>
              <p className="font-serif text-4xl tracking-tight text-foreground">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          </Link>
        ))}
      </section>

      <section className="mt-10 rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-serif text-2xl tracking-tight text-foreground">Upcoming appointments</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/doctor/appointments">
              View all
              <ArrowUpRight className="size-3.5" />
            </Link>
          </Button>
        </div>
        {(!nextAppts || nextAppts.length === 0) ? (
          <div className="px-6 py-12 text-center">
            <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Stethoscope className="size-5" />
            </span>
            <p className="mt-4 font-serif text-xl text-foreground">No upcoming appointments</p>
            <p className="mx-auto mt-2 max-w-md text-pretty text-sm text-muted-foreground">
              When patients book with you, they will appear here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {nextAppts.map((a) => (
              <li key={a.id} className="flex items-center gap-4 px-6 py-4">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <CalendarClock className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {new Date(a.scheduled_at).toLocaleString("en-GB", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                    {a.consultation_type === "telemedicine" ? "Telemedicine" : "In-person"}
                    {a.reason ? ` · ${a.reason}` : ""}
                  </p>
                </div>
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                  {a.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
