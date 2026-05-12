"use client"

import { useEffect, useRef, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type UIMessage } from "ai"
import { ArrowUp, ShieldCheck, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type Props = {
  threadId: string
  initialMessages: UIMessage[]
  aiConfigId?: string | null
  inputMode?: "text" | "image" | "both"
}

function MessageBubble({ message }: { message: UIMessage }) {
  const text =
    message.parts
      ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("") ?? ""

  const isUser = message.role === "user"

  return (
    <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      {!isUser ? (
        <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="size-4" />
        </div>
      ) : null}
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[75%]",
          isUser ? "bg-primary text-primary-foreground" : "bg-card text-foreground border border-border",
        )}
      >
        <div className="whitespace-pre-wrap">{text || "…"}</div>
      </div>
    </div>
  )
}

export function ChatThread({ threadId, initialMessages, aiConfigId = null, inputMode = "text" }: Props) {
  const [input, setInput] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status, error, setMessages, clearError } = useChat({
    id: threadId,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/ai/chat",
      prepareSendMessagesRequest: ({ messages }) => ({
        body: { messages, threadId, aiConfigId, imageUrl: imageUrl || null },
      }),
    }),
  })

  useEffect(() => {
    if (!error) return
    const messageText = error.message || "AI service is unavailable. Please try again."

    setMessages((prev) => [
      ...prev,
      {
        id: `err_${crypto.randomUUID()}`,
        role: "assistant",
        parts: [{ type: "text", text: messageText }],
      },
    ])
    clearError()
  }, [error, setMessages, clearError])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  const isStreaming = status === "streaming" || status === "submitted"
  const canSend = input.trim().length > 0 && !isStreaming

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!canSend) return
    const text = input.trim()
    setInput("")
    await sendMessage({ text })
  }

  return (
    <div className="flex h-[calc(100svh-8rem)] flex-col lg:h-[calc(100svh-4rem)]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
          {messages.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center">
              <span className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Sparkles className="size-5" />
              </span>
              <h2 className="mt-4 font-serif text-2xl text-foreground">How can Iasis help?</h2>
              <p className="mx-auto mt-2 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
                Ask anything about your health, medicines, lab reports or symptoms. Iasis is private and never shares
                what you say.
              </p>
            </div>
          ) : (
            messages.map((m) => <MessageBubble key={m.id} message={m} />)
          )}
        </div>
      </div>

      <div className="border-t border-border bg-background/95 px-4 py-4 backdrop-blur sm:px-8">
        <form onSubmit={handleSend} className="mx-auto flex w-full max-w-3xl flex-col gap-2">
          {inputMode !== "text" ? (
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Image URL (optional)"
              className="h-10"
              disabled={isStreaming}
            />
          ) : null}
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm focus-within:border-primary/50">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  void handleSend(e)
                }
              }}
              placeholder="Ask Iasis a health question…"
              rows={1}
              className="min-h-[42px] resize-none border-0 bg-transparent p-2 text-base shadow-none focus-visible:ring-0"
              disabled={isStreaming}
            />
            <Button type="submit" size="icon" disabled={!canSend} aria-label="Send message">
              <ArrowUp className="size-4" />
            </Button>
          </div>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3" />
            Iasis is not a doctor. In emergencies, call <strong className="font-medium text-foreground">999</strong>.
          </p>
        </form>
      </div>
    </div>
  )
}
