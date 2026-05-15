"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

async function assertAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") throw new Error("Forbidden")
  const db = createAdminClient() ?? supabase
  return { supabase: db, userId: user.id }
}

export async function upsertPricingPlan(formData: FormData) {
  const { supabase, userId } = await assertAdmin()

  const id = String(formData.get("id") ?? "").trim()
  const name = String(formData.get("name") ?? "").trim()
  const price = String(formData.get("price") ?? "").trim()
  const cadence = String(formData.get("cadence") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()
  const featuresRaw = String(formData.get("features") ?? "")
  const features = featuresRaw
    .split("\n")
    .map((f) => f.trim())
    .filter(Boolean)
  const cta_label = String(formData.get("cta_label") ?? "Get started").trim()
  const cta_href = String(formData.get("cta_href") ?? "/auth/sign-up").trim()
  const is_highlighted = formData.get("is_highlighted") === "on"
  const is_active = formData.get("is_active") === "on"
  const order_index = Number(formData.get("order_index") ?? 0)

  if (!name || !price || !cadence) throw new Error("Name, price, and cadence are required")

  const payload = {
    name,
    price,
    cadence,
    description: description || null,
    features,
    cta_label,
    cta_href,
    is_highlighted,
    is_active,
    order_index,
    updated_by: userId,
    updated_at: new Date().toISOString(),
  }

  const { error } = id
    ? await supabase.from("pricing_plans").update(payload).eq("id", id)
    : await supabase.from("pricing_plans").insert(payload)

  if (error) throw new Error(error.message)
  revalidatePath("/admin/pricing")
  revalidatePath("/pricing")
}

export async function deletePricingPlan(id: string) {
  const { supabase } = await assertAdmin()
  const { error } = await supabase.from("pricing_plans").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/pricing")
  revalidatePath("/pricing")
}
