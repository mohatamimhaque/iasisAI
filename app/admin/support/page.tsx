import { redirect } from "next/navigation"
import { LifeBuoy } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { updateTicketStatus } from "@/app/app/support/actions"

export const metadata = {
  title: "Support tickets",
}

const STATUS_STYLES: Record<string, string> = {
  open: "bg-primary/10 text-primary",
  in_progress: "bg-amber-100 text-amber-900",
  resolved: "bg-emerald-100 text-emerald-900",
  closed: "bg-muted text-muted-foreground",
}

export default async function AdminSupportPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: tickets } = await supabase
    .from("support_tickets")
    .select("id, subject, description, category, status, priority, created_at, user_id")
    .order("status", { ascending: true })
    .order("created_at", { ascending: false })

  const list = tickets ?? []
  const userIds = Array.from(new Set(list.map((t) => t.user_id)))
  const { data: profiles } = userIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", userIds)
    : { data: [] as { id: string; full_name: string | null }[] }
  const nameById = Object.fromEntries((profiles ?? []).map((p) => [p.id, p.full_name]))

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <header>
        <p className="text-sm uppercase tracking-wider text-primary">Super admin</p>
        <h1 className="mt-1 font-serif text-4xl tracking-tight text-foreground">Support tickets</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Every open issue across the platform. Move tickets through their lifecycle as your team responds.
        </p>
      </header>

      {list.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-muted/30 p-10 text-center">
          <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <LifeBuoy className="size-5" />
          </span>
          <p className="mt-4 text-sm text-muted-foreground">No tickets yet.</p>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {list.map((t) => {
            const next = nextStatus(t.status as "open" | "in_progress" | "resolved" | "closed")
            return (
              <li key={t.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <p className="font-medium text-foreground">{t.subject}</p>
                      <span className="text-xs text-muted-foreground">
                        {nameById[t.user_id] ?? t.user_id.slice(0, 8)}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{t.description}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {t.category.replace("_", " ")} · {t.priority} ·{" "}
                      {new Date(t.created_at).toLocaleString("en-GB", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                        STATUS_STYLES[t.status] ?? STATUS_STYLES.closed
                      }`}
                    >
                      {t.status.replace("_", " ")}
                    </span>
                    {next ? (
                      <form action={updateTicketStatus.bind(null, t.id, next)}>
                        <Button type="submit" size="sm" variant="outline">
                          {actionLabel(next)}
                        </Button>
                      </form>
                    ) : null}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function nextStatus(s: "open" | "in_progress" | "resolved" | "closed") {
  if (s === "open") return "in_progress" as const
  if (s === "in_progress") return "resolved" as const
  if (s === "resolved") return "closed" as const
  return null
}

function actionLabel(s: "in_progress" | "resolved" | "closed") {
  if (s === "in_progress") return "Start working"
  if (s === "resolved") return "Mark resolved"
  return "Close"
}
