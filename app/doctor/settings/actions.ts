"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function saveDoctorProfile(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const payload = {
    id: user.id,
    full_name: (formData.get("full_name") as string)?.trim() || "",
    specialty: (formData.get("specialty") as string)?.trim() || "",
    bmdc_id: ((formData.get("bmdc_id") as string)?.trim() || null) as string | null,
    bio: ((formData.get("bio") as string)?.trim() || null) as string | null,
    consultation_fee: Number(formData.get("consultation_fee") ?? 500),
    years_experience: Number(formData.get("years_experience") ?? 0),
    available_for_telemedicine: formData.get("available_for_telemedicine") === "on",
  }

  if (!payload.full_name || !payload.specialty) {
    return { error: "Name and specialty are required" }
  }

  const { error } = await supabase.from("doctors").upsert(payload, { onConflict: "id" })
  if (error) return { error: error.message }

  revalidatePath("/doctor/settings")
  return { error: null }
}
