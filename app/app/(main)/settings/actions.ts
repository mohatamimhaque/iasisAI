"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const fullName     = String(formData.get("full_name")      ?? "").trim()
  const phone        = String(formData.get("phone")           ?? "").trim()
  const dob          = String(formData.get("date_of_birth")   ?? "").trim()
  const gender       = String(formData.get("gender")          ?? "").trim()
  const bloodGroup   = String(formData.get("blood_group")     ?? "").trim()
  const country      = String(formData.get("country")         ?? "").trim()
  const stateProv    = String(formData.get("state_province")  ?? "").trim()
  const city         = String(formData.get("city")            ?? "").trim()
  const addressLine  = String(formData.get("address_line")    ?? "").trim()

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name:      fullName     || null,
      phone:          phone        || null,
      date_of_birth:  dob          || null,
      gender:         gender       || null,
      blood_group:    bloodGroup   || null,
      country:        country      || null,
      state_province: stateProv    || null,
      city:           city         || null,
      address_line:   addressLine  || null,
    })
    .eq("id", user.id)

  if (error) return { error: error.message }

  revalidatePath("/app/settings")
  revalidatePath("/doctor/settings")
  revalidatePath("/clinic/settings")
  return { success: true }
}

export async function updateHealthRecord(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const heightCmRaw  = String(formData.get("height_cm")            ?? "").trim()
  const weightKgRaw  = String(formData.get("weight_kg")            ?? "").trim()
  const conditionsRaw = String(formData.get("chronic_conditions")  ?? "")
  const allergiesRaw  = String(formData.get("allergies")           ?? "")
  const medsRaw       = String(formData.get("current_medications") ?? "")

  const conditions = conditionsRaw.split(",").map((s) => s.trim()).filter(Boolean)
  const allergies  = allergiesRaw.split(",").map((s) => s.trim()).filter(Boolean)
  const meds = medsRaw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, ...rest] = line.split(/\s—\s|\s-\s|\s\|\s/)
      return { name: name?.trim() ?? line, schedule: rest.join(" ").trim() || null }
    })

  const payload = {
    user_id:             user.id,
    height_cm:           heightCmRaw ? Number.parseInt(heightCmRaw, 10) : null,
    weight_kg:           weightKgRaw ? Number.parseFloat(weightKgRaw)   : null,
    chronic_conditions:  conditions,
    allergies,
    current_medications: meds,
  }

  const { error } = await supabase.from("health_records").upsert(payload)
  if (error) return { error: error.message }

  revalidatePath("/app/settings")
  return { success: true }
}

export async function updateAvatarUrl(avatarUrl: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const url = avatarUrl.trim()
  if (!url) return { error: "Avatar URL is required" }

  const { error } = await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id)
  if (error) return { error: error.message }

  revalidatePath("/app/settings")
  revalidatePath("/app")
  revalidatePath("/doctor/settings")
  revalidatePath("/doctor")
  revalidatePath("/clinic/settings")
  revalidatePath("/clinic")
  return { success: true }
}
