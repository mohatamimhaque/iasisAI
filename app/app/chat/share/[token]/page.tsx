import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: "Shared Conversation – RISA AI",
}

export default async function SharedChatPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const supabase = await createClient()

  const { data: conv } = await supabase
    .from("risa_conversations")
    .select("id, title, created_at, user_id")
    .eq("share_token", token)
    .eq("share_enabled", true)
    .single()

  if (!conv) notFound()

  const [{ data: msgs }, { data: profile }] = await Promise.all([
    supabase
      .from("risa_messages")
      .select("id, role, content, created_at")
      .eq("conversation_id", conv.id)
      .order("created_at", { ascending: true }),
    supabase.from("profiles").select("full_name").eq("id", conv.user_id).single(),
  ])

  const messages = msgs ?? []

  return (
    <div className="min-h-svh bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-2xl items-start justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Shared conversation</p>
            <h1 className="mt-0.5 text-base font-semibold text-foreground">{conv.title}</h1>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            {profile?.full_name && <p>Shared by {profile.full_name}</p>}
            <p>
              {new Date(conv.created_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
            <p>{messages.length} messages</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-8">
        <div className="flex flex-col gap-6">
          {messages.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">
              This conversation has no messages.
            </p>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {m.role === "assistant" && (
                <div className="mt-1 size-8 shrink-0 rounded-full bg-primary/5 overflow-hidden flex items-center justify-center p-1">
                  <img src="/svg/RISA.svg" alt="RISA AI" className="w-full h-full object-contain" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-4 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-primary/10 text-foreground"
                    : "border border-border bg-card text-foreground"
                }`}
              >
                {m.role === "assistant" ? (
                  <div
                    className="risa-html"
                    dangerouslySetInnerHTML={{ __html: m.content }}
                  />
                ) : (
                  <p className="whitespace-pre-wrap">{m.content}</p>
                )}
                <p className="mt-2 text-[11px] text-muted-foreground/60">
                  {new Date(m.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Conversation shared via{" "}
        <a
          href="https://risa.up.railway.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
        >
          <img src="/svg/RISA.svg" alt="" aria-hidden="true" className="h-3.5 w-auto" />
          RISA AI
        </a>
      </footer>
    </div>
  )
}
