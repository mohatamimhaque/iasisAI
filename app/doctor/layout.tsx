import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DoctorSidebar } from "@/components/doctor/doctor-sidebar"
import { TopBar } from "@/components/app-shell/top-bar"
import { getBrandingConfig } from "@/lib/site-config"

export default async function DoctorLayout({ children }: { children: React.ReactNode }) {
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

  if (profile?.role !== "doctor") {
    if (profile?.role === "admin") redirect("/admin")
    if (profile?.role === "clinic") redirect("/clinic")
    redirect("/app")
  }

  const { logoUrl } = await getBrandingConfig()

  return (
    <div className="flex min-h-svh bg-background">
      <DoctorSidebar userEmail={user.email ?? ""} logoUrl={logoUrl} />
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <TopBar
          fullName={profile?.full_name ?? null}
          email={user.email ?? ""}
          avatarUrl={profile?.avatar_url ?? null}
          logoUrl={logoUrl}
        />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
