"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

async function assertAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") throw new Error("Forbidden")
  return { supabase, userId: user.id }
}

export async function upsertSiteConfig(formData: FormData) {
  const { supabase, userId } = await assertAdmin()

  const key = String(formData.get("key") ?? "").trim()
  const value = String(formData.get("value") ?? "")
  const label = String(formData.get("label") ?? "").trim() || null
  const category = String(formData.get("category") ?? "general").trim()
  const value_type = String(formData.get("value_type") ?? "text").trim()

  if (!key) throw new Error("Key is required")

  const { error } = await supabase.from("site_config").upsert(
    {
      key,
      value,
      label,
      category,
      value_type,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  )
  if (error) throw new Error(error.message)
  revalidatePath("/admin/system")
}

export async function deleteSiteConfig(key: string) {
  const { supabase } = await assertAdmin()
  const { error } = await supabase.from("site_config").delete().eq("key", key)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/system")
}

export async function upsertAiConfig(formData: FormData) {
  const { supabase, userId } = await assertAdmin()

  const id = String(formData.get("id") ?? "").trim()
  const name = String(formData.get("name") ?? "").trim()
  const api_endpoint = String(formData.get("api_endpoint") ?? "").trim()
  const input_mode = String(formData.get("input_mode") ?? "text").trim()
  const timeout_ms = Number(formData.get("timeout_ms") ?? 30000)
  const module = String(formData.get("module") ?? "").trim()
  const is_active = formData.get("is_active") === "on"

  if (!name || !api_endpoint || !module) throw new Error("Name, module, and API URL are required")

  const allowedModules = new Set(["chat", "triage"])
  if (!allowedModules.has(module)) throw new Error("Invalid module")

  const payload = {
    name,
    input_mode,
    api_endpoint,
    timeout_ms,
    provider: "custom-api",
    model: name,
    module,
    is_active,
    created_by: userId,
    updated_at: new Date().toISOString(),
  }

  if (!id) {
    const { data: existing } = await supabase
      .from("ai_api_configs")
      .select("id")
      .eq("module", module)
      .limit(1)

    if (existing && existing.length > 0) {
      throw new Error(`Only one ${module} API configuration is allowed`)
    }
  }

  const { error } = id
    ? await supabase.from("ai_api_configs").update(payload).eq("id", id)
    : await supabase.from("ai_api_configs").insert(payload)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/system")
  revalidatePath("/admin/ai-models")
}

export async function deleteAiConfig(id: string) {
  const { supabase } = await assertAdmin()
  const { error } = await supabase.from("ai_api_configs").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/system")
  revalidatePath("/admin/ai-models")
}
