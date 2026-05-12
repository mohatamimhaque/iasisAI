"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export type PrescriptionItemInput = {
  medicine_name: string
  dosage?: string
  frequency?: string
  duration?: string
  instructions?: string
}

export async function createPrescription(input: {
  patient_id: string
  appointment_id?: string | null
  diagnosis: string
  notes?: string
  items: PrescriptionItemInput[]
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  if (!input.patient_id) throw new Error("Patient ID is required")
  if (!input.diagnosis?.trim()) throw new Error("Diagnosis is required")
  const items = input.items.filter((i) => i.medicine_name?.trim())
  if (items.length === 0) throw new Error("Add at least one medicine")

  const { data: rx, error: rxErr } = await supabase
    .from("prescriptions")
    .insert({
      patient_id: input.patient_id,
      doctor_id: user.id,
      appointment_id: input.appointment_id ?? null,
      diagnosis: input.diagnosis.trim(),
      notes: input.notes?.trim() || null,
      status: "active",
      qr_code: `IASIS-RX-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    })
    .select("id")
    .single()

  if (rxErr || !rx) throw new Error(rxErr?.message ?? "Failed to create prescription")

  const { error: itemsErr } = await supabase.from("prescription_items").insert(
    items.map((i) => ({
      prescription_id: rx.id,
      medicine_name: i.medicine_name.trim(),
      dosage: i.dosage?.trim() || null,
      frequency: i.frequency?.trim() || null,
      duration: i.duration?.trim() || null,
      instructions: i.instructions?.trim() || null,
    })),
  )
  if (itemsErr) throw new Error(itemsErr.message)

  revalidatePath("/doctor/prescriptions")
  redirect("/doctor/prescriptions")
}
