"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { randomUUID } from "crypto"
import { createClient } from "@/lib/supabase/server"

async function getAuthedUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")
  return { supabase, user }
}

export async function createConversation(_prev: unknown, formData: FormData) {
  const { supabase, user } = await getAuthedUser()
  const initialMessage = String(formData.get("message") ?? "").trim()
  const title = initialMessage.slice(0, 80) || "New conversation"

  const { data, error } = await supabase
    .from("risa_conversations")
    .insert({ user_id: user.id, title })
    .select("id")
    .single()

  if (error || !data) return { error: error?.message ?? "Failed to create" }

  revalidatePath("/app/chat")
  if (initialMessage) {
    redirect(`/app/chat/${data.id}?q=${encodeURIComponent(initialMessage)}`)
  }
  redirect(`/app/chat/${data.id}`)
}

export async function deleteConversation(id: string) {
  const { supabase, user } = await getAuthedUser()
  await supabase.from("risa_conversations").delete().eq("id", id).eq("user_id", user.id)
  revalidatePath("/app/chat")
  redirect("/app/chat")
}

export async function renameConversation(id: string, title: string) {
  const { supabase, user } = await getAuthedUser()
  await supabase
    .from("risa_conversations")
    .update({ title: title.slice(0, 100) })
    .eq("id", id)
    .eq("user_id", user.id)
  revalidatePath("/app/chat")
  revalidatePath(`/app/chat/${id}`)
}

export async function togglePinConversation(id: string, pinned: boolean) {
  const { supabase, user } = await getAuthedUser()
  await supabase
    .from("risa_conversations")
    .update({ is_pinned: pinned })
    .eq("id", id)
    .eq("user_id", user.id)
  revalidatePath("/app/chat")
}

export async function toggleArchiveConversation(id: string, archived: boolean) {
  const { supabase, user } = await getAuthedUser()
  await supabase
    .from("risa_conversations")
    .update({ is_archived: archived })
    .eq("id", id)
    .eq("user_id", user.id)
  revalidatePath("/app/chat")
}

export async function createShareLink(id: string): Promise<{ token?: string; error?: string }> {
  const { supabase, user } = await getAuthedUser()
  const token = randomUUID()
  const { error } = await supabase
    .from("risa_conversations")
    .update({ share_token: token, share_enabled: true })
    .eq("id", id)
    .eq("user_id", user.id)
  if (error) return { error: error.message }
  revalidatePath(`/app/chat/${id}`)
  return { token }
}

export async function revokeShareLink(id: string) {
  const { supabase, user } = await getAuthedUser()
  await supabase
    .from("risa_conversations")
    .update({ share_enabled: false, share_token: null })
    .eq("id", id)
    .eq("user_id", user.id)
  revalidatePath(`/app/chat/${id}`)
}

export async function addMemoryEntry(content: string) {
  const { supabase, user } = await getAuthedUser()
  if (!content.trim()) return { error: "Content required" }
  await supabase.from("risa_memory").insert({ user_id: user.id, content: content.trim() })
  revalidatePath("/app/chat")
}

export async function deleteMemoryEntry(id: string) {
  const { supabase, user } = await getAuthedUser()
  await supabase.from("risa_memory").delete().eq("id", id).eq("user_id", user.id)
  revalidatePath("/app/chat")
}

export async function clearMemory() {
  const { supabase, user } = await getAuthedUser()
  await supabase.from("risa_memory").delete().eq("user_id", user.id)
  revalidatePath("/app/chat")
}
