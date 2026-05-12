import { redirect } from "next/navigation"
import { Building2 } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { deleteClinic } from "@/app/admin/clinics/actions"

export const metadata = { title: "Clinics" }

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

export default async function AdminClinicsPage() {
  const supabase = await adminGuard()
  const { data: clinics } = await supabase
    .from("clinics")
    .select("id, name, district, city, rating, verified, services, created_at")
    .order("created_at", { ascending: false })

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-wider text-primary">Providers</p>
          <h1 className="mt-1 font-serif text-4xl tracking-tight text-foreground">Clinics & diagnostic centres</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Review and verify clinics that have registered with Iasis.
          </p>
        </div>
        <Building2 className="size-6 text-primary" />
      </header>

      <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
        {!clinics || clinics.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-muted-foreground">No clinics registered yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Services</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {clinics.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 text-foreground">{c.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {[c.city, c.district].filter(Boolean).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {(c.services as string[] | null)?.slice(0, 3).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.rating != null ? Number(c.rating).toFixed(1) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        c.verified
                          ? "rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                          : "rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                      }
                    >
                      {c.verified ? "Verified" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    <form action={deleteClinic}>
                      <input type="hidden" name="clinic_id" value={c.id} />
                      <button type="submit" className="text-destructive hover:underline">
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
