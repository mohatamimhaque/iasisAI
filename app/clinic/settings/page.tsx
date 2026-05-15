import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ClinicSettingsForm } from "@/components/clinic/clinic-settings-form"
import { ProfileEditForm } from "@/components/settings/profile-edit-form"
import { SignOutButton } from "@/components/app-shell/sign-out-button"

export const metadata = { title: "Clinic settings" }

export default async function ClinicSettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const [{ data: clinic }, { data: profile }] = await Promise.all([
    supabase
      .from("clinics")
      .select("name, description, address, city, district, division, phone, services")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("full_name, phone, date_of_birth, gender, blood_group, country, state_province, city, address_line, avatar_url")
      .eq("id", user.id)
      .single(),
  ])

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <header>
        <p className="text-sm uppercase tracking-wider text-primary">Settings</p>
        <h1 className="mt-1 font-serif text-4xl tracking-tight text-foreground">Clinic profile</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Manage your facility listing and account details. Patients see your clinic in the Iasis
          directory based on the information you provide here.
        </p>
      </header>

      {/* Facility / professional info */}
      <section className="mt-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-serif text-2xl tracking-tight text-foreground">Facility</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Clinic name, services, address and contact details visible to patients.
        </p>
        <ClinicSettingsForm
          defaults={{
            name:        clinic?.name        ?? "",
            description: clinic?.description ?? "",
            address:     clinic?.address     ?? "",
            city:        clinic?.city        ?? "",
            district:    clinic?.district    ?? "",
            division:    clinic?.division    ?? "",
            phone:       clinic?.phone       ?? "",
            services:    (clinic?.services   ?? []).join(", "),
          }}
        />
      </section>

      {/* Personal profile */}
      <section className="mt-6 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-serif text-2xl tracking-tight text-foreground">Personal profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Your personal details and account information.
        </p>
        <div className="mt-6">
          <ProfileEditForm email={user.email ?? ""} profile={profile ?? {}} />
        </div>
      </section>

      {/* Sign out */}
      <section className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6">
        <div>
          <h2 className="font-serif text-xl tracking-tight text-foreground">Sign out</h2>
          <p className="mt-1 text-sm text-muted-foreground">End your session on this device.</p>
        </div>
        <SignOutButton />
      </section>
    </div>
  )
}
