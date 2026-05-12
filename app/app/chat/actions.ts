"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function createChatThread(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const aiConfigId = String(formData.get("ai_config_id") ?? "").trim() || null

  const { data, error } = await supabase
    .from("chat_threads")
    .insert({ user_id: user.id, title: "New conversation", ai_config_id: aiConfigId })
    .select("id")
    .single()
  if (error || !data) throw new Error(error?.message ?? "Could not create chat")
  revalidatePath("/app/chat")
  redirect(`/app/chat/${data.id}`)
}

export async function deleteChatThread(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  await supabase.from("chat_threads").delete().eq("id", id).eq("user_id", user.id)
  revalidatePath("/app/chat")
  redirect("/app/chat")
}
