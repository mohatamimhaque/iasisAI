import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowUpRight, Brain, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { UrgencyPill } from "@/components/triage/urgency-pill"

export const metadata = {
  title: "AI Triage",
}

function relTime(d: string) {
  const diffMs = Date.now() - new Date(d).getTime()
  const min = Math.floor(diffMs / 60000)
  if (min < 1) return "just now"
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 30) return `${day}d ago`
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

export default async function TriageListPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: sessions } = await supabase
    .from("triage_sessions")
    .select("id, symptoms, urgency, created_at, result")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  type Session = NonNullable<typeof sessions>[number]
  const list: Session[] = sessions ?? []

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wider text-primary">AI Triage</p>
          <h1 className="mt-1 text-balance font-serif text-4xl tracking-tight text-foreground">Your symptom checks</h1>
          <p className="mt-2 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
            Describe how you feel and Iasis AI will guide you to the right next step. Every session is saved to your
            private timeline.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/app/triage/new">
            <Plus className="size-4" />
            New triage
          </Link>
        </Button>
      </header>

      {list.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-muted/30 p-10 text-center">
          <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Brain className="size-5" />
          </span>
          <h2 className="mt-4 font-serif text-2xl text-foreground">Start your first triage</h2>
          <p className="mx-auto mt-2 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
            It takes about a minute. Iasis will ask the right follow-ups and recommend a specialist or test.
          </p>
          <Button asChild className="mt-6">
            <Link href="/app/triage/new">
              Start triage
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {list.map((s) => {
            const result = (s.result ?? {}) as { recommended_specialist?: string; possible_conditions?: { name: string }[] }
            const condition = result.possible_conditions?.[0]?.name
            return (
              <li key={s.id}>
                <Link
                  href={`/app/triage/${s.id}`}
                  className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:bg-secondary/40"
                >
                  <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Brain className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {s.urgency ? <UrgencyPill urgency={s.urgency as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"} /> : null}
                      {condition ? (
                        <span className="text-sm text-muted-foreground">Likely: {condition}</span>
                      ) : null}
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-foreground">{s.symptoms}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{relTime(s.created_at)}</p>
                  </div>
                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
