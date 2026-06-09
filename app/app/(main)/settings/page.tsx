import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SignOutButton } from "@/components/app-shell/sign-out-button"
import { ProfileEditForm } from "@/components/settings/profile-edit-form"
import { HealthRecordForm } from "@/components/settings/health-record-form"

export const metadata = {
  title: "Settings",
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const [{ data: profile }, { data: record }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, phone, date_of_birth, gender, blood_group, country, state_province, city, address_line, role, avatar_url")
      .eq("id", user.id)
      .single(),
    supabase
      .from("health_records")
      .select("height_cm, weight_kg, chronic_conditions, allergies, current_medications")
      .eq("user_id", user.id)
      .maybeSingle(),
  ])

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <header>
        <p className="text-sm uppercase tracking-wider text-primary">Settings</p>
        <h1 className="mt-1 font-serif text-4xl tracking-tight text-foreground">Your health profile</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          The information here travels with you. Doctors and clinics that you visit through Iasis see the relevant parts
          so they can give you safer, faster care.
        </p>
      </header>

      <section className="mt-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-serif text-2xl tracking-tight text-foreground">Profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">Personal information and contact details.</p>
        <div className="mt-6">
          <ProfileEditForm email={user.email ?? ""} profile={profile ?? {}} />
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-serif text-2xl tracking-tight text-foreground">Medical record</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Chronic conditions, allergies and current medications. Used by AI triage and shared with treating doctors.
        </p>
        <div className="mt-6">
          <HealthRecordForm record={record ?? null} />
        </div>
      </section>

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
