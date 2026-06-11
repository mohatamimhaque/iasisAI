"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

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

export type PatientSearchResult = {
  id: string
  full_name: string | null
  avatar_url: string | null
  email: string | null
}

/**
 * Searches for patients by name or email.
 * Suggests at most 8 patients with full_name, email, and avatar_url.
 */
export async function searchPatients(query: string): Promise<PatientSearchResult[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Verify user is doctor or admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || (profile.role !== "doctor" && profile.role !== "admin")) {
    throw new Error("Unauthorized: Only doctors can search for patients.")
  }

  const cleanQuery = query.trim()
  if (cleanQuery.length < 2) return []

  const adminClient = createAdminClient()
  
  // 1. Search profiles where role = 'patient' by full_name
  // If we have adminClient, we fetch all profiles to map their email.
  // (In a small database/demo, in-memory search is robust and fast).
  const db = adminClient ?? supabase
  const { data: profiles, error: profilesError } = await db
    .from("profiles")
    .select("id, full_name, avatar_url")
    .eq("role", "patient")
    .is("deleted_at", null)

  if (profilesError) throw new Error(profilesError.message)

  // 2. Fetch email addresses using admin client
  let emailMap = new Map<string, string>()
  if (adminClient) {
    const perPage = 1000
    let page = 1
    while (page <= 10) {
      const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage })
      if (error) break
      const users = data?.users ?? []
      for (const u of users) {
        if (u.id && u.email) emailMap.set(u.id, u.email)
      }
      if (users.length < perPage) break
      page += 1
    }
  }

  // 3. Search and filter
  const term = cleanQuery.toLowerCase()
  const list = (profiles ?? []).map(p => ({
    id: p.id,
    full_name: p.full_name,
    avatar_url: p.avatar_url,
    email: emailMap.get(p.id) || null
  }))

  const matches = list.filter(p => {
    const nameMatch = p.full_name?.toLowerCase().includes(term)
    const emailMatch = p.email?.toLowerCase().includes(term)
    return nameMatch || emailMatch
  })

  return matches.slice(0, 8)
}

/**
 * Retrieves a single patient's profile details by ID (including email).
 */
export async function getPatientById(id: string): Promise<PatientSearchResult | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const adminClient = createAdminClient()
  const db = adminClient ?? supabase

  const { data: profile, error } = await db
    .from("profiles")
    .select("id, full_name, avatar_url")
    .eq("id", id)
    .eq("role", "patient")
    .single()

  if (error || !profile) return null

  let email: string | null = null
  if (adminClient) {
    const { data: authUser } = await adminClient.auth.admin.getUserById(id)
    email = authUser?.user?.email ?? null
  }

  return {
    id: profile.id,
    full_name: profile.full_name,
    avatar_url: profile.avatar_url,
    email
  }
}
