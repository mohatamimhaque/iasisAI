import { createClient } from "@/lib/supabase/server"

export const metadata = { title: "Session debug" }

export default async function SessionDebugPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const email = user?.email ?? null
  const userId = user?.id ?? null

  const profileResponse = userId
    ? await supabase.from("profiles").select("*").eq("id", userId).single()
    : { data: null, error: null }
  const profile = profileResponse.data

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-foreground">Session debug</h1>
      <div className="mt-6 rounded-2xl border border-border bg-card p-6 text-sm">
        <p>
          <strong>Email:</strong> {email ?? "(none)"}
        </p>
        <p>
          <strong>User ID:</strong> {userId ?? "(none)"}
        </p>
        <p>
          <strong>Role:</strong> {profile?.role ?? "(none)"}
        </p>
        <p>
          <strong>Full name:</strong> {profile?.full_name ?? "(none)"}
        </p>
        <p>
          <strong>Profile error:</strong> {profileResponse.error?.message ?? "(none)"}
        </p>
        <p>
          <strong>Profile raw:</strong> {profile ? JSON.stringify(profile) : "(none)"}
        </p>
      </div>
    </div>
  )
}
