"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function addEmergencyContact(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const name = String(formData.get("name") ?? "").trim()
  const phone = String(formData.get("phone") ?? "").trim()
  const relationship = String(formData.get("relationship") ?? "").trim()
  const is_primary = formData.get("is_primary") === "on"

  if (!name || !phone || !relationship) throw new Error("Name, phone, and relationship are required")

  const { count } = await supabase
    .from("emergency_contacts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
  if ((count ?? 0) >= 5) throw new Error("You can save up to 5 emergency contacts")

  if (is_primary) {
    await supabase.from("emergency_contacts").update({ is_primary: false }).eq("user_id", user.id)
  }

  const { error } = await supabase.from("emergency_contacts").insert({
    user_id: user.id,
    name,
    phone,
    relationship,
    is_primary,
  })
  if (error) throw new Error(error.message)

  revalidatePath("/app/emergency")
}

export async function removeEmergencyContact(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase
    .from("emergency_contacts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
  if (error) throw new Error(error.message)

  revalidatePath("/app/emergency")
}

export async function triggerEmergencyAlert(input: {
  location_lat?: number | null
  location_lng?: number | null
  location_label?: string | null
  notes?: string | null
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data: contacts } = await supabase
    .from("emergency_contacts")
    .select("name, phone, relationship")
    .eq("user_id", user.id)

  const { error, data } = await supabase
    .from("emergency_alerts")
    .insert({
      user_id: user.id,
      trigger_source: "manual",
      location_lat: input.location_lat ?? null,
      location_lng: input.location_lng ?? null,
      location_label: input.location_label ?? null,
      notes: input.notes ?? null,
      contacts_notified: contacts ?? [],
      status: "active",
    })
    .select("id")
    .single()
  if (error) throw new Error(error.message)

  revalidatePath("/app/emergency")
  return { id: data.id, contacts_notified: (contacts ?? []).length }
}

export async function resolveEmergencyAlert(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase
    .from("emergency_alerts")
    .update({ status: "resolved", resolved_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
  if (error) throw new Error(error.message)

  revalidatePath("/app/emergency")
}
