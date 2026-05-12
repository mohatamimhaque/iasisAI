import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export const metadata = { title: "Reports" }

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

export default async function AdminReportsPage() {
  const supabase = await adminGuard()

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const [{ count: newUsers }, { count: newTriage }, { count: newRx }, { count: newLabs }, { count: newAppts }] =
    await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", since),
      supabase.from("triage_sessions").select("id", { count: "exact", head: true }).gte("created_at", since),
      supabase.from("prescriptions").select("id", { count: "exact", head: true }).gte("created_at", since),
      supabase.from("lab_reports").select("id", { count: "exact", head: true }).gte("created_at", since),
      supabase.from("appointments").select("id", { count: "exact", head: true }).gte("created_at", since),
    ])

  const rows = [
    { label: "New signups (7d)", value: newUsers ?? 0 },
    { label: "Triage sessions (7d)", value: newTriage ?? 0 },
    { label: "Prescriptions (7d)", value: newRx ?? 0 },
    { label: "Lab reports (7d)", value: newLabs ?? 0 },
    { label: "Appointments (7d)", value: newAppts ?? 0 },
  ]

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <header>
        <p className="text-sm uppercase tracking-wider text-primary">Reports</p>
        <h1 className="mt-1 font-serif text-4xl tracking-tight text-foreground">Weekly report</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Rolling 7-day platform activity. Detailed exports (CSV / PDF) coming soon.
        </p>
      </header>

      <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Metric</th>
              <th className="px-4 py-3 text-right">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => (
              <tr key={r.label}>
                <td className="px-4 py-3 text-foreground">{r.label}</td>
                <td className="px-4 py-3 text-right font-mono text-foreground">{r.value.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
