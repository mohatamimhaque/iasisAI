import Link from "next/link"
import { redirect } from "next/navigation"
import { Cog } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { ProfileEditForm } from "@/components/settings/profile-edit-form"
import { AdminAddAdminForm } from "@/components/admin/admin-add-admin-form"
import { AdminPasswordPanel } from "@/components/admin/admin-password-panel"

export const metadata = { title: "Admin settings" }

export default async function AdminSettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, phone, date_of_birth, gender, blood_group, division, district, avatar_url")
    .eq("id", user.id)
    .single()
  if (profile?.role !== "admin") redirect("/app")

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <header>
        <p className="text-sm uppercase tracking-wider text-primary">Admin</p>
        <h1 className="mt-1 font-serif text-4xl tracking-tight text-foreground">Admin settings</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Signed in as <span className="text-foreground">{profile?.full_name ?? user.email}</span>.
        </p>
      </header>

      <section className="mt-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-serif text-2xl tracking-tight text-foreground">Profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">Personal information and contact details.</p>
        <div className="mt-6">
          <ProfileEditForm email={user.email ?? ""} profile={profile ?? {}} />
        </div>
      </section>

      <AdminPasswordPanel email={user.email ?? ""} />

      <AdminAddAdminForm />

      <div className="mt-8 grid gap-3">
        <Link
          href="/admin/system"
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-sm transition-colors hover:border-primary/40"
        >
          <Cog className="size-4 text-primary" />
          System configuration, nav, and AI module settings
        </Link>
        <Link
          href="/admin/ai-models"
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-sm transition-colors hover:border-primary/40"
        >
          <Cog className="size-4 text-primary" />
          AI provider keys and model defaults
        </Link>
        <Link
          href="/admin/content"
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-sm transition-colors hover:border-primary/40"
        >
          <Cog className="size-4 text-primary" />
          Marketing content CMS
        </Link>
      </div>
    </div>
  )
}
