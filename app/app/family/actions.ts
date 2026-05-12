"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

const RELATIONSHIPS = [
  "Spouse",
  "Parent",
  "Child",
  "Sibling",
  "Grandparent",
  "Grandchild",
  "Other",
] as const

const familySchema = z.object({
  full_name: z.string().min(2).max(120),
  relationship: z.enum(RELATIONSHIPS),
  date_of_birth: z.string().optional().nullable(),
  gender: z.enum(["male", "female", "other"]).optional().nullable(),
  blood_group: z.string().max(10).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
})

export type FamilyFormState = {
  ok?: boolean
  error?: string
  fieldErrors?: Record<string, string>
}

function parseFormData(formData: FormData) {
  const raw = {
    full_name: String(formData.get("full_name") ?? "").trim(),
    relationship: String(formData.get("relationship") ?? ""),
    date_of_birth: (formData.get("date_of_birth") as string) || null,
    gender: (formData.get("gender") as string) || null,
    blood_group: ((formData.get("blood_group") as string) || "").trim() || null,
    notes: ((formData.get("notes") as string) || "").trim() || null,
  }
  return familySchema.safeParse(raw)
}

export async function createFamilyMember(_prev: FamilyFormState, formData: FormData): Promise<FamilyFormState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Enforce 6-member cap (PRD FM-01)
  const { count } = await supabase
    .from("family_members")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", user.id)
  if ((count ?? 0) >= 6) {
    return { error: "You can add up to 6 family members." }
  }

  const parsed = parseFormData(formData)
  if (!parsed.success) {
    return { error: "Please check the highlighted fields." }
  }

  const { error } = await supabase.from("family_members").insert({
    owner_id: user.id,
    ...parsed.data,
  })
  if (error) return { error: error.message }

  revalidatePath("/app/family")
  return { ok: true }
}

export async function deleteFamilyMember(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const id = String(formData.get("id") ?? "")
  if (!id) return
  await supabase.from("family_members").delete().eq("id", id).eq("owner_id", user.id)
  revalidatePath("/app/family")
}
