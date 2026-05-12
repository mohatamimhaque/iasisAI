import Link from "next/link"
import { redirect } from "next/navigation"
import {
  AlertTriangle,
  ArrowUpRight,
  BellRing,
  Brain,
  Calendar,
  FlaskConical,
  HeartPulse,
  MessageCircle,
  Pill,
  Sparkles,
  Users,
} from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { UrgencyPill } from "@/components/triage/urgency-pill"

export const metadata = {
  title: "Home",
}

const QUICK_ACTIONS = [
  {
    href: "/app/triage/new",
    title: "Start AI triage",
    body: "Describe symptoms and get a structured care plan in seconds.",
    icon: Brain,
  },
  {
    href: "/app/chat",
    title: "Ask Iasis AI",
    body: "Private health assistant — explain reports, symptoms, medicines.",
    icon: MessageCircle,
  },
  {
    href: "/app/appointments/new",
    title: "Book an appointment",
    body: "Verified specialists, online or near you.",
    icon: Calendar,
  },
  {
    href: "/app/reminders",
    title: "Medicine reminders",
    body: "Schedule reminders so doses are never missed.",
    icon: BellRing,
  },
  {
    href: "/app/mental-health",
    title: "Mental health",
    body: "Confidential PHQ-9, GAD-7 and AI support.",
    icon: HeartPulse,
  },
  {
    href: "/app/family",
    title: "Manage family",
    body: "Add parents, children or spouse to one account.",
    icon: Users,
  },
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, district, division")
    .eq("id", user.id)
    .single()

  const [
    { count: rxCount },
    { count: labCount },
    { data: nextAppt },
    { data: latestTriage },
    { count: reminderCount },
  ] = await Promise.all([
    supabase
      .from("prescriptions")
      .select("id", { count: "exact", head: true })
      .eq("patient_id", user.id)
      .eq("status", "active"),
    supabase.from("lab_reports").select("id", { count: "exact", head: true }).eq("patient_id", user.id),
    supabase
      .from("appointments")
      .select("id, scheduled_at, reason, consultation_type")
      .eq("patient_id", user.id)
      .gte("scheduled_at", new Date().toISOString())
      .order("scheduled_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("triage_sessions")
      .select("id, urgency, symptoms, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("medicine_reminders")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("active", true),
  ])

  const firstName = profile?.full_name?.split(" ")[0] ?? "there"

  const stats = [
    { label: "Active prescriptions", value: rxCount ?? 0, href: "/app/prescriptions", icon: Pill },
    { label: "Lab reports", value: labCount ?? 0, href: "/app/lab-reports", icon: FlaskConical },
    { label: "Active reminders", value: reminderCount ?? 0, href: "/app/reminders", icon: BellRing },
  ]

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <section className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-wider text-primary">Your health, today</p>
        <h1 className="text-balance font-serif text-4xl tracking-tight text-foreground sm:text-5xl">
          Hello, {firstName}.
        </h1>
        <p className="text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
          {profile?.division
            ? `You're connected to the Iasis network across ${profile.division}. `
            : "You're connected to the Iasis network. "}
          Here&apos;s what&apos;s happening with your care.
        </p>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="group flex items-center justify-between rounded-2xl border border-border bg-card p-5 transition-colors hover:bg-secondary/40"
          >
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
              <p className="mt-2 font-serif text-3xl tracking-tight text-foreground">{s.value}</p>
            </div>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <s.icon className="size-5" />
            </span>
          </Link>
        ))}
      </section>

      {latestTriage ? (
        <section className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <UrgencyPill urgency={latestTriage.urgency} />
                <span className="text-xs uppercase tracking-wider text-muted-foreground">Latest AI triage</span>
              </div>
              <h2 className="mt-3 line-clamp-2 font-serif text-2xl tracking-tight text-foreground">
                {latestTriage.symptoms}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {new Date(latestTriage.created_at).toLocaleString("en-GB", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href={`/app/triage/${latestTriage.id}`}>
                View result
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>
      ) : (
        <section className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="grid grid-cols-1 gap-6 p-6 sm:p-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Sparkles className="size-3" />
                New
              </span>
              <h2 className="mt-3 text-balance font-serif text-2xl tracking-tight text-foreground sm:text-3xl">
                Not sure what&apos;s wrong? Start with AI Triage.
              </h2>
              <p className="mt-2 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
                Describe your symptoms in your own words. Iasis will ask the right follow-up questions and recommend the
                right specialist — in under two minutes.
              </p>
            </div>
            <div className="lg:col-span-4 lg:text-right">
              <Button asChild size="lg">
                <Link href="/app/triage/new">
                  Start triage
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {nextAppt ? (
        <section className="mt-6 flex items-start gap-4 rounded-2xl border border-border bg-card p-6">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Calendar className="size-5" />
          </span>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Next appointment</p>
            <h3 className="mt-1 font-serif text-xl tracking-tight text-foreground">{nextAppt.reason ?? "Consultation"}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {new Date(nextAppt.scheduled_at).toLocaleString("en-GB", {
                weekday: "short",
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              · {nextAppt.consultation_type === "telemedicine" ? "Online" : "In person"}
            </p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/app/appointments">View</Link>
          </Button>
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="font-serif text-2xl tracking-tight text-foreground">Quick actions</h2>
        <ul className="mt-4 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_ACTIONS.map((action) => (
            <li key={action.href}>
              <Link
                href={action.href}
                className="group flex h-full items-start gap-4 bg-card p-5 transition-colors hover:bg-secondary/40"
              >
                <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <action.icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-foreground">{action.title}</h3>
                    <ArrowUpRight className="size-3.5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{action.body}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 flex items-start gap-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-6">
        <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
          <AlertTriangle className="size-5" />
        </span>
        <div className="flex-1">
          <h2 className="font-serif text-xl tracking-tight text-foreground">Emergency? Hold the SOS button.</h2>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
            The red SOS button in the bottom-right corner alerts your emergency contacts with your location. Set them up
            in advance so they&apos;re ready when you need them most.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/app/emergency">Set up</Link>
        </Button>
      </section>
    </div>
  )
}
