import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowUpRight, Pill } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: "Prescriptions",
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-900 border-emerald-200",
  filled: "bg-secondary text-secondary-foreground border-border",
  cancelled: "bg-muted text-muted-foreground border-border",
  expired: "bg-muted text-muted-foreground border-border",
}

export default async function PrescriptionsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: rxList } = await supabase
    .from("prescriptions")
    .select("id, diagnosis, notes, status, signed_at, doctor_id")
    .eq("patient_id", user.id)
    .order("signed_at", { ascending: false })

  const list = rxList ?? []

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <header>
        <p className="text-sm uppercase tracking-wider text-primary">Prescriptions</p>
        <h1 className="mt-1 font-serif text-4xl tracking-tight text-foreground">Your digital prescriptions</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Every prescription signed by an Iasis doctor — verifiable by any pharmacy in Bangladesh.
        </p>
      </header>

      {list.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-muted/30 p-10 text-center">
          <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Pill className="size-5" />
          </span>
          <h2 className="mt-4 font-serif text-2xl text-foreground">No prescriptions yet</h2>
          <p className="mx-auto mt-2 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
            Once a doctor writes you a prescription on Iasis, it will appear here with dosage instructions and
            reminders.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {list.map((rx) => (
            <li key={rx.id}>
              <Link
                href={`/app/prescriptions/${rx.id}`}
                className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:bg-secondary/40"
              >
                <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Pill className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${
                        STATUS_STYLES[rx.status] ?? STATUS_STYLES.expired
                      }`}
                    >
                      {rx.status}
                    </span>
                  </div>
                  <h3 className="mt-2 line-clamp-1 text-base font-medium text-foreground">
                    {rx.diagnosis ?? "Prescription"}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Signed{" "}
                    {new Date(rx.signed_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
