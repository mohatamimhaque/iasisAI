import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DoctorSettingsForm } from "@/components/doctor/doctor-settings-form"
import { ProfileEditForm } from "@/components/settings/profile-edit-form"
import { SignOutButton } from "@/components/app-shell/sign-out-button"

export const metadata = { title: "Doctor settings" }

export default async function DoctorSettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const [{ data: doc }, { data: profile }] = await Promise.all([
    supabase
      .from("doctors")
      .select("full_name, specialty, bmdc_id, bio, consultation_fee, years_experience, available_for_telemedicine")
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
        <h1 className="mt-1 font-serif text-4xl tracking-tight text-foreground">Doctor profile</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Manage your practice listing and personal details. Patients see your specialty, bio, fee,
          and availability when they search for care.
        </p>
      </header>

      {/* Practice / professional info */}
      <section className="mt-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-serif text-2xl tracking-tight text-foreground">Practice</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Specialty, credentials and consultation details visible to patients.
        </p>
        <DoctorSettingsForm
          defaults={{
            full_name:                  doc?.full_name                  ?? profile?.full_name ?? "",
            specialty:                  doc?.specialty                  ?? "",
            bmdc_id:                    doc?.bmdc_id                    ?? "",
            bio:                        doc?.bio                        ?? "",
            consultation_fee:           doc?.consultation_fee           ?? 500,
            years_experience:           doc?.years_experience           ?? 0,
            available_for_telemedicine: doc?.available_for_telemedicine ?? true,
          }}
        />
      </section>

      {/* Personal profile */}
      <section className="mt-6 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-serif text-2xl tracking-tight text-foreground">Personal profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Your personal details, contact information, and location.
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
