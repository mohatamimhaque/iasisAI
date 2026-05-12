import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowUpRight, FlaskConical } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: "Lab reports",
}

export default async function LabReportsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: reports } = await supabase
    .from("lab_reports")
    .select("id, title, report_type, ai_summary, reported_at")
    .eq("patient_id", user.id)
    .order("reported_at", { ascending: false })

  const list = reports ?? []

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <header>
        <p className="text-sm uppercase tracking-wider text-primary">Lab Reports</p>
        <h1 className="mt-1 font-serif text-4xl tracking-tight text-foreground">All your test results</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Every report uploaded by an Iasis-partner clinic. Iasis AI highlights flagged values for you and your doctor.
        </p>
      </header>

      {list.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-muted/30 p-10 text-center">
          <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FlaskConical className="size-5" />
          </span>
          <h2 className="mt-4 font-serif text-2xl text-foreground">No lab reports yet</h2>
          <p className="mx-auto mt-2 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
            When a partner clinic uploads a report for you, it will appear here with an AI-generated summary.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {list.map((r) => (
            <li key={r.id}>
              <Link
                href={`/app/lab-reports/${r.id}`}
                className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:bg-secondary/40"
              >
                <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FlaskConical className="size-4" />
                </span>
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
                  ) : null}
                </div>
                <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
