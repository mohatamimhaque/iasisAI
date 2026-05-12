import Link from "next/link"
import { redirect } from "next/navigation"
import {
  Activity,
  ArrowUpRight,
  Brain,
  Building2,
  FileSignature,
  FlaskConical,
  MessageCircle,
  Stethoscope,
  Users,
} from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: "Admin overview",
}

export default async function AdminOverviewPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const last7 = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()

  // Run counts in parallel. RLS allows admins limited visibility — we treat zero results
  // as an empty state until cross-role admin policies are added.
  const [users, patients, doctors, clinics, triageWeek, chatThreads, prescriptions, labs, aiConfigsResponse] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "patient"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "doctor"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "clinic"),
    supabase
      .from("triage_sessions")
      .select("id", { count: "exact", head: true })
      .gte("created_at", last7),
    supabase.from("chat_threads").select("id", { count: "exact", head: true }),
    supabase.from("prescriptions").select("id", { count: "exact", head: true }),
    supabase.from("lab_reports").select("id", { count: "exact", head: true }),
    supabase
      .from("ai_api_configs")
      .select("module, model")
      .eq("is_active", true),
  ])

  const aiConfigs = Array.isArray(aiConfigsResponse?.data) ? aiConfigsResponse.data : []
  const triageModel = aiConfigs.find((c) => c.module === "triage")?.model ?? "openai/gpt-5-mini"
  const chatModel = aiConfigs.find((c) => c.module === "chat")?.model ?? "openai/gpt-5-mini"

  const stats = [
    { label: "Total users", value: users.count ?? 0, icon: Users, href: "/admin/users" },
    { label: "Patients", value: patients.count ?? 0, icon: Activity, href: "/admin/users" },
    { label: "Doctors", value: doctors.count ?? 0, icon: Stethoscope, href: "/admin/providers" },
    { label: "Clinics / Labs", value: clinics.count ?? 0, icon: Building2, href: "/admin/clinics" },
    {
      label: "AI triages (7d)",
      value: triageWeek.count ?? 0,
      icon: Brain,
      href: "/admin/analytics",
    },
    { label: "Chat threads", value: chatThreads.count ?? 0, icon: MessageCircle, href: "/admin/analytics" },
    { label: "Prescriptions issued", value: prescriptions.count ?? 0, icon: FileSignature, href: "/admin/analytics" },
    { label: "Lab reports uploaded", value: labs.count ?? 0, icon: FlaskConical, href: "/admin/analytics" },
  ]

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <header className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-wider text-primary">Super admin</p>
        <h1 className="text-balance font-serif text-4xl tracking-tight text-foreground sm:text-5xl">
          Platform overview
        </h1>
        <p className="text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
          A live snapshot of the Iasis network. All metrics are anonymised at population level.
        </p>
      </header>

      <section className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="group flex flex-col gap-4 bg-card p-6 transition-colors hover:bg-secondary/40"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <s.icon className="size-4" />
              </span>
              <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </div>
            <div>
              <p className="font-serif text-3xl tracking-tight text-foreground">{s.value.toLocaleString()}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          </Link>
        ))}
      </section>

      <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-serif text-2xl tracking-tight text-foreground">AI module configuration</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Models are configured for four modules: Triage, Health Chat, Report Analysis, and Mental Health. The
            current models used by triage and chat are{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{triageModel}</code> and{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{chatModel}</code>.
          </p>
          <Link
            href="/admin/ai-models"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            Manage AI models
            <ArrowUpRight className="size-3.5" />
          </Link>
        </article>

        <article className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-serif text-2xl tracking-tight text-foreground">Population health</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Anonymised triage volume, urgency distribution, and disease trends, broken down by division and district.
            Designed for DGHS and the Health Ministry.
          </p>
          <Link
            href="/admin/reports"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            View population reports
            <ArrowUpRight className="size-3.5" />
          </Link>
        </article>
      </section>
    </div>
  )
}
