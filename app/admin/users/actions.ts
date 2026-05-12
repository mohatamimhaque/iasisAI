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

export async function deleteUser(formData: FormData) {
  const { supabase, user } = await assertAdmin()

  const userId = String(formData.get("user_id") ?? "").trim()
  if (!userId) return { error: "User ID is required" }
  if (userId === user.id) return { error: "You cannot delete yourself" }

  const { error } = await supabase
    .from("profiles")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", userId)

  if (error) return { error: error.message }

  revalidatePath("/admin/users")
  revalidatePath("/admin/data")
  return { success: true }
}

export async function updateUserRole(formData: FormData) {
  const { supabase, user } = await assertAdmin()

  const userId = String(formData.get("user_id") ?? "").trim()
  const role = String(formData.get("role") ?? "patient").trim()
  if (!userId) return { error: "User ID is required" }
  if (userId === user.id) return { error: "You cannot update your own role" }

  const allowedRoles = new Set(["patient", "doctor", "clinic"])
  if (!allowedRoles.has(role)) return { error: "Invalid role" }

  const admin = createAdminClient()
  if (admin) {
    const { error } = await admin.from("profiles").update({ role }).eq("id", userId)
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase.from("profiles").update({ role }).eq("id", userId)
    if (error) return { error: error.message }
  }

  revalidatePath("/admin/users")
  return { success: true }
}
