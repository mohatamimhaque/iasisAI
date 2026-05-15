import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/app"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Sync role from signup metadata → profiles table.
      // Handles the case where the DB trigger missed (on conflict do nothing) or
      // was not yet deployed when the user first signed up.
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (authUser) {
        const metaRole = authUser.user_metadata?.role as string | undefined
        const safeRole =
          metaRole && ["patient", "doctor", "clinic"].includes(metaRole)
            ? metaRole
            : "patient"

        const adminClient = createAdminClient()
        const db = adminClient ?? supabase

        // Create profile row if it doesn't exist yet (trigger may have missed)
        await db.from("profiles").upsert(
          {
            id: authUser.id,
            full_name:
              (authUser.user_metadata?.full_name as string | undefined) ??
              authUser.email ??
              "",
            role: safeRole,
          },
          { onConflict: "id", ignoreDuplicates: true },
        )

        // If profile already existed but role is still the default 'patient',
        // promote it to the role the user chose at signup.
        if (safeRole !== "patient") {
          await db
            .from("profiles")
            .update({ role: safeRole })
            .eq("id", authUser.id)
            .eq("role", "patient")
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}
