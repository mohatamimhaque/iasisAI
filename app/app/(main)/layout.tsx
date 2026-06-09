import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppSidebar, APP_NAV } from "@/components/app-shell/app-sidebar"
import { BottomNav } from "@/components/app-shell/bottom-nav"
import { TopBar } from "@/components/app-shell/top-bar"
import { SosButton } from "@/components/emergency/sos-button"
import { getBrandingConfig } from "@/lib/site-config"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, onboarded, avatar_url")
    .eq("id", user.id)
    .single()

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const [triageCount, rxCount, labCount, apptCount] = await Promise.all([
    supabase
      .from("triage_sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", since),
    supabase
      .from("prescriptions")
      .select("id", { count: "exact", head: true })
      .eq("patient_id", user.id)
      .gte("signed_at", since),
    supabase
      .from("lab_reports")
      .select("id", { count: "exact", head: true })
      .eq("patient_id", user.id)
      .gte("reported_at", since),
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("patient_id", user.id)
      .gte("scheduled_at", since),
  ])

  const notificationCount =
    (triageCount.count ?? 0) + (rxCount.count ?? 0) + (labCount.count ?? 0) + (apptCount.count ?? 0)

  const { logoUrl } = await getBrandingConfig()

  // Route non-patients to their own portal.
  if (profile?.role === "doctor") redirect("/doctor")
  if (profile?.role === "admin") redirect("/admin")
  if (profile?.role === "clinic") redirect("/clinic")

  // Patients must complete onboarding before reaching the app.
  if (profile?.role === "patient" && !profile?.onboarded) {
    redirect("/onboarding")
  }

  return (
    <div className="flex min-h-svh bg-background">
      <AppSidebar userEmail={user.email ?? ""} logoUrl={logoUrl} />
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <TopBar
          fullName={profile?.full_name ?? null}
          email={user.email ?? ""}
          avatarUrl={profile?.avatar_url ?? null}
          logoUrl={logoUrl}
          mobileNavItems={APP_NAV}
          mobileNavLabel="Patient"
          settingsHref="/app/settings"
          notificationsHref="/app/notifications"
          notificationCount={notificationCount}
        />
        <main className="flex-1 pb-24 lg:pb-0">{children}</main>
      </div>
      <BottomNav />
      <SosButton />
    </div>
  )
}
