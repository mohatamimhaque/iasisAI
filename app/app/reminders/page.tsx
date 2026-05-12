import { redirect } from "next/navigation"
import { BellRing, Pause, Play, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { AddReminderDialog } from "@/components/reminders/add-reminder-dialog"
import { deleteReminder, toggleReminder } from "@/app/app/reminders/actions"

export const metadata = {
  title: "Medicine reminders",
}

export default async function RemindersPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const [{ data: reminders }, { data: family }] = await Promise.all([
    supabase
      .from("medicine_reminders")
      .select("id, medicine_name, dosage, frequency, times, start_date, end_date, notes, active, family_member_id")
      .eq("user_id", user.id)
      .order("active", { ascending: false })
      .order("medicine_name"),
    supabase.from("family_members").select("id, full_name").eq("user_id", user.id),
  ])

  const familyMap = Object.fromEntries((family ?? []).map((f) => [f.id, f.full_name]))
  const list = reminders ?? []

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wider text-primary">Reminders</p>
          <h1 className="mt-1 font-serif text-4xl tracking-tight text-foreground">Medicine reminders</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Never miss a dose. Reminders fire on your device and across family profiles you manage.
          </p>
        </div>
        <AddReminderDialog familyMembers={family ?? []} />
      </header>

      {list.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-muted/30 p-10 text-center">
          <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BellRing className="size-5" />
          </span>
          <h2 className="mt-4 font-serif text-2xl text-foreground">No reminders yet</h2>
          <p className="mx-auto mt-2 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
            Add your first medicine reminder above. Reminders carry across the Iasis app on every device you sign in.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {list.map((r) => (
            <li
              key={r.id}
              className={`rounded-2xl border border-border bg-card p-5 ${r.active ? "" : "opacity-60"}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <p className="font-serif text-lg text-foreground">{r.medicine_name}</p>
                    {r.dosage ? <span className="text-sm text-muted-foreground">{r.dosage}</span> : null}
                    {r.family_member_id ? (
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                        For {familyMap[r.family_member_id] ?? "family"}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(r.times as string[] | null)?.map((t: string) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                      >
                        <BellRing className="size-3" />
                        {t}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground capitalize">
                    {r.frequency} · from {new Date(r.start_date).toLocaleDateString("en-GB")}
                    {r.end_date ? ` until ${new Date(r.end_date).toLocaleDateString("en-GB")}` : " · ongoing"}
                  </p>
                  {r.notes ? <p className="mt-1 text-xs text-muted-foreground">{r.notes}</p> : null}
                </div>
                <div className="flex items-center gap-1">
                  <form action={toggleReminder.bind(null, r.id, !r.active)}>
                    <button
                      type="submit"
                      aria-label={r.active ? "Pause reminder" : "Resume reminder"}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {r.active ? <Pause className="size-4" /> : <Play className="size-4" />}
                    </button>
                  </form>
                  <form action={deleteReminder.bind(null, r.id)}>
                    <button
                      type="submit"
                      aria-label="Delete reminder"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
