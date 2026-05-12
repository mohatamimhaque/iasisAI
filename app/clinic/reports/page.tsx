import { redirect } from "next/navigation"
import Link from "next/link"
import { FlaskConical, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Clinic reports",
}

export default async function ClinicReportsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: reports } = await supabase
    .from("lab_reports")
    .select("id, title, report_type, ai_summary, reported_at, patient_id")
    .eq("clinic_id", user.id)
    .order("reported_at", { ascending: false })

  const list = reports ?? []

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wider text-primary">Diagnostic lab</p>
          <h1 className="mt-1 font-serif text-4xl tracking-tight text-foreground">Reports you uploaded</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Reports are immutable once submitted and visible to the patient and their treating doctor.
          </p>
        </div>
        <Button asChild>
          <Link href="/clinic/upload">
            <Plus className="size-4" />
            New report
          </Link>
        </Button>
      </header>

      {list.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-muted/30 p-10 text-center">
          <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FlaskConical className="size-5" />
          </span>
          <h2 className="mt-4 font-serif text-2xl text-foreground">No reports uploaded yet</h2>
          <p className="mx-auto mt-2 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
            Use the button above to upload your first lab result. Iasis AI generates an instant summary.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {list.map((r) => (
            <li key={r.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                      {r.report_type}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(r.reported_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <h3 className="mt-2 line-clamp-1 text-base font-medium text-foreground">{r.title}</h3>
                  {r.ai_summary ? (
                    <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{r.ai_summary}</p>
                  ) : (
                    <p className="mt-1 text-xs italic text-muted-foreground">AI analysis pending</p>
                  )}
                  <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                    Patient: {r.patient_id.slice(0, 13)}…
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
