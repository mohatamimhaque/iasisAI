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

  return { supabase }
}

export async function deleteDoctor(formData: FormData) {
  await assertAdmin()

  const doctorId = String(formData.get("doctor_id") ?? "").trim()
  if (!doctorId) return { error: "Doctor ID is required" }

  const admin = createAdminClient()
  if (!admin) return { error: "SUPABASE_SERVICE_ROLE_KEY is missing on the server." }

  const { error } = await admin.from("doctors").delete().eq("id", doctorId)
  if (error) return { error: error.message }

  revalidatePath("/admin/providers")
  return { success: true }
}
