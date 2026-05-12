import { redirect } from "next/navigation"
import Link from "next/link"
import { FileSignature, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Prescriptions",
}

export default async function DoctorPrescriptionsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: rxList } = await supabase
    .from("prescriptions")
    .select("id, diagnosis, status, signed_at")
    .eq("doctor_id", user.id)
    .order("signed_at", { ascending: false })

  const list = rxList ?? []

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wider text-primary">Doctor portal</p>
          <h1 className="mt-1 font-serif text-4xl tracking-tight text-foreground">Prescriptions written</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Every digital prescription you have signed is stored here, signed, and immutable.
          </p>
        </div>
        <Button asChild>
          <Link href="/doctor/prescriptions/new">
            <Plus className="size-4" />
            Write new
          </Link>
        </Button>
      </header>

      {list.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-muted/30 p-10 text-center">
          <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileSignature className="size-5" />
          </span>
          <h2 className="mt-4 font-serif text-2xl text-foreground">No prescriptions yet</h2>
          <p className="mx-auto mt-2 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
            Once you write a prescription during or after a consultation, it will appear here.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {list.map((r) => (
            <li key={r.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{r.diagnosis ?? "Untitled"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Signed{" "}
                    {new Date(r.signed_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span className="inline-flex rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                  {r.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
