import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AuthShell } from "@/components/auth/auth-shell"
import { UpdatePasswordForm } from "@/components/auth/update-password-form"

export const metadata = {
  title: "Set new password",
  description: "Choose a new password for your Iasis AI account.",
}

export default async function UpdatePasswordPage() {
  // Only users who arrived via a valid reset link will have a session here
  // (Supabase exchanges the code in /auth/callback before redirecting back).
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/forgot-password")

  return (
    <AuthShell
      quote={{
        body: "Strong, unique passwords are the simplest way to keep a lifetime of medical history safe.",
        attribution: "— Iasis Security Team",
      }}
    >
      <UpdatePasswordForm />
    </AuthShell>
  )
}
