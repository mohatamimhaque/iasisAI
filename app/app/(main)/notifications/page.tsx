import { redirect } from "next/navigation"
import { Bell, BellRing, Brain, Calendar, FlaskConical, Pill } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export const metadata = { title: "Notifications" }

type Item = {
  id: string
  icon: typeof Bell
  title: string
  body: string
  time: string
}

function relative(date: string | null | undefined) {
  if (!date) return ""
  const d = new Date(date)
  const diff = Date.now() - d.getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return "Just now"
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 30) return `${day}d ago`
  return d.toLocaleDateString()
}

export default async function NotificationsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const [{ data: triage }, { data: rx }, { data: labs }, { data: appts }] = await Promise.all([
    supabase
      .from("triage_sessions")
      .select("id, urgency, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("prescriptions")
      .select("id, diagnosis, signed_at")
      .eq("patient_id", user.id)
      .order("signed_at", { ascending: false })
      .limit(5),
    supabase
      .from("lab_reports")
      .select("id, title, reported_at")
      .eq("patient_id", user.id)
      .order("reported_at", { ascending: false })
      .limit(5),
    supabase
      .from("appointments")
      .select("id, scheduled_at, reason, status")
      .eq("patient_id", user.id)
      .order("scheduled_at", { ascending: false })
      .limit(5),
  ])

  const items: Item[] = [
    ...(triage ?? []).map((t) => ({
      id: `triage-${t.id}`,
      icon: Brain,
      title: `AI triage completed — ${t.urgency ?? "result"}`,
      body: "View your AI triage result and recommended next steps.",
      time: relative(t.created_at),
    })),
    ...(rx ?? []).map((r) => ({
      id: `rx-${r.id}`,
      icon: Pill,
      title: "New prescription signed",
      body: r.diagnosis ?? "A doctor has issued a digital prescription for you.",
      time: relative(r.signed_at),
    })),
    ...(labs ?? []).map((l) => ({
      id: `lab-${l.id}`,
      icon: FlaskConical,
      title: `Lab report ready — ${l.title}`,
      body: "Your lab report is uploaded with an AI summary.",
      time: relative(l.reported_at),
    })),
    ...(appts ?? []).map((a) => ({
      id: `appt-${a.id}`,
      icon: Calendar,
      title: `Appointment ${a.status}`,
      body: a.reason ?? "Scheduled consultation",
      time: relative(a.scheduled_at),
    })),
  ].slice(0, 30)

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <header>
        <p className="text-sm uppercase tracking-wider text-primary">Inbox</p>
        <h1 className="mt-1 font-serif text-4xl tracking-tight text-foreground">Notifications</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Health updates from across your account — appointments, prescriptions, lab reports, and AI sessions.
        </p>
      </header>

      <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <BellRing className="size-7 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No notifications yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((it) => (
              <li key={it.id} className="flex items-start gap-4 px-5 py-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <it.icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{it.title}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{it.body}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{it.time}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
