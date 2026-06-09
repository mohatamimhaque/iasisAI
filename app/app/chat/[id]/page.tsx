import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { RisaConversation } from "@/components/chat/risa-conversation"

export const metadata = { title: "RISA AI" }

export default async function ChatConversationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ q?: string }>
}) {
  const [{ id }, sp] = await Promise.all([params, searchParams])
  const q = sp.q ?? null

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const [{ data: conv }, { data: msgs }, { data: allConvs }, { data: memory }] =
    await Promise.all([
      supabase
        .from("risa_conversations")
        .select(
          "id, title, backend_session_id, is_pinned, is_archived, share_enabled, share_token"
        )
        .eq("id", id)
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("risa_messages")
        .select("id, role, content, feedback, created_at")
        .eq("conversation_id", id)
        .order("created_at", { ascending: true }),
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

  if (!conv) notFound()

  return (
    <>
      <RisaConversation
      conversation={conv}
      messages={
        (msgs ?? []) as Array<{
          id: string
          role: "user" | "assistant"
          content: string
          feedback?: "up" | "down" | null
          created_at: string
        }>
      }
      conversations={allConvs ?? []}
      memory={memory ?? []}
      userId={user.id}
      initialQ={q}
    />
    </>
  )
}
