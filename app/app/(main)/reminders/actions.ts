"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function createReminder(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const medicine_name = String(formData.get("medicine_name") ?? "").trim()
  const dosage = String(formData.get("dosage") ?? "").trim()
  const frequency = String(formData.get("frequency") ?? "daily")
  const times_raw = String(formData.get("times") ?? "").trim()
  const start_date = String(formData.get("start_date") ?? new Date().toISOString().slice(0, 10))
  const end_date = String(formData.get("end_date") ?? "").trim() || null
  const family_member_id = String(formData.get("family_member_id") ?? "").trim() || null
  const notes = String(formData.get("notes") ?? "").trim() || null

  if (!medicine_name) throw new Error("Medicine name is required")
  const times = times_raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
  if (times.length === 0) throw new Error("Add at least one reminder time (e.g. 08:00)")

  const { error } = await supabase.from("medicine_reminders").insert({
    user_id: user.id,
    family_member_id,
    medicine_name,
    dosage: dosage || null,
    frequency,
    times,
    start_date,
    end_date,
    notes,
    active: true,
  })
  if (error) throw new Error(error.message)

  revalidatePath("/app/reminders")
}

export async function toggleReminder(id: string, active: boolean) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase
    .from("medicine_reminders")
    .update({ active })
    .eq("id", id)
    .eq("user_id", user.id)
  if (error) throw new Error(error.message)
  revalidatePath("/app/reminders")
}

export async function deleteReminder(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase.from("medicine_reminders").delete().eq("id", id).eq("user_id", user.id)
  if (error) throw new Error(error.message)
  revalidatePath("/app/reminders")
}
