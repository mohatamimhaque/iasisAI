import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowUpRight, HeartPulse, LifeBuoy, Phone } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { MoodCheckin } from "@/components/mental-health/mood-checkin"
import { MOOD_OPTIONS } from "@/lib/mental-health"

export const metadata = {
  title: "Mental health",
}

export default async function MentalHealthPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: sessions } = await supabase
    .from("mental_health_sessions")
    .select("id, kind, score, severity, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20)

  const list = sessions ?? []
  const moodMap = new Map(MOOD_OPTIONS.map((m) => [m.value, m]))

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <header>
        <p className="text-sm uppercase tracking-wider text-primary">Mental health</p>
        <h1 className="mt-1 font-serif text-4xl tracking-tight text-foreground">A calm place to check in</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Mood tracking, validated screening tools, and crisis resources — all private and encrypted.
        </p>
      </header>

      <div className="mt-8 space-y-6">
        <MoodCheckin />

        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/app/mental-health/phq9"
            className="group flex items-start justify-between gap-3 rounded-2xl border border-border bg-card p-5 transition-colors hover:bg-secondary/40"
          >
            <div>
              <p className="text-xs uppercase tracking-wider text-primary">Depression screen</p>
              <h3 className="mt-1 font-serif text-lg text-foreground">PHQ-9</h3>
              <p className="mt-1 text-sm text-muted-foreground">9 questions · validated by WHO</p>
            </div>
            <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/app/mental-health/gad7"
            className="group flex items-start justify-between gap-3 rounded-2xl border border-border bg-card p-5 transition-colors hover:bg-secondary/40"
          >
            <div>
              <p className="text-xs uppercase tracking-wider text-primary">Anxiety screen</p>
              <h3 className="mt-1 font-serif text-lg text-foreground">GAD-7</h3>
              <p className="mt-1 text-sm text-muted-foreground">7 questions · validated by WHO</p>
            </div>
            <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        <section className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
          <div className="flex items-start gap-3">
            <LifeBuoy className="size-5 shrink-0 text-destructive" />
            <div>
              <h2 className="font-serif text-lg text-foreground">In crisis? You&apos;re not alone.</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                If you are in immediate danger, please reach out right now.
              </p>
              <ul className="mt-3 space-y-1.5 text-sm">
                <li className="flex items-center gap-2">
                  <Phone className="size-3.5 text-destructive" />
                  <span className="font-medium text-foreground">National Mental Health Helpline:</span>
                  <span>09611 677 777</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="size-3.5 text-destructive" />
                  <span className="font-medium text-foreground">Kaan Pete Roi (BD):</span>
                  <span>9612 119 911</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-serif text-xl text-foreground">Your timeline</h2>
          {list.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {list.map((s) => {
                const isMood = s.kind === "mood"
                const moodMeta = isMood && s.score ? moodMap.get(s.score) : null
                return (
                  <li key={s.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3">
                    <div className="min-w-0 flex items-center gap-3">
                      {moodMeta ? (
                        <span className="text-2xl" aria-hidden>
                          {moodMeta.emoji}
                        </span>
                      ) : (
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <HeartPulse className="size-4" />
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {isMood ? `Mood: ${moodMeta?.label ?? "Logged"}` : s.kind.toUpperCase()}
                          {!isMood && s.severity ? ` — ${s.severity}` : ""}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(s.created_at).toLocaleString("en-GB", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {!isMood && s.score != null ? ` · score ${s.score}` : ""}
                        </p>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-border bg-muted/30 p-10 text-center">
              <p className="text-sm text-muted-foreground">No check-ins yet — start with a mood log above.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
