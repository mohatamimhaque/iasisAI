import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import type { UIMessage } from "ai"
import { createClient } from "@/lib/supabase/server"
import { ChatThread } from "@/components/chat/chat-thread"

export const metadata = {
  title: "Chat",
}

export default async function ChatDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: thread } = await supabase
    .from("chat_threads")
    .select("id, title, ai_config_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()
  if (!thread) notFound()

  const { data: model } = thread.ai_config_id
    ? await supabase
        .from("ai_api_configs")
        .select("id, name, input_mode, is_active")
        .eq("id", thread.ai_config_id)
        .eq("is_active", true)
        .single()
    : { data: null }

  const { data: rows } = await supabase
    .from("chat_messages")
    .select("id, role, content, created_at")
    .eq("thread_id", id)
    .order("created_at", { ascending: true })

  const initialMessages: UIMessage[] = (rows ?? [])
    .filter((r) => r.role === "user" || r.role === "assistant")
    .map((r) => ({
      id: r.id,
      role: r.role as "user" | "assistant",
      parts: [{ type: "text", text: r.content }],
    }))

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border bg-background px-4 py-3 sm:px-8">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3">
          <Link
            href="/app/chat"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">All chats</span>
          </Link>
          <h1 className="ml-2 line-clamp-1 flex-1 text-sm font-medium text-foreground">{thread.title}</h1>
          {model?.name ? <span className="text-xs text-muted-foreground">{model.name}</span> : null}
        </div>
      </div>
      <ChatThread
        threadId={thread.id}
        initialMessages={initialMessages}
        aiConfigId={thread.ai_config_id ?? null}
        inputMode={model?.input_mode ?? "text"}
      />
    </div>
  )
}
