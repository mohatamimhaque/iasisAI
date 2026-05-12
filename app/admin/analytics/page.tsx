import { redirect } from "next/navigation"
import { Activity, Brain, Building2, FlaskConical, Pill, Users } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export const metadata = { title: "Analytics" }

async function adminGuard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") redirect("/app")
  return supabase
}

export default async function AdminAnalyticsPage() {
  const supabase = await adminGuard()

  const tables = [
    { table: "profiles", label: "Total users", icon: Users },
    { table: "doctors", label: "Verified doctors", icon: Activity },
    { table: "clinics", label: "Clinics", icon: Building2 },
    { table: "triage_sessions", label: "Triage sessions", icon: Brain },
    { table: "prescriptions", label: "Prescriptions", icon: Pill },
    { table: "lab_reports", label: "Lab reports", icon: FlaskConical },
  ] as const

  const counts = await Promise.all(
    tables.map(async (t) => {
      const { count } = await supabase.from(t.table).select("id", { count: "exact", head: true })
      return { ...t, count: count ?? 0 }
    }),
  )

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <header>
        <p className="text-sm uppercase tracking-wider text-primary">Analytics</p>
        <h1 className="mt-1 font-serif text-4xl tracking-tight text-foreground">Platform analytics</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Real-time platform telemetry across users, providers, and AI activity.
        </p>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {counts.map((c) => (
          <article key={c.table} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</span>
              <c.icon className="size-4 text-primary" />
            </div>
            <p className="mt-3 font-serif text-4xl tracking-tight text-foreground">{c.count.toLocaleString()}</p>
          </article>
        ))}
      </section>

      <section className="mt-12 rounded-2xl border border-dashed border-border bg-muted/20 p-6 text-sm leading-relaxed text-muted-foreground">
        Trend charts (DAU, MAU, consultation volume, revenue split by payment method) launch with the v1.1 analytics
        release. The collection pipeline is live — historical data is being aggregated.
      </section>
    </div>
  )
}
