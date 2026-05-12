"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function saveClinicProfile(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const servicesRaw = (formData.get("services") as string | null) ?? ""
  const services = servicesRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)

  const payload = {
    id: user.id,
    name: (formData.get("name") as string)?.trim() || "",
    description: ((formData.get("description") as string)?.trim() || null) as string | null,
    address: ((formData.get("address") as string)?.trim() || null) as string | null,
    city: ((formData.get("city") as string)?.trim() || null) as string | null,
    district: ((formData.get("district") as string)?.trim() || null) as string | null,
    division: ((formData.get("division") as string)?.trim() || null) as string | null,
    phone: ((formData.get("phone") as string)?.trim() || null) as string | null,
    services,
  }

  if (!payload.name) return { error: "Clinic name is required" }

  const { error } = await supabase.from("clinics").upsert(payload, { onConflict: "id" })
  if (error) return { error: error.message }

  revalidatePath("/clinic/settings")
  return { error: null }
}
