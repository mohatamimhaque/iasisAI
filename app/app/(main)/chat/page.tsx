import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { RisaLanding } from "@/components/chat/risa-landing"

export const metadata = {
  title: "RISA AI Chat",
  description: "A safe space for mental health support, reflection, and practical next steps.",
}

export default async function ChatPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const [{ data: convs }, { data: memory }] = await Promise.all([
    supabase
      .from("risa_conversations")
      .select("id, title, is_pinned, is_archived, updated_at")
      .eq("user_id", user.id)
      .eq("is_archived", false)
      .order("is_pinned", { ascending: false })
      .order("updated_at", { ascending: false })
      .limit(50),
    supabase
      .from("risa_memory")
      .select("id, content, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ])

  return (
    <RisaLanding
      conversations={convs ?? []}
      memory={memory ?? []}
      userId={user.id}
    />
  )
}
