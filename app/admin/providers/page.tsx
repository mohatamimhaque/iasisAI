import { redirect } from "next/navigation"
import { ShieldCheck, Stethoscope } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { deleteDoctor } from "./actions"

export const metadata = { title: "Doctors" }

async function adminGuard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") redirect("/app")

  return supabase
}

export default async function AdminProvidersPage() {
  const supabase = await adminGuard()

  const [{ data: doctors }] = await Promise.all([
    supabase
      .from("doctors")
      .select("id, full_name, specialty, bmdc_id, verified")
      .order("verified", { ascending: false })
      .order("full_name"),
  ])

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <header>
        <p className="text-sm uppercase tracking-wider text-primary">Super admin</p>
        <h1 className="mt-1 font-serif text-4xl tracking-tight text-foreground">Doctors</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Verified doctors participating in the Iasis network.
        </p>
      </header>

      <section className="mt-8">
        <div className="flex items-center gap-2">
          <Stethoscope className="size-5 text-primary" />
          <h2 className="font-serif text-2xl text-foreground">Doctors</h2>
          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">
            {doctors?.length ?? 0}
          </span>
        </div>
        <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Specialty</th>
                <th className="px-5 py-3 font-medium">BMDC ID</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(doctors ?? []).map((d) => (
                <tr key={d.id} className="hover:bg-secondary/30">
                  <td className="px-5 py-3 text-foreground">{d.full_name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{d.specialty}</td>
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{d.bmdc_id ?? "—"}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        d.verified ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      <ShieldCheck className="size-3" />
                      {d.verified ? "Verified" : "Pending"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">
                    <form action={deleteDoctor}>
                      <input type="hidden" name="doctor_id" value={d.id} />
                      <button type="submit" className="text-destructive hover:underline">
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {(!doctors || doctors.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-muted-foreground">
                    No doctors yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
