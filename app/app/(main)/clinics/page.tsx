import Link from "next/link"
import { redirect } from "next/navigation"
import { Building2, MapPin, Star, Stethoscope } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export const metadata = { title: "Find clinics & doctors" }

export default async function ClinicsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; district?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const params = await searchParams
  const q = params.q?.trim() ?? ""
  const district = params.district?.trim() ?? ""

  let clinicQuery = supabase.from("clinics").select("id, name, district, city, services, rating, verified").limit(24)
  if (q) clinicQuery = clinicQuery.ilike("name", `%${q}%`)
  if (district) clinicQuery = clinicQuery.ilike("district", `%${district}%`)
  const { data: clinics } = await clinicQuery

  let doctorQuery = supabase
    .from("doctors")
    .select("id, full_name, specialty, consultation_fee, rating, verified, available_for_telemedicine")
    .limit(24)
  if (q) doctorQuery = doctorQuery.ilike("full_name", `%${q}%`)
  const { data: doctors } = await doctorQuery

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <header>
        <p className="text-sm uppercase tracking-wider text-primary">Care directory</p>
        <h1 className="mt-1 font-serif text-4xl tracking-tight text-foreground">Find a clinic or doctor</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Search verified clinics and BMDC-registered doctors across Bangladesh. Filter by district, specialty, or
          availability for telemedicine.
        </p>
      </header>

      <form className="mt-8 flex flex-col gap-3 sm:flex-row" action="/app/clinics">
        <Input name="q" defaultValue={q} placeholder="Search clinic or doctor name" />
        <Input name="district" defaultValue={district} placeholder="District (e.g. Dhaka)" className="sm:max-w-xs" />
        <Button type="submit">Search</Button>
      </form>

      <section className="mt-10">
        <h2 className="font-serif text-2xl tracking-tight text-foreground">Clinics</h2>
        {!clinics || clinics.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground">
            No clinics found yet. Clinic registrations are rolling out across districts — check back soon.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clinics.map((c) => (
              <article key={c.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Building2 className="size-5" />
                  </div>
                  {c.verified && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
                      Verified
                    </span>
                  )}
                </div>
                <h3 className="mt-3 font-serif text-lg tracking-tight text-foreground">{c.name}</h3>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="size-3.5" />
                  {[c.city, c.district].filter(Boolean).join(", ") || "Bangladesh"}
                </p>
                {c.rating != null && (
                  <p className="mt-2 flex items-center gap-1 text-xs text-foreground">
                    <Star className="size-3.5 fill-current text-primary" />
                    {Number(c.rating).toFixed(1)}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl tracking-tight text-foreground">Doctors</h2>
        {!doctors || doctors.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground">
            No doctors match your search. Try broader keywords.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {doctors.map((d) => (
              <article key={d.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Stethoscope className="size-5" />
                </div>
                <h3 className="mt-3 font-serif text-lg tracking-tight text-foreground">{d.full_name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{d.specialty}</p>
                <p className="mt-3 text-sm text-foreground">৳{d.consultation_fee} / consult</p>
                <div className="mt-4 flex items-center justify-between">
                  {d.available_for_telemedicine ? (
                    <span className="text-xs text-primary">Telemedicine available</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">In-person only</span>
                  )}
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/app/appointments/new?doctor=${d.id}`}>Book</Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
