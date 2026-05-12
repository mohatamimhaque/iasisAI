import Link from "next/link"
import { redirect } from "next/navigation"
import { FlaskConical, Upload } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Diagnostic lab overview",
}

export default async function ClinicOverview() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: clinic } = await supabase.from("clinics").select("name").eq("id", user.id).maybeSingle()

  const [{ count: totalReports }, { data: recent }] = await Promise.all([
    supabase
      .from("lab_reports")
      .select("id", { count: "exact", head: true })
      .eq("clinic_id", user.id),
    supabase
      .from("lab_reports")
      .select("id, title, report_type, reported_at")
      .eq("clinic_id", user.id)
      .order("reported_at", { ascending: false })
      .limit(5),
  ])

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wider text-primary">Diagnostic lab</p>
          <h1 className="mt-1 font-serif text-4xl tracking-tight text-foreground">
            {clinic?.name ?? "Welcome"}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Upload patient lab reports — Iasis AI analyses each report and shares a structured summary with the
            patient and their doctor.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/clinic/upload">
            <Upload className="size-4" />
            Upload a report
          </Link>
        </Button>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Reports uploaded</p>
          <p className="mt-2 font-serif text-3xl text-foreground">{totalReports ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">AI analyses delivered</p>
          <p className="mt-2 font-serif text-3xl text-foreground">{totalReports ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Patient ID lookups</p>
          <p className="mt-2 font-serif text-3xl text-foreground">{totalReports ?? 0}</p>
        </div>
      </div>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl text-foreground">Recent uploads</h2>
          <Link href="/clinic/reports" className="text-sm text-primary underline-offset-4 hover:underline">
            View all
          </Link>
        </div>
        {recent && recent.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {recent.map((r) => (
              <li key={r.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{r.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {r.report_type} ·{" "}
                      {new Date(r.reported_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    <FlaskConical className="size-3" />
                    Synced
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-border bg-muted/30 p-10 text-center">
            <p className="text-sm text-muted-foreground">
              No reports uploaded yet. Use the button above to upload your first lab result.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
