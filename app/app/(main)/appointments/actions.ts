"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function bookAppointment(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const doctor_id = String(formData.get("doctor_id") ?? "")
  const date = String(formData.get("date") ?? "")
  const time = String(formData.get("time") ?? "")
  const reason = String(formData.get("reason") ?? "").trim()
  const consultation_type = String(formData.get("consultation_type") ?? "telemedicine")

  if (!doctor_id || !date || !time) throw new Error("Doctor, date, and time are required")
  if (!reason) throw new Error("Please describe the reason for your visit")

  const scheduled_at = new Date(`${date}T${time}:00`).toISOString()

  const { error } = await supabase.from("appointments").insert({
    patient_id: user.id,
    doctor_id,
    scheduled_at,
    reason,
    consultation_type,
    status: "scheduled",
  })

  if (error) throw new Error(error.message)

  revalidatePath("/app/appointments")
  redirect("/app/appointments")
}

export async function cancelAppointment(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase
    .from("appointments")
    .update({ status: "cancelled" })
    .eq("id", id)
    .eq("patient_id", user.id)

  if (error) throw new Error(error.message)
  revalidatePath("/app/appointments")
}
