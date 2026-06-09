import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowRight, FileText, FlaskConical, HeartPulse, Pill, ShieldCheck } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export const metadata = { title: "Medical records" }

export default async function RecordsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const [{ data: profile }, { data: hr }, { count: rxCount }, { count: labCount }] = await Promise.all([
    supabase.from("profiles").select("full_name, blood_group, date_of_birth, gender, division").eq("id", user.id).single(),
    supabase.from("health_records").select("chronic_conditions, allergies, current_medications").eq("user_id", user.id).maybeSingle(),
    supabase.from("prescriptions").select("id", { count: "exact", head: true }).eq("patient_id", user.id),
    supabase.from("lab_reports").select("id", { count: "exact", head: true }).eq("patient_id", user.id),
  ])

  const conditions: string[] = hr?.chronic_conditions ?? []
  const allergies: string[] = hr?.allergies ?? []
  const meds = (hr?.current_medications as { name?: string; dose?: string }[] | null) ?? []

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <header>
        <p className="text-sm uppercase tracking-wider text-primary">Your record</p>
        <h1 className="mt-1 font-serif text-4xl tracking-tight text-foreground">Medical records</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          One source of truth for your health — accessible to you, sharable with verified doctors with your consent,
          encrypted at rest and in transit.
        </p>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Pill className="size-3.5" /> Prescriptions
          </div>
          <p className="mt-2 font-serif text-3xl tracking-tight text-foreground">{rxCount ?? 0}</p>
          <Link href="/app/prescriptions" className="mt-3 inline-flex items-center gap-1 text-xs text-primary">
            View all <ArrowRight className="size-3" />
          </Link>
        </article>
        <article className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FlaskConical className="size-3.5" /> Lab reports
          </div>
          <p className="mt-2 font-serif text-3xl tracking-tight text-foreground">{labCount ?? 0}</p>
          <Link href="/app/lab-reports" className="mt-3 inline-flex items-center gap-1 text-xs text-primary">
            View all <ArrowRight className="size-3" />
          </Link>
        </article>
        <article className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <HeartPulse className="size-3.5" /> Conditions
          </div>
          <p className="mt-2 font-serif text-3xl tracking-tight text-foreground">{conditions.length}</p>
          <Link href="/app/settings" className="mt-3 inline-flex items-center gap-1 text-xs text-primary">
            Edit health profile <ArrowRight className="size-3" />
          </Link>
        </article>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-border bg-card p-6">
          <h2 className="flex items-center gap-2 font-serif text-xl tracking-tight text-foreground">
            <FileText className="size-4 text-primary" /> Health summary
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Name</dt>
              <dd className="text-foreground">{profile?.full_name ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Date of birth</dt>
              <dd className="text-foreground">{profile?.date_of_birth ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Gender</dt>
              <dd className="text-foreground capitalize">{profile?.gender ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Blood group</dt>
              <dd className="text-foreground">{profile?.blood_group ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Division</dt>
              <dd className="text-foreground">{profile?.division ?? "—"}</dd>
            </div>
          </dl>
        </article>

        <article className="rounded-2xl border border-border bg-card p-6">
          <h2 className="flex items-center gap-2 font-serif text-xl tracking-tight text-foreground">
            <HeartPulse className="size-4 text-primary" /> Conditions & allergies
          </h2>
          <div className="mt-4 space-y-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Chronic conditions</p>
              <p className="mt-1 text-foreground">{conditions.length ? conditions.join(", ") : "None reported"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Allergies</p>
              <p className="mt-1 text-foreground">{allergies.length ? allergies.join(", ") : "None reported"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Current medications</p>
              <p className="mt-1 text-foreground">{meds.length ? meds.map((m) => `${m.name ?? ""}${m.dose ? " (" + m.dose + ")" : ""}`).join(", ") : "None reported"}</p>
            </div>
          </div>
        </article>
      </section>

      <section className="mt-10 flex items-start gap-3 rounded-2xl border border-border bg-muted/30 p-5">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
        <div className="text-sm leading-relaxed text-muted-foreground">
          Your records are encrypted at rest and in transit. We never share data with third parties without your
          explicit consent. You can export or delete your record at any time from{" "}
          <Link href="/app/settings" className="text-foreground underline-offset-4 hover:underline">
            Settings
          </Link>
          .
        </div>
      </section>
    </div>
  )
}
