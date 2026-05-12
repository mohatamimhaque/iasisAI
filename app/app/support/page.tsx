import { redirect } from "next/navigation"
import { LifeBuoy } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { submitTicket } from "@/app/app/support/actions"

export const metadata = {
  title: "Support",
}

const STATUS_STYLES: Record<string, string> = {
  open: "bg-primary/10 text-primary",
  in_progress: "bg-amber-100 text-amber-900",
  resolved: "bg-emerald-100 text-emerald-900",
  closed: "bg-muted text-muted-foreground",
}

export default async function SupportPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: tickets } = await supabase
    .from("support_tickets")
    .select("id, subject, category, status, priority, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const list = tickets ?? []

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <header>
        <p className="text-sm uppercase tracking-wider text-primary">Support</p>
        <h1 className="mt-1 font-serif text-4xl tracking-tight text-foreground">How can we help?</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Submit a ticket and our team will respond within 24 hours. For medical emergencies, use the SOS button.
        </p>
      </header>

      <section className="mt-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-serif text-xl text-foreground">New ticket</h2>
        <form action={submitTicket} className="mt-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                name="category"
                required
                defaultValue=""
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="" disabled>
                  Choose…
                </option>
                <option value="billing">Billing</option>
                <option value="medical_record">Medical record error</option>
                <option value="account_access">Account access</option>
                <option value="complaint">Complaint</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" name="subject" required placeholder="Short summary" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Tell us what happened</Label>
            <Textarea id="description" name="description" required rows={5} placeholder="Be as specific as you can." />
          </div>
          <div className="flex justify-end">
            <Button type="submit">Submit ticket</Button>
          </div>
        </form>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-xl text-foreground">Your tickets</h2>
        {list.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-border bg-muted/30 p-10 text-center">
            <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <LifeBuoy className="size-5" />
            </span>
            <p className="mt-4 text-sm text-muted-foreground">No tickets yet.</p>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {list.map((t) => (
              <li key={t.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{t.subject}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t.category.replace("_", " ")} · {new Date(t.created_at).toLocaleString("en-GB", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                      STATUS_STYLES[t.status] ?? STATUS_STYLES.closed
                    }`}
                  >
                    {t.status.replace("_", " ")}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
