import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ClinicSidebar, CLINIC_NAV } from "@/components/clinic/clinic-sidebar"
import { TopBar } from "@/components/app-shell/top-bar"
import { getBrandingConfig } from "@/lib/site-config"

export default async function ClinicLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, avatar_url")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "clinic") {
    if (profile?.role === "admin") redirect("/admin")
    if (profile?.role === "doctor") redirect("/doctor")
    redirect("/app")
  }

  const { logoUrl } = await getBrandingConfig()

  return (
    <div className="flex min-h-svh bg-background">
      <ClinicSidebar userEmail={user.email ?? ""} logoUrl={logoUrl} />
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <TopBar
          fullName={profile?.full_name ?? null}
          email={user.email ?? ""}
          avatarUrl={profile?.avatar_url ?? null}
          logoUrl={logoUrl}
          mobileNavItems={CLINIC_NAV}
          mobileNavLabel="Diagnostic lab"
          settingsHref="/clinic/settings"
        />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
