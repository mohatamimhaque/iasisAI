import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DoctorSettingsForm } from "@/components/doctor/doctor-settings-form"

export const metadata = { title: "Doctor settings" }

export default async function DoctorSettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: doc } = await supabase
    .from("doctors")
    .select("full_name, specialty, bmdc_id, bio, consultation_fee, years_experience, available_for_telemedicine")
    .eq("id", user.id)
    .maybeSingle()

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <header>
        <p className="text-sm uppercase tracking-wider text-primary">Profile</p>
        <h1 className="mt-1 font-serif text-4xl tracking-tight text-foreground">Doctor profile</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Your public listing on the Iasis directory. Patients see your specialty, bio, fee, and availability when they
          search for care.
        </p>
      </header>
      <DoctorSettingsForm
        defaults={{
          full_name: doc?.full_name ?? "",
          specialty: doc?.specialty ?? "",
          bmdc_id: doc?.bmdc_id ?? "",
          bio: doc?.bio ?? "",
          consultation_fee: doc?.consultation_fee ?? 500,
          years_experience: doc?.years_experience ?? 0,
          available_for_telemedicine: doc?.available_for_telemedicine ?? true,
        }}
      />
    </div>
  )
}
