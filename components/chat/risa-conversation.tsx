"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowUp,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  Copy,
  Link2,
  Mic,
  MicOff,
  MoreHorizontal,
  Pin,
  PinOff,
  Plus,
  RotateCcw,
  Search,
  Share2,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  Volume2,
  VolumeX,
  X,
  Archive,
  ArchiveRestore,
  Pencil,
  MessageCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  renameConversation,
  deleteConversation,
  togglePinConversation,
  toggleArchiveConversation,
  createShareLink,
  revokeShareLink,
  addMemoryEntry,
  deleteMemoryEntry,
  clearMemory,
} from "@/app/app/chat/actions"

// ─── Types ───────────────────────────────────────────────────────────────────

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  feedback?: "up" | "down" | null
  created_at: string
}

type Conversation = {
  id: string
  title: string
  backend_session_id?: string | null
  is_pinned: boolean
  is_archived: boolean
  share_enabled?: boolean
  share_token?: string | null
}

type ConversationListItem = {
  id: string
  title: string
  is_pinned: boolean
  is_archived: boolean
  updated_at: string
}

type MemoryEntry = {
  id: string
  content: string
  created_at: string
}

type Props = {
  conversation: Conversation
  messages: Message[]
  conversations: ConversationListItem[]
  memory: MemoryEntry[]
  userId: string
  initialQ: string | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function relTime(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return "just now"
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 30) return `${day}d ago`
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}

function getSuggestions(html: string, lang: string): string[] {
  const isBn = lang === "bn" || lang.startsWith("bn") || /[ঀ-৿]/.test(html)
  if (isBn) {
    return ["আরও বলি", "কী কারণে এমন হচ্ছে?", "কিছু করণীয় বলো", "একটি পরিকল্পনা তৈরি করি"]
  }
  const lower = html.toLowerCase()
  const out: string[] = []
  if (/breath|anxiety|panic/.test(lower)) out.push("Walk me through a breathing exercise")
  if (/sleep|insomnia/.test(lower)) out.push("How can I improve my sleep tonight?")
  if (/stress|overwhelm|burnout/.test(lower)) out.push("What's one small step I can take right now?")
  if (/therapy|professional|counsell/.test(lower)) out.push("How do I find professional support?")
  const defaults = [
    "Tell me more about this",
    "What triggered these feelings?",
    "Give me practical coping steps",
    "Help me make a plan",
  ]
  for (const d of defaults) {
    if (out.length >= 3) break
    if (!out.includes(d)) out.push(d)
  }
  return out.slice(0, 4)
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingIndicator({ seconds }: { seconds: number }) {
  const msg =
    seconds >= 8
      ? "Thank you for waiting. I'm still processing your message."
      : seconds >= 2
        ? "Still working on a thoughtful response…"
        : null

  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 size-8 shrink-0 rounded-full bg-primary/5 overflow-hidden flex items-center justify-center p-1">
        <img src="/svg/RISA.svg" alt="RISA AI" className="w-full h-full object-contain" />
      </div>
      <div className="rounded-2xl border border-border bg-card px-5 py-4">
        {msg ? (
          <p className="text-sm text-muted-foreground">{msg}</p>
        ) : (
          <div className="flex items-center gap-1.5" role="status" aria-label="RISA AI is thinking">
            <span className="risa-dot" />
            <span className="risa-dot risa-dot-2" />
            <span className="risa-dot risa-dot-3" />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Streaming bubble ─────────────────────────────────────────────────────────

function StreamingBubble({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 size-8 shrink-0 rounded-full bg-primary/5 overflow-hidden flex items-center justify-center p-1">
        <img src="/svg/RISA.svg" alt="RISA AI" className="w-full h-full object-contain" />
      </div>
      <div className="rounded-2xl border border-border bg-card px-5 py-4 text-sm leading-relaxed text-foreground max-w-[85%] sm:max-w-[80%]">
        <span className="whitespace-pre-wrap">{text}</span>
        <span className="risa-cursor" aria-hidden="true" />
      </div>
    </div>
  )
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({
  message,
  searchQuery,
  onFeedback,
  onSpeak,
  onRegenerate,
  isLast,
  isSpeaking,
  speakingId,
}: {
  message: Message
  searchQuery: string
  onFeedback: (id: string, f: "up" | "down" | null) => void
  onSpeak: (id: string, text: string) => void
  onRegenerate: () => void
  isLast: boolean
  isSpeaking: boolean
  speakingId: string | null
}) {
  const isUser = message.role === "user"
  const [copied, setCopied] = useState(false)
  const [localFeedback, setLocalFeedback] = useState(message.feedback)
  const thisSpeaking = isSpeaking && speakingId === message.id

  const plainText = isUser
    ? message.content
    : message.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()

  const handleCopy = () => {
    navigator.clipboard.writeText(plainText).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFeedback = (f: "up" | "down") => {
    const next = localFeedback === f ? null : f
    setLocalFeedback(next)
    onFeedback(message.id, next)
  }

  const highlight = (text: string) => {
    if (!searchQuery.trim()) return text
    const esc = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    return text.replace(
      new RegExp(`(${esc})`, "gi"),
      '<mark class="risa-search-mark">$1</mark>'
    )
  }

  const formattedTime = new Date(message.created_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div
      className={cn(
        "risa-message group flex gap-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {!isUser && (
        <div className="mt-1 size-8 shrink-0 rounded-full bg-primary/5 overflow-hidden flex items-center justify-center p-1">
          <img src="/svg/RISA.svg" alt="RISA AI" className="w-full h-full object-contain" />
        </div>
      )}
      <div
        className={cn(
          "flex max-w-[85%] flex-col gap-1.5 sm:max-w-[80%]",
          isUser && "items-end"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-5 py-4 text-sm leading-relaxed",
            isUser
              ? "bg-primary/10 text-foreground"
              : "border border-border bg-card text-foreground"
          )}
        >
          {isUser ? (
            <p
              className="whitespace-pre-wrap"
              dangerouslySetInnerHTML={
                searchQuery
                  ? {
                      __html: highlight(
                        message.content
                          .replace(/&/g, "&amp;")
                          .replace(/</g, "&lt;")
                          .replace(/>/g, "&gt;")
                      ),
                    }
                  : undefined
              }
            >
              {!searchQuery ? message.content : undefined}
            </p>
          ) : (
            <div
              className="risa-html"
              dangerouslySetInnerHTML={{
                __html: searchQuery
                  ? (() => {
                      const esc = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
                      return message.content.replace(
                        new RegExp(`(?![^<]*>)(${esc})`, "gi"),
                        '<mark class="risa-search-mark">$1</mark>'
                      )
                    })()
                  : message.content,
              }}
            />
          )}
          <p className="mt-2 select-none text-[11px] text-muted-foreground/60">
            {formattedTime}
          </p>
        </div>

        {!isUser && (
          <div className="flex items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-within:opacity-100">
            <button
              onClick={() => handleFeedback("up")}
              className={cn(
                "rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary",
                localFeedback === "up" && "text-emerald-600"
              )}
              aria-label="Helpful"
              title="Helpful"
            >
              <ThumbsUp className="size-3.5" />
            </button>
            <button
              onClick={() => handleFeedback("down")}
              className={cn(
                "rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary",
                localFeedback === "down" && "text-rose-500"
              )}
              aria-label="Not helpful"
              title="Not helpful"
            >
              <ThumbsDown className="size-3.5" />
            </button>
            <button
              onClick={handleCopy}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary"
              aria-label="Copy"
              title="Copy"
            >
              {copied ? (
                <CheckCircle2 className="size-3.5 text-emerald-600" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </button>
            <button
              onClick={() => onSpeak(message.id, plainText)}
              className={cn(
                "rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary",
                thisSpeaking && "text-primary"
              )}
              aria-label={thisSpeaking ? "Stop speaking" : "Listen"}
              title={thisSpeaking ? "Stop" : "Listen"}
            >
              {thisSpeaking ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
            </button>
            {isLast && (
              <button
                onClick={onRegenerate}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary"
                aria-label="Regenerate"
                title="Regenerate"
              >
                <RotateCcw className="size-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Sidebar (conversation list) ──────────────────────────────────────────────

function ConversationSidebar({
  conversations,
  activeId,
  onClose,
}: {
  conversations: ConversationListItem[]
  activeId: string
  onClose: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const pinned = conversations.filter((c) => c.is_pinned)
  const recent = conversations.filter((c) => !c.is_pinned)

  const handlePin = (id: string, currently: boolean) => {
    startTransition(() => togglePinConversation(id, !currently))
  }

  const handleDelete = (id: string) => {
    if (!confirm("Delete this conversation?")) return
    startTransition(() => deleteConversation(id))
  }

  const Group = ({
    label,
    items,
  }: {
    label: string
    items: ConversationListItem[]
  }) => {
    if (!items.length) return null
    return (
      <div>
        <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <ul className="space-y-0.5">
          {items.map((c) => (
            <li key={c.id} className="group relative">
              <Link
                href={`/app/chat/${c.id}`}
                onClick={onClose}
                className={cn(
                  "flex min-w-0 items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors",
                  c.id === activeId
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-foreground hover:bg-secondary/60"
                )}
              >
                {c.is_pinned && <Pin className="size-3 shrink-0 text-muted-foreground" />}
                <span className="min-w-0 flex-1 truncate">{c.title}</span>
                <span className="shrink-0 text-[10px] text-muted-foreground">
                  {relTime(c.updated_at)}
                </span>
              </Link>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden items-center gap-0.5 group-hover:flex">
                <button
                  onClick={() => handlePin(c.id, c.is_pinned)}
                  className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-secondary"
                  title={c.is_pinned ? "Unpin" : "Pin"}
                >
                  {c.is_pinned ? <PinOff className="size-3" /> : <Pin className="size-3" />}
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="rounded p-1 text-muted-foreground hover:text-rose-500 hover:bg-secondary"
                  title="Delete"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-3 py-3">
        <p className="text-sm font-semibold text-foreground">Conversations</p>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-muted-foreground hover:bg-secondary lg:hidden"
          aria-label="Close sidebar"
        >
          <X className="size-4" />
        </button>
      </div>
      <Link
        href="/app/chat"
        onClick={onClose}
        className="mx-3 mb-3 flex items-center gap-2 rounded-xl border border-dashed border-border px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
      >
        <Plus className="size-4" />
        New conversation
      </Link>
      <div className="flex-1 space-y-4 overflow-y-auto px-1.5 pb-4">
        <Group label="Pinned" items={pinned} />
        <Group label="Recent" items={recent} />
        {conversations.length === 0 && (
          <p className="px-3 text-xs text-muted-foreground">No conversations yet.</p>
        )}
      </div>
    </div>
  )
}

// ─── Memory panel ─────────────────────────────────────────────────────────────

function MemoryPanel({
  memory,
  onClose,
}: {
  memory: MemoryEntry[]
  onClose: () => void
}) {
  const [newEntry, setNewEntry] = useState("")
  const [isPending, startTransition] = useTransition()
  const [localMemory, setLocalMemory] = useState(memory)

  const handleAdd = () => {
    if (!newEntry.trim()) return
    const optimistic: MemoryEntry = {
      id: `tmp-${Date.now()}`,
      content: newEntry.trim(),
      created_at: new Date().toISOString(),
    }
    setLocalMemory((prev) => [optimistic, ...prev])
    const content = newEntry.trim()
    setNewEntry("")
    startTransition(() => addMemoryEntry(content))
  }

  const handleDelete = (id: string) => {
    setLocalMemory((prev) => prev.filter((m) => m.id !== id))
    startTransition(() => deleteMemoryEntry(id))
  }

  const handleClear = () => {
    if (!confirm("Clear all memory entries?")) return
    setLocalMemory([])
    startTransition(() => clearMemory())
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Brain className="size-4 text-primary" />
          <p className="text-sm font-semibold text-foreground">My Memory</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-muted-foreground hover:bg-secondary"
          aria-label="Close memory panel"
        >
          <X className="size-4" />
        </button>
      </div>
      <div className="p-4">
        <p className="mb-3 text-xs text-muted-foreground">
          Notes you save here are private to you and can be referenced in conversations.
        </p>
        <div className="flex gap-2">
          <input
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Add a note…"
            className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
          />
          <button
            onClick={handleAdd}
            disabled={!newEntry.trim() || isPending}
            className="rounded-xl bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {localMemory.length === 0 ? (
          <p className="text-xs text-muted-foreground">No memory entries yet.</p>
        ) : (
          <ul className="space-y-2">
            {localMemory.map((m) => (
              <li
                key={m.id}
                className="group flex items-start gap-2 rounded-xl border border-border bg-card px-3 py-2.5"
              >
                <p className="flex-1 text-sm text-foreground">{m.content}</p>
                <button
                  onClick={() => handleDelete(m.id)}
                  className="shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-rose-500"
                  aria-label="Delete"
                >
                  <X className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {localMemory.length > 0 && (
        <div className="border-t border-border p-4">
          <button
            onClick={handleClear}
            className="text-xs text-muted-foreground hover:text-rose-500"
          >
            Clear all memory
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function RisaConversation({
  conversation,
  messages: initialMessages,
  conversations,
  memory,
  userId,
  initialQ,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const recogRef = useRef<SpeechRecognition | null>(null)

  // ─ State ─
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamText, setStreamText] = useState("")
  const [streamLang, setStreamLang] = useState("en")
  const [thinkSecs, setThinkSecs] = useState(0)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [convMeta, setConvMeta] = useState({
    convId: conversation.id,
    backendSessionId: conversation.backend_session_id || null,
  })
  const [showSidebar, setShowSidebar] = useState(false)
  const [showMemory, setShowMemory] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchIndex, setSearchIndex] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speakingId, setSpeakingId] = useState<string | null>(null)
  const [shareState, setShareState] = useState<{
    enabled: boolean
    token: string | null
    copied: boolean
  }>({
    enabled: conversation.share_enabled ?? false,
    token: conversation.share_token ?? null,
    copied: false,
  })
  const [showConvMenu, setShowConvMenu] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(conversation.title)
  const [convTitle, setConvTitle] = useState(conversation.title)
  const [isPinned, setIsPinned] = useState(conversation.is_pinned)
  const isInitialSent = useRef(false)

  // ─ Scroll to bottom ─
  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      })
    })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamText, scrollToBottom])

  // ─ Thinking timer ─
  useEffect(() => {
    if (!isStreaming) {
      setThinkSecs(0)
      return
    }
    const id = setInterval(() => setThinkSecs((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [isStreaming])

  // ─ Auto-send initial query from URL ─
  useEffect(() => {
    if (!initialQ || isInitialSent.current || messages.length !== 0) return
    setInput(initialQ)
    // Set the flag inside the callback so StrictMode double-invoke doesn't
    // consume the guard before the timeout actually fires.
    const tid = setTimeout(() => {
      if (isInitialSent.current) return
      isInitialSent.current = true
      sendMessage(initialQ)
    }, 200)
    return () => clearTimeout(tid)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQ])

  // ─ Send message ─
  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || isStreaming) return

      setInput("")
      setSuggestions([])

      const userMsg: Message = {
        id: `tmp-user-${Date.now()}`,
        role: "user",
        content: trimmed,
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, userMsg])
      setIsStreaming(true)
      setStreamText("")

      try {
        const res = await fetch("/api/risa/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            backend_session_id: convMeta.backendSessionId,
            conversation_id: convMeta.convId,
          }),
        })

        if (!res.ok || !res.body) {
          throw new Error("Stream failed")
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buf = ""
        let accText = ""
        let finalHtml = ""
        let lang = "en"
        let meta: { conv_id: string; backend_session_id: string } | null = null

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buf += decoder.decode(value, { stream: true })
          const parts = buf.split("\n\n")
          buf = parts.pop() ?? ""
          for (const part of parts) {
            if (!part.startsWith("data: ")) continue
            const jsonStr = part.slice(6).trim()
            try {
              const ev = JSON.parse(jsonStr) as Record<string, unknown>
              if (ev._meta) {
                meta = ev._meta as { conv_id: string; backend_session_id: string }
              } else if (ev.done) {
                finalHtml = (ev.html as string) || ""
                lang = (ev.lang as string) || "en"
              } else if (ev.t) {
                accText += ev.t as string
                setStreamText(accText)
                setStreamLang((ev.lang as string) || "en")
              }
            } catch {}
          }
        }

        // Replace streaming bubble with final HTML message
        const assistantMsg: Message = {
          id: `tmp-asst-${Date.now()}`,
          role: "assistant",
          content: finalHtml || `<p class="rc-p">${accText}</p>`,
          created_at: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, assistantMsg])
        setStreamText("")

        // Update conv meta if new conversation was created
        if (meta) {
          setConvMeta({
            convId: meta.conv_id,
            backendSessionId: meta.backend_session_id,
          })
          // Navigate to the new conversation URL if different
          if (meta.conv_id !== conversation.id) {
            router.replace(`/app/chat/${meta.conv_id}`)
          }
        }

        // Show follow-up suggestions with a short delay
        const newSuggestions = getSuggestions(finalHtml, lang)
        setTimeout(() => setSuggestions(newSuggestions), 350)
      } catch (err) {
        console.error("[chat] stream error:", err)
        const errMsg: Message = {
          id: `err-${Date.now()}`,
          role: "assistant",
          content:
            "<p class=\"rc-p\">I'm sorry, I had trouble responding. Please try sending your message again.</p>",
          created_at: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, errMsg])
        setStreamText("")
      } finally {
        setIsStreaming(false)
      }
    },
    [convMeta, conversation.id, isStreaming, router]
  )

  // ─ Regenerate ─
  const handleRegenerate = useCallback(() => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user")
    if (!lastUser) return
    // Remove last assistant message and re-send
    setMessages((prev) => {
      const idx = [...prev].reverse().findIndex((m) => m.role === "assistant")
      if (idx === -1) return prev
      const arr = [...prev]
      arr.splice(arr.length - 1 - idx, 1)
      return arr
    })
    sendMessage(lastUser.content)
  }, [messages, sendMessage])

  // ─ Feedback ─
  const handleFeedback = useCallback(
    (id: string, f: "up" | "down" | null) => {
      fetch("/api/risa/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message_id: id, feedback: f }),
      }).catch(() => {})
    },
    []
  )

  // ─ TTS ─
  const handleSpeak = useCallback(
    (id: string, text: string) => {
      if (!("speechSynthesis" in window)) return
      if (isSpeaking && speakingId === id) {
        window.speechSynthesis.cancel()
        setIsSpeaking(false)
        setSpeakingId(null)
        return
      }
      window.speechSynthesis.cancel()
      const utt = new SpeechSynthesisUtterance(text)
      utt.lang = streamLang.startsWith("bn") ? "bn-BD" : "en-US"
      utt.rate = 0.95
      utt.onstart = () => {
        setIsSpeaking(true)
        setSpeakingId(id)
      }
      utt.onend = () => {
        setIsSpeaking(false)
        setSpeakingId(null)
      }
      window.speechSynthesis.speak(utt)
    },
    [isSpeaking, speakingId, streamLang]
  )

  // ─ STT ─
  const toggleListening = useCallback(() => {
    const SR =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognition }).webkitSpeechRecognition
    if (!SR) {
      alert("Speech recognition is not supported in this browser.")
      return
    }

    if (isListening) {
      recogRef.current?.stop()
      setIsListening(false)
      return
    }

    const recog = new SR()
    recog.lang = "bn-BD,en-US"
    recog.interimResults = true
    recog.continuous = false
    recog.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join("")
      setInput(transcript)
    }
    recog.onend = () => setIsListening(false)
    recog.onerror = () => setIsListening(false)
    recogRef.current = recog
    recog.start()
    setIsListening(true)
  }, [isListening])

  // ─ Share ─
  const handleShare = async () => {
    if (shareState.enabled && shareState.token) {
      const url = `${window.location.origin}/app/chat/share/${shareState.token}`
      await navigator.clipboard.writeText(url).catch(() => {})
      setShareState((s) => ({ ...s, copied: true }))
      setTimeout(() => setShareState((s) => ({ ...s, copied: false })), 2000)
      return
    }
    const result = await createShareLink(convMeta.convId)
    if (result.token) {
      setShareState({ enabled: true, token: result.token, copied: false })
    }
  }

  const handleRevokeShare = async () => {
    await revokeShareLink(convMeta.convId)
    setShareState({ enabled: false, token: null, copied: false })
  }

  // ─ Rename ─
  const handleRename = () => {
    if (!renameValue.trim() || renameValue === convTitle) {
      setIsRenaming(false)
      return
    }
    const t = renameValue.trim()
    setConvTitle(t)
    setIsRenaming(false)
    startTransition(() => renameConversation(convMeta.convId, t))
  }

  // ─ Submit on Enter ─
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  // ─ Search navigation ─
  const handleSearchNav = (dir: 1 | -1) => {
    if (!searchQuery.trim()) return
    setSearchIndex((i) => Math.max(0, i + dir))
  }

  // ─ Close menus on outside click ─
  useEffect(() => {
    const close = () => setShowConvMenu(false)
    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [])

  const lastAssistantIdx = messages.reduce(
    (acc, m, i) => (m.role === "assistant" ? i : acc),
    -1
  )

  // ─ Render ─
  return (
    <div className="flex h-[calc(100svh-4rem)] overflow-hidden">
      {/* Sidebar overlay (mobile) */}
      {showSidebar && (
        <div
          className="fixed inset-0 z-20 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r border-border bg-background transition-transform duration-200 ease-out lg:static lg:translate-x-0 lg:z-auto",
          showSidebar ? "translate-x-0" : "-translate-x-full",
          // Account for app shell sidebar
          "lg:top-0"
        )}
      >
        <ConversationSidebar
          conversations={conversations}
          activeId={convMeta.convId}
          onClose={() => setShowSidebar(false)}
        />
      </aside>

      {/* Main chat area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="flex shrink-0 items-center gap-2 border-b border-border bg-background/95 px-3 py-2.5 backdrop-blur">
          <button
            onClick={() => setShowSidebar(true)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-secondary lg:hidden"
            aria-label="Open conversations"
          >
            <MessageCircle className="size-4" />
          </button>
          <Link
            href="/app/chat"
            className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"
            aria-label="All conversations"
          >
            <ChevronLeft className="size-4" />
          </Link>

          {isRenaming ? (
            <input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename()
                if (e.key === "Escape") setIsRenaming(false)
              }}
              autoFocus
              className="flex-1 rounded-lg border border-primary/50 bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none"
            />
          ) : (
            <button
              onClick={() => setIsRenaming(true)}
              className="flex-1 truncate text-left text-sm font-medium text-foreground hover:text-primary"
              title="Rename conversation"
            >
              {convTitle}
            </button>
          )}

          <div className="flex items-center gap-1">
            {/* Search */}
            <button
              onClick={() => setShowSearch((s) => !s)}
              className={cn(
                "rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary",
                showSearch && "bg-secondary text-foreground"
              )}
              aria-label="Search in conversation"
            >
              <Search className="size-4" />
            </button>

            {/* Memory */}
            <button
              onClick={() => setShowMemory((s) => !s)}
              className={cn(
                "rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary",
                showMemory && "bg-secondary text-foreground"
              )}
              aria-label="My memory"
            >
              <Brain className="size-4" />
            </button>

            {/* More menu */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowConvMenu((s) => !s)
                }}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary"
                aria-label="More options"
              >
                <MoreHorizontal className="size-4" />
              </button>
              {showConvMenu && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-full z-50 mt-1 w-48 rounded-2xl border border-border bg-card py-1.5 shadow-lg"
                >
                  <button
                    onClick={() => {
                      handleShare()
                      setShowConvMenu(false)
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-secondary/60"
                  >
                    {shareState.copied ? (
                      <CheckCircle2 className="size-4 text-emerald-600" />
                    ) : (
                      <Share2 className="size-4" />
                    )}
                    {shareState.copied ? "Link copied!" : shareState.enabled ? "Copy share link" : "Share conversation"}
                  </button>
                  {shareState.enabled && (
                    <button
                      onClick={() => {
                        handleRevokeShare()
                        setShowConvMenu(false)
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-secondary/60"
                    >
                      <Link2 className="size-4" />
                      Revoke share link
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsPinned((p) => !p)
                      startTransition(() => togglePinConversation(convMeta.convId, !isPinned))
                      setShowConvMenu(false)
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-secondary/60"
                  >
                    {isPinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
                    {isPinned ? "Unpin" : "Pin"} conversation
                  </button>
                  <button
                    onClick={() => {
                      startTransition(() => toggleArchiveConversation(convMeta.convId, true))
                      setShowConvMenu(false)
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-secondary/60"
                  >
                    <Archive className="size-4" />
                    Archive
                  </button>
                  <div className="my-1 border-t border-border" />
                  <button
                    onClick={() => {
                      setShowConvMenu(false)
                      startTransition(() => deleteConversation(convMeta.convId))
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-rose-500 hover:bg-secondary/60"
                  >
                    <Trash2 className="size-4" />
                    Delete conversation
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Search bar */}
        {showSearch && (
          <div className="flex items-center gap-2 border-b border-border bg-background px-4 py-2">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setSearchIndex(0)
              }}
              placeholder="Search in conversation…"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            {searchQuery && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <button onClick={() => handleSearchNav(-1)} className="rounded p-1 hover:bg-secondary">
                  ↑
                </button>
                <button onClick={() => handleSearchNav(1)} className="rounded p-1 hover:bg-secondary">
                  ↓
                </button>
                <button
                  onClick={() => {
                    setSearchQuery("")
                    setShowSearch(false)
                  }}
                  className="ml-1 rounded p-1 hover:bg-secondary"
                >
                  <X className="size-3" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-6 sm:px-6"
        >
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
            {messages.length === 0 && !isStreaming && (
              <div className="py-12 text-center">
                <p className="text-sm text-muted-foreground">
                  Start your conversation below.
                </p>
              </div>
            )}
            {messages.map((m, i) => (
              <MessageBubble
                key={m.id}
                message={m}
                searchQuery={searchQuery}
                onFeedback={handleFeedback}
                onSpeak={handleSpeak}
                onRegenerate={handleRegenerate}
                isLast={i === lastAssistantIdx && m.role === "assistant"}
                isSpeaking={isSpeaking}
                speakingId={speakingId}
              />
            ))}

            {/* Streaming state */}
            {isStreaming && streamText === "" && <TypingIndicator seconds={thinkSecs} />}
            {isStreaming && streamText !== "" && <StreamingBubble text={streamText} />}

            {/* Speaking indicator */}
            {isSpeaking && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Volume2 className="size-3.5 text-primary" />
                <span className="risa-wave">▁▂▃▄▃▂▁</span>
                <span>Speaking…</span>
              </div>
            )}

            {/* Follow-up suggestions */}
            {!isStreaming && suggestions.length > 0 && (
              <div className="risa-suggestions flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setSuggestions([])
                      sendMessage(s)
                    }}
                    className="rounded-full border border-border bg-card px-4 py-1.5 text-sm text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Input area */}
        <div className="shrink-0 border-t border-border bg-background/95 px-4 py-4 backdrop-blur sm:px-6">
          <div className="mx-auto w-full max-w-2xl">
            <div className="flex items-end gap-2 rounded-2xl border border-border bg-card px-3 py-2.5 shadow-sm transition-colors focus-within:border-primary/40">
              {/* Voice button */}
              <button
                onClick={toggleListening}
                className={cn(
                  "mb-0.5 rounded-xl p-2 text-muted-foreground transition-colors hover:bg-secondary",
                  isListening && "text-rose-500 animate-pulse"
                )}
                aria-label={isListening ? "Stop listening" : "Speak"}
                title={isListening ? "Stop" : "Speak"}
              >
                {isListening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
              </button>

              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="How are you feeling today?"
                rows={1}
                disabled={isStreaming}
                className="min-h-[42px] flex-1 resize-none bg-transparent py-2 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
                style={{ maxHeight: "160px", overflowY: "auto" }}
                onInput={(e) => {
                  const t = e.currentTarget
                  t.style.height = "auto"
                  t.style.height = `${Math.min(t.scrollHeight, 160)}px`
                }}
              />

              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isStreaming}
                className="mb-0.5 rounded-xl bg-primary p-2 text-primary-foreground transition-opacity disabled:opacity-40"
                aria-label="Send message"
              >
                <ArrowUp className="size-4" />
              </button>
            </div>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              In an emergency, call <strong className="text-foreground">999</strong>. RISA AI is not a replacement for professional care.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-border bg-background px-4 py-2 text-center text-[11px] text-muted-foreground">
          Powered by{" "}
          <a
            href="https://risa.up.railway.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
          >
            <img src="/svg/RISA.svg" alt="" aria-hidden="true" className="h-3.5 w-auto" />
            RISA AI
          </a>
        </div>
      </div>

      {/* Memory panel (slide-over) */}
      {showMemory && (
        <>
          <div
            className="fixed inset-0 z-20 bg-foreground/20 backdrop-blur-sm"
            onClick={() => setShowMemory(false)}
          />
          <aside className="fixed inset-y-0 right-0 z-30 flex w-80 flex-col border-l border-border bg-background shadow-xl">
            <MemoryPanel memory={memory} onClose={() => setShowMemory(false)} />
          </aside>
        </>
      )}
    </div>
  )
}
