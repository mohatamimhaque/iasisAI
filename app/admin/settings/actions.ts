"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

async function assertAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") throw new Error("Forbidden")

  return { supabase, user }
}

export async function promoteAdmin(formData: FormData) {
  const { supabase } = await assertAdmin()

  const userId = String(formData.get("user_id") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim()

  if (!userId && !email) return { error: "Provide a user ID or email" }

  if (!userId && email) {
    const lookup = await findUserIdByEmail(email)
    if (lookup.error) return { error: lookup.error }
    if (!lookup.id) return { error: "No user found with that email" }
    return promoteByUserId(supabase, lookup.id)
  }

  if (!userId) return { error: "User ID is required" }
  return promoteByUserId(supabase, userId)
}

export async function demoteAdmin(formData: FormData) {
  const { supabase, user } = await assertAdmin()

  const userId = String(formData.get("user_id") ?? "").trim()
  const role = String(formData.get("role") ?? "patient").trim()
  if (!userId) return { error: "User ID is required" }
  if (userId === user.id) return { error: "You cannot demote yourself" }

  const allowedRoles = new Set(["patient", "doctor", "clinic"])
  if (!allowedRoles.has(role)) return { error: "Invalid role" }

  const { data, error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId)
    .select("id")

  if (error) return { error: error.message }
  if (!data || data.length === 0) return { error: "No user found with that ID" }

  revalidatePath("/admin/settings")
  revalidatePath("/admin/users")
  return { success: true }
}

export async function searchAdminCandidates(query: string) {
  const { supabase } = await assertAdmin()
  const term = query.trim().toLowerCase()
  if (term.length < 2) return []

  const limit = 8
  const candidates = new Map<
    string,
    {
      id: string
      full_name: string | null
      email: string | null
      role: string | null
    }
  >()

  const admin = createAdminClient()
  if (admin) {
    const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
    if (!error) {
      const users = data?.users ?? []
      for (const user of users) {
        if (candidates.size >= limit) break
        const email = user.email ?? null
        const metaName = (user.user_metadata?.full_name as string | undefined) ?? null
        const haystack = `${email ?? ""} ${metaName ?? ""}`.toLowerCase()
        if (!haystack.includes(term)) continue
        if (!user.id) continue
        candidates.set(user.id, { id: user.id, full_name: metaName, email, role: null })
      }
    }
  }

  const { data: profileMatches } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .ilike("full_name", `%${term}%`)
    .limit(limit)

  for (const profile of profileMatches ?? []) {
    if (candidates.size >= limit && !candidates.has(profile.id)) continue
    const existing = candidates.get(profile.id)
    candidates.set(profile.id, {
      id: profile.id,
      full_name: profile.full_name ?? existing?.full_name ?? null,
      email: existing?.email ?? null,
      role: profile.role ?? existing?.role ?? null,
    })
  }

  if (candidates.size > 0) {
    const ids = Array.from(candidates.keys())
    const { data: profiles } = await supabase.from("profiles").select("id, full_name, role").in("id", ids)
    for (const profile of profiles ?? []) {
      const existing = candidates.get(profile.id)
      if (!existing) continue
      candidates.set(profile.id, {
        id: profile.id,
        full_name: profile.full_name ?? existing.full_name,
        email: existing.email ?? null,
        role: profile.role ?? existing.role,
      })
    }
  }

  return Array.from(candidates.values()).slice(0, limit)
}

async function promoteByUserId(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", userId)
    .select("id")

  if (error) return { error: error.message }
  if (!data || data.length === 0) return { error: "No user found with that ID" }

  revalidatePath("/admin/settings")
  revalidatePath("/admin/users")
  return { success: true }
}

async function findUserIdByEmail(email: string): Promise<{ id: string | null; error: string | null }> {
  const admin = createAdminClient()
  if (!admin) {
    return {
      id: null,
      error: "SUPABASE_SERVICE_ROLE_KEY is missing on the server. Add it to enable email lookup.",
    }
  }

  const target = email.toLowerCase()
  const perPage = 1000
  let page = 1

  while (page <= 10) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage })
    if (error) return { id: null, error: error.message }

    const users = data?.users ?? []
    const match = users.find((user) => user.email?.toLowerCase() === target)
    if (match) return { id: match.id, error: null }

    if (users.length < perPage) break
    page += 1
  }

  return { id: null, error: null }
}
