import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { AlertTriangle, ArrowLeft, FlaskConical, Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: "Lab report",
}

type FlaggedValue = { name: string; value: string; reference?: string; flag?: "high" | "low" | "abnormal" }

export default async function LabReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: report } = await supabase
    .from("lab_reports")
    .select("id, title, report_type, file_url, ai_summary, flagged_values, reported_at")
    .eq("id", id)
    .eq("patient_id", user.id)
    .single()
  if (!report) notFound()

  const flagged = (report.flagged_values ?? []) as FlaggedValue[]

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <Link
        href="/app/lab-reports"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to lab reports
      </Link>

      <header className="mt-6 flex flex-col gap-2">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <FlaskConical className="size-3" />
          {report.report_type}
        </span>
        <h1 className="font-serif text-4xl tracking-tight text-foreground">{report.title}</h1>
        <p className="text-sm text-muted-foreground">
          Reported{" "}
          {new Date(report.reported_at).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      </header>

      {report.ai_summary ? (
        <section className="mt-8 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="size-4" />
            </span>
            <h2 className="font-serif text-2xl tracking-tight text-foreground">AI summary</h2>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-foreground">{report.ai_summary}</p>
        </section>
      ) : null}

      {flagged.length > 0 ? (
        <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-900">
              <AlertTriangle className="size-4" />
            </span>
            <h2 className="font-serif text-2xl tracking-tight text-amber-950">Flagged values</h2>
          </div>
          <ul className="mt-4 divide-y divide-amber-200 overflow-hidden rounded-xl border border-amber-200 bg-white">
            {flagged.map((f, idx) => (
              <li key={idx} className="flex items-center justify-between gap-4 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{f.name}</p>
                  {f.reference ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">Normal range: {f.reference}</p>
                  ) : null}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-amber-900">{f.value}</p>
                  {f.flag ? (
                    <p className="mt-0.5 text-xs uppercase tracking-wider text-amber-800">{f.flag}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {report.file_url ? (
        <section className="mt-6 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-serif text-xl tracking-tight text-foreground">Original report</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            View the full report PDF as uploaded by the clinic.
          </p>
          <a
            href={report.file_url}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            Open PDF
          </a>
        </section>
      ) : null}
    </div>
  )
}
