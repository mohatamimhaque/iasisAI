import { redirect } from "next/navigation"
import { AlertTriangle, ShieldCheck, Trash2, UserPlus } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addEmergencyContact, removeEmergencyContact } from "@/app/app/emergency/actions"

export const metadata = {
  title: "Emergency",
}

export default async function EmergencyPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const [{ data: contacts }, { data: alerts }] = await Promise.all([
    supabase
      .from("emergency_contacts")
      .select("id, name, phone, relationship, is_primary")
      .eq("user_id", user.id)
      .order("is_primary", { ascending: false }),
    supabase
      .from("emergency_alerts")
      .select("id, status, location_label, created_at, resolved_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ])

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <header>
        <p className="text-sm uppercase tracking-wider text-destructive">Emergency</p>
        <h1 className="mt-1 font-serif text-4xl tracking-tight text-foreground">Stay safe, stay reachable</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Tap the red SOS button anytime to alert your emergency contacts with your live location and a summary of
          your health profile.
        </p>
      </header>

      <section className="mt-8 space-y-4 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl text-foreground">Emergency contacts</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Up to 5 contacts can be notified during an emergency.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            <ShieldCheck className="size-3" />
            {(contacts ?? []).length}/5
          </span>
        </div>

        {contacts && contacts.length > 0 ? (
          <ul className="space-y-2">
            {contacts.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {c.name}
                    {c.is_primary && (
                      <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-primary">
                        Primary
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {c.relationship} · {c.phone}
                  </p>
                </div>
                <form action={removeEmergencyContact.bind(null, c.id)}>
                  <button
                    type="submit"
                    aria-label="Remove contact"
                    className="text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        ) : null}

        <form action={addEmergencyContact} className="grid gap-3 rounded-xl border border-dashed border-border bg-muted/30 p-4 sm:grid-cols-3">
          <div className="space-y-1.5 sm:col-span-1">
            <Label htmlFor="name" className="text-xs">Name</Label>
            <Input id="name" name="name" required placeholder="Full name" />
          </div>
          <div className="space-y-1.5 sm:col-span-1">
            <Label htmlFor="phone" className="text-xs">Phone</Label>
            <Input id="phone" name="phone" required placeholder="+8801…" />
          </div>
          <div className="space-y-1.5 sm:col-span-1">
            <Label htmlFor="relationship" className="text-xs">Relationship</Label>
            <Input id="relationship" name="relationship" required placeholder="Spouse, Parent…" />
          </div>
          <label className="flex items-center gap-2 sm:col-span-2 text-xs text-muted-foreground">
            <input type="checkbox" name="is_primary" className="rounded border-border" />
            Make this the primary contact
          </label>
          <div className="sm:col-span-1 sm:justify-self-end">
            <Button type="submit" className="w-full">
              <UserPlus className="size-4" />
              Add
            </Button>
          </div>
        </form>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="font-serif text-xl text-foreground">Recent alerts</h2>
        {alerts && alerts.length > 0 ? (
          <ul className="space-y-2">
            {alerts.map((a) => (
              <li key={a.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <AlertTriangle
                        className={`size-4 ${a.status === "active" ? "text-destructive" : "text-muted-foreground"}`}
                      />
                      <p className="text-sm font-medium text-foreground capitalize">{a.status}</p>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(a.created_at).toLocaleString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {a.location_label ? ` · ${a.location_label}` : ""}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-10 text-center">
            <p className="text-sm text-muted-foreground">No emergency alerts yet — that&apos;s a good thing.</p>
          </div>
        )}
      </section>
    </div>
  )
}
