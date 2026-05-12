import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { AlertTriangle, ArrowLeft, ArrowUpRight, Calendar, FlaskConical, ShieldCheck, Stethoscope } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { UrgencyPill } from "@/components/triage/urgency-pill"
import { URGENCY_LABEL, type TriageResult } from "@/lib/ai/triage"

export const metadata = {
  title: "Triage result",
}

export default async function TriageResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: session } = await supabase
    .from("triage_sessions")
    .select("id, symptoms, duration, severity, result, urgency, created_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!session?.result) notFound()
  const result = session.result as TriageResult
  const urgency = (session.urgency ?? result.urgency) as TriageResult["urgency"]

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <Link
        href="/app/triage"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to triage
      </Link>

      <header className="mt-6 flex flex-col gap-3">
        <UrgencyPill urgency={urgency} className="self-start" />
        <h1 className="text-balance font-serif text-4xl tracking-tight text-foreground">
          {URGENCY_LABEL[urgency]}
        </h1>
        <p className="max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground">
          {result.recommended_action}
        </p>
      </header>

      {urgency === "CRITICAL" ? (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-300 bg-rose-50 p-5 text-rose-900">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-medium">This may be a medical emergency.</p>
            <p className="mt-1 text-sm leading-relaxed">
              Call <strong>999</strong> or go to the nearest hospital emergency department now. Do not wait.
            </p>
          </div>
        </div>
      ) : null}

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Possible conditions */}
        <section className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
          <h2 className="font-serif text-2xl tracking-tight text-foreground">Possible conditions</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            What your symptoms could indicate. Listed in order of likelihood.
          </p>
          <ul className="mt-5 space-y-3">
            {result.possible_conditions.map((c) => (
              <li key={c.name} className="rounded-xl border border-border bg-background p-4">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-base font-medium text-foreground">{c.name}</h3>
                  <span className="text-xs font-medium text-primary">
                    {Math.round(c.probability * 100)}% likely
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${Math.round(c.probability * 100)}%` }}
                  />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.explanation}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          <section className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Stethoscope className="size-4" />
              </span>
              <h2 className="font-serif text-xl tracking-tight text-foreground">Specialist</h2>
            </div>
            <p className="mt-3 text-base text-foreground">{result.recommended_specialist}</p>
            <Button asChild variant="outline" className="mt-4 w-full">
              <Link href="/app/appointments">
                Book appointment
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FlaskConical className="size-4" />
              </span>
              <h2 className="font-serif text-xl tracking-tight text-foreground">Recommended tests</h2>
            </div>
            {result.recommended_tests.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No tests required at this stage.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {result.recommended_tests.map((t) => (
                  <li key={t} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="mt-1.5 inline-block size-1 shrink-0 rounded-full bg-primary" />
                    {t}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      {/* Red flags */}
      {result.red_flags.length > 0 ? (
        <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-900">
              <AlertTriangle className="size-4" />
            </span>
            <h2 className="font-serif text-xl tracking-tight text-amber-950">Go to a hospital immediately if&hellip;</h2>
          </div>
          <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {result.red_flags.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-amber-950">
                <span className="mt-1.5 inline-block size-1 shrink-0 rounded-full bg-amber-700" />
                {f}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* What you reported */}
      <section className="mt-6 rounded-2xl border border-border bg-muted/30 p-6">
        <h2 className="font-serif text-xl tracking-tight text-foreground">What you reported</h2>
        <dl className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">Duration</dt>
            <dd className="mt-1 text-foreground">{session.duration ?? "Not specified"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">Severity</dt>
            <dd className="mt-1 text-foreground">{session.severity ?? "Not specified"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">Recorded</dt>
            <dd className="mt-1 text-foreground">
              {new Date(session.created_at).toLocaleString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </dd>
          </div>
        </dl>
        <div className="mt-4 rounded-lg border border-border bg-background p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Symptoms in your words</p>
          <p className="mt-2 text-sm leading-relaxed text-foreground">{session.symptoms}</p>
        </div>
      </section>

      <footer className="mt-8 flex items-start gap-3 rounded-2xl border border-border bg-card p-5 text-sm leading-relaxed text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
        <p>{result.disclaimer}</p>
      </footer>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button asChild variant="outline">
          <Link href="/app/triage/new">Run another triage</Link>
        </Button>
        <Button asChild>
          <Link href="/app/appointments">
            <Calendar className="size-4" />
            Book a consultation
          </Link>
        </Button>
      </div>
    </div>
  )
}
