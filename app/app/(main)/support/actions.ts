"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

const CATEGORIES = ["billing", "medical_record", "account_access", "complaint", "other"] as const

export async function submitTicket(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const category = String(formData.get("category") ?? "")
  const subject = String(formData.get("subject") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()

  if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
    throw new Error("Pick a valid category")
  }
  if (!subject) throw new Error("Subject is required")
  if (!description) throw new Error("Tell us a bit more about the issue")

  const { error } = await supabase.from("support_tickets").insert({
    user_id: user.id,
    category,
    subject,
    description,
    status: "open",
    priority: "P2",
  })
  if (error) throw new Error(error.message)

  revalidatePath("/app/support")
}

export async function updateTicketStatus(id: string, status: "open" | "in_progress" | "resolved" | "closed") {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") throw new Error("Forbidden")

  const { error } = await supabase.from("support_tickets").update({ status }).eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/support")
}
