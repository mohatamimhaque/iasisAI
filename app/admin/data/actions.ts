"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

const TABLE_CONFIG: Record<
  string,
  {
    idField: string
    label: string
  }
> = {
  profiles: { idField: "id", label: "Users" },
  health_records: { idField: "user_id", label: "Health records" },
  lab_reports: { idField: "id", label: "Lab reports" },
  marketing_content: { idField: "key", label: "Marketing content" },
  medicine_reminders: { idField: "id", label: "Medicine reminders" },
  medicines: { idField: "id", label: "Medicines" },
  mental_health_sessions: { idField: "id", label: "Mental health sessions" },
  pharmacies: { idField: "id", label: "Pharmacies" },
  prescription_items: { idField: "id", label: "Prescription items" },
  prescriptions: { idField: "id", label: "Prescriptions" },
  support_tickets: { idField: "id", label: "Support tickets" },
  transactions: { idField: "id", label: "Transactions" },
  triage_sessions: { idField: "id", label: "Triage sessions" },
}

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

export async function bulkDeleteRecords(formData: FormData) {
  const { supabase } = await assertAdmin()

  const table = String(formData.get("table") ?? "").trim()
  const mode = String(formData.get("mode") ?? "soft").trim()
  const idsRaw = String(formData.get("ids") ?? "[]")

  const config = TABLE_CONFIG[table]
  if (!config) return { error: "Invalid table" }

  let ids: string[] = []
  try {
    ids = JSON.parse(idsRaw) as string[]
  } catch {
    return { error: "Invalid ID list" }
  }

  const uniqueIds = Array.from(new Set(ids.filter(Boolean)))
  if (uniqueIds.length === 0) return { error: "Select at least one record" }

  if (mode === "soft") {
    const { error } = await supabase
      .from(table)
      .update({ deleted_at: new Date().toISOString() })
      .in(config.idField, uniqueIds)

    if (error) return { error: error.message }
  } else if (mode === "hard") {
    if (table === "profiles") {
      const admin = createAdminClient()
      if (!admin) {
        return { error: "SUPABASE_SERVICE_ROLE_KEY is missing on the server." }
      }

      for (const id of uniqueIds) {
        const { error } = await admin.auth.admin.deleteUser(id)
        if (error) return { error: error.message }
      }
    } else {
      const { error } = await supabase.from(table).delete().in(config.idField, uniqueIds)
      if (error) return { error: error.message }
    }
  } else {
    return { error: "Invalid delete mode" }
  }

  revalidatePath("/admin/data")
  revalidatePath("/admin/users")
  return { success: true }
}
