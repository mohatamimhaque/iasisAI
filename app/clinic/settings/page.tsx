import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ClinicSettingsForm } from "@/components/clinic/clinic-settings-form"

export const metadata = { title: "Clinic settings" }

export default async function ClinicSettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: clinic } = await supabase
    .from("clinics")
    .select("name, description, address, city, district, division, phone, services")
    .eq("id", user.id)
    .maybeSingle()

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <header>
        <p className="text-sm uppercase tracking-wider text-primary">Profile</p>
        <h1 className="mt-1 font-serif text-4xl tracking-tight text-foreground">Clinic profile</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          How patients see your clinic in the Iasis directory.
        </p>
      </header>

      <ClinicSettingsForm
        defaults={{
          name: clinic?.name ?? "",
          description: clinic?.description ?? "",
          address: clinic?.address ?? "",
          city: clinic?.city ?? "",
          district: clinic?.district ?? "",
          division: clinic?.division ?? "",
          phone: clinic?.phone ?? "",
          services: (clinic?.services ?? []).join(", "),
        }}
      />
    </div>
  )
}
